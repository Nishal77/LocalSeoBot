import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHmac } from "crypto";

async function verifyWhopWebhook(req: Request): Promise<{ valid: boolean; body: string }> {
  const body = await req.text();
  const signature = req.headers.get("x-whop-signature") ?? "";
  const secret = process.env.WHOP_WEBHOOK_SECRET ?? "";

  const expected = createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return { valid: signature === `sha256=${expected}`, body };
}

interface WhopEvent {
  event: string;
  data: {
    id?: string;
    user?: { id?: string; email?: string };
    product?: { id?: string };
    status?: string;
    renewal_period_start?: number;
    renewal_period_end?: number;
    cancel_at?: number;
  };
}

export async function POST(req: Request) {
  const { valid, body } = await verifyWhopWebhook(req);

  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body) as WhopEvent;

  try {
    switch (event.event) {
      case "membership.went_valid": {
        // User subscribed or trial started
        const whopMemberId = event.data.id;
        const userEmail = event.data.user?.email;

        if (!userEmail || !whopMemberId) break;

        const user = await prisma.user.findUnique({ where: { email: userEmail } });
        if (!user) break;

        const business = await prisma.business.findFirst({
          where: { userId: user.id },
        });
        if (!business) break;

        await prisma.subscription.upsert({
          where: {
            id: (await prisma.subscription.findFirst({ where: { businessId: business.id } }))?.id ?? "new",
          },
          create: {
            businessId: business.id,
            whopMemberId,
            plan: "starter",
            status: "active",
            currentPeriodStart: event.data.renewal_period_start
              ? new Date(event.data.renewal_period_start * 1000) : new Date(),
            currentPeriodEnd: event.data.renewal_period_end
              ? new Date(event.data.renewal_period_end * 1000) : undefined,
          },
          update: {
            whopMemberId,
            status: "active",
            currentPeriodStart: event.data.renewal_period_start
              ? new Date(event.data.renewal_period_start * 1000) : undefined,
            currentPeriodEnd: event.data.renewal_period_end
              ? new Date(event.data.renewal_period_end * 1000) : undefined,
          },
        });

        await prisma.business.update({
          where: { id: business.id },
          data: { status: "active" },
        });
        break;
      }

      case "membership.went_invalid": {
        const whopMemberId = event.data.id;
        if (!whopMemberId) break;

        const subscription = await prisma.subscription.findFirst({
          where: { whopMemberId },
        });
        if (!subscription) break;

        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: "cancelled",
            cancelledAt: new Date(),
          },
        });

        await prisma.business.update({
          where: { id: subscription.businessId },
          data: { status: "paused" },
        });
        break;
      }

      case "membership.updated": {
        const whopMemberId = event.data.id;
        if (!whopMemberId) break;

        const subscription = await prisma.subscription.findFirst({
          where: { whopMemberId },
        });
        if (!subscription) break;

        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: event.data.status ?? undefined,
            currentPeriodEnd: event.data.renewal_period_end
              ? new Date(event.data.renewal_period_end * 1000) : undefined,
          },
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Whop webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
