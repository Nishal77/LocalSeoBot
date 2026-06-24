import { NextResponse } from "next/server";
import { getDodoClient } from "@/lib/dodo";
import { prisma } from "@/lib/prisma";
import { getQueues } from "@/lib/queue";
import { addDays } from "date-fns";

export const runtime = "nodejs";

// DodoPayments requires raw body for signature verification
export async function POST(req: Request) {
  const rawBody = await req.text();

  const webhookKey = process.env.DODO_PAYMENTS_WEBHOOK_KEY;
  if (!webhookKey) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  let event: { type: string; data: Record<string, unknown> };

  try {
    const dodo = getDodoClient();
    const unwrapped = dodo.webhooks.unwrap(rawBody, {
      headers: {
        "webhook-id": req.headers.get("webhook-id") ?? "",
        "webhook-signature": req.headers.get("webhook-signature") ?? "",
        "webhook-timestamp": req.headers.get("webhook-timestamp") ?? "",
      },
    });
    event = unwrapped as unknown as { type: string; data: Record<string, unknown> };
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  // Idempotency — check if event already processed
  const eventId = req.headers.get("webhook-id") ?? "";
  if (eventId) {
    const alreadyProcessed = await prisma.auditLog.findFirst({
      where: { jobType: "billing.webhook", details: { path: ["eventId"], equals: eventId } },
      select: { id: true },
    });
    if (alreadyProcessed) {
      return NextResponse.json({ received: true, skipped: "duplicate" });
    }
  }

  try {
    await handleEvent(event.type, event.data, eventId);
  } catch (err) {
    console.error("[DodoWebhook] handler error:", err);
    // Return 200 to prevent retries for logic errors; log for ops
  }

  return NextResponse.json({ received: true });
}

async function handleEvent(
  type: string,
  data: Record<string, unknown>,
  eventId: string
) {
  // Record this event for idempotency before processing
  if (eventId) {
    await prisma.auditLog.create({
      data: {
        jobType: "billing.webhook",
        status: "success",
        details: { eventId, type },
      },
    }).catch(() => {}); // non-blocking
  }
  // Extract customer email — present on all subscription events
  const customerEmail =
    (data.customer as Record<string, unknown> | undefined)?.email as string | undefined;

  const dodoSubscriptionId = data.subscription_id as string | undefined;
  const dodoCustomerId = (data.customer as Record<string, unknown> | undefined)?.customer_id as string | undefined;

  switch (type) {
    case "SubscriptionActiveWebhookEvent": {
      // Trial started OR payment succeeded — activate business
      if (!customerEmail) break;

      const user = await prisma.user.findUnique({ where: { email: customerEmail } });
      if (!user) break;

      const business = await prisma.business.findFirst({
        where: { userId: user.id },
      });
      if (!business) break;

      const trialEnd = addDays(new Date(), 14);

      await prisma.subscription.upsert({
        where: {
          id:
            (await prisma.subscription.findFirst({ where: { businessId: business.id } }))?.id ??
            "new",
        },
        create: {
          businessId: business.id,
          dodoSubscriptionId,
          dodoCustomerId,
          plan: "starter",
          status: "trialing",
          trialStart: new Date(),
          trialEnd,
        },
        update: {
          dodoSubscriptionId,
          dodoCustomerId,
          status: "trialing",
          trialStart: new Date(),
          trialEnd,
        },
      });

      await prisma.business.update({
        where: { id: business.id },
        data: { onboardingComplete: true, trialEndsAt: trialEnd },
      });

      // Start recurring bot jobs
      const queues = getQueues();
      await Promise.allSettled([
        queues.reviewPoll.add("poll", { businessId: business.id }, { repeat: { every: 30 * 60 * 1000 } }),
        queues.gbpPostGenerate.add("weekly", { businessId: business.id }, { repeat: { pattern: "0 6 * * 1" } }),
        queues.citationSubmitBatch.add("daily", { businessId: business.id }, { repeat: { pattern: "0 9 * * *" } }),
        queues.rankingCheck.add("weekly", { businessId: business.id }, { repeat: { pattern: "0 5 * * 1" } }),
        queues.reportGenerate.add("weekly", { businessId: business.id }, { repeat: { pattern: "0 7 * * 1" } }),
      ]);

      // Onboarding complete email
      const { sendOnboardingCompleteEmail } = await import("@/lib/emails");
      await sendOnboardingCompleteEmail({ to: customerEmail, businessName: business.name });
      break;
    }

    case "SubscriptionRenewedWebhookEvent": {
      if (!dodoSubscriptionId) break;
      await prisma.subscription.updateMany({
        where: { dodoSubscriptionId },
        data: { status: "active" },
      });
      break;
    }

    case "SubscriptionCancelledWebhookEvent": {
      if (!dodoSubscriptionId) break;
      await prisma.subscription.updateMany({
        where: { dodoSubscriptionId },
        data: { status: "cancelled", cancelledAt: new Date() },
      });
      // Pause bot
      const sub = await prisma.subscription.findFirst({ where: { dodoSubscriptionId } });
      if (sub?.businessId) {
        await prisma.business.update({
          where: { id: sub.businessId },
          data: { status: "paused" },
        });
      }
      break;
    }

    case "SubscriptionExpiredWebhookEvent": {
      if (!dodoSubscriptionId) break;
      const sub = await prisma.subscription.findFirst({ where: { dodoSubscriptionId } });
      if (!sub?.businessId) break;

      await prisma.subscription.update({ where: { id: sub.id }, data: { status: "expired" } });
      await prisma.business.update({ where: { id: sub.businessId }, data: { status: "paused" } });

      // Trial ended email
      const business = await prisma.business.findUnique({
        where: { id: sub.businessId },
        include: { user: true },
      });
      if (business) {
        const { sendTrialEndedEmail } = await import("@/lib/emails");
        await sendTrialEndedEmail({ to: business.user.email, businessName: business.name });
      }
      break;
    }

    case "PaymentFailedWebhookEvent": {
      if (!customerEmail) break;
      const user = await prisma.user.findUnique({ where: { email: customerEmail } });
      if (!user) break;
      const business = await prisma.business.findFirst({
        where: { userId: user.id },
        include: { user: true },
      });
      if (!business) break;

      await prisma.subscription.updateMany({
        where: { businessId: business.id },
        data: { status: "past_due" },
      });

      const { sendPaymentFailedEmail } = await import("@/lib/emails");
      await sendPaymentFailedEmail({ to: customerEmail, businessName: business.name });
      break;
    }

    case "SubscriptionOnHoldWebhookEvent": {
      if (!dodoSubscriptionId) break;
      await prisma.subscription.updateMany({
        where: { dodoSubscriptionId },
        data: { status: "past_due" },
      });
      break;
    }

    default:
      break;
  }
}
