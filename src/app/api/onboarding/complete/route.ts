import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { queues } from "@/lib/queue";
import { addDays } from "date-fns";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json() as { businessId?: string };
    const { businessId } = body;

    if (!businessId) {
      return NextResponse.json({ error: "businessId required" }, { status: 400 });
    }

    const business = await prisma.business.findFirst({
      where: { id: businessId, userId: session.user.id },
    });

    if (!business) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const trialEnd = addDays(new Date(), 14);

    // Create trial subscription
    await prisma.subscription.upsert({
      where: {
        id: (await prisma.subscription.findFirst({ where: { businessId } }))?.id ?? "new",
      },
      create: {
        businessId,
        plan: "starter",
        status: "trialing",
        trialStart: new Date(),
        trialEnd,
      },
      update: {
        status: "trialing",
        trialStart: new Date(),
        trialEnd,
      },
    });

    await prisma.business.update({
      where: { id: businessId },
      data: { onboardingComplete: true, trialEndsAt: trialEnd },
    });

    // Schedule the recurring jobs for this business
    // Review poll every 30 minutes (via cron-like repeating job)
    await queues.reviewPoll.add(
      "poll",
      { businessId },
      { repeat: { every: 30 * 60 * 1000 } }
    );

    // GBP post generate every Monday at 6am
    await queues.gbpPostGenerate.add(
      "weekly",
      { businessId },
      { repeat: { pattern: "0 6 * * 1" } }
    );

    // Citation batch daily at 9am
    await queues.citationSubmitBatch.add(
      "daily",
      { businessId },
      { repeat: { pattern: "0 9 * * *" } }
    );

    // Rankings every Monday at 5am
    await queues.rankingCheck.add(
      "weekly",
      { businessId },
      { repeat: { pattern: "0 5 * * 1" } }
    );

    // Report generate every Monday at 7am
    await queues.reportGenerate.add(
      "weekly",
      { businessId },
      { repeat: { pattern: "0 7 * * 1" } }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Onboarding complete error:", err);
    return NextResponse.json({ error: "Failed to complete onboarding" }, { status: 500 });
  }
}
