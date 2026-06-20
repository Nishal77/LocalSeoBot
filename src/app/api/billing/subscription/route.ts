import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await prisma.business.findFirst({
    where: { userId: session.user.id },
    include: { subscriptions: { take: 1, orderBy: { createdAt: "desc" } } },
  });
  if (!business) return NextResponse.json({ error: "No business found" }, { status: 404 });

  const sub = business.subscriptions[0];
  if (!sub) return NextResponse.json({ subscription: null });

  const trialEnd = sub.trialEnd;
  const daysLeftInTrial = trialEnd
    ? Math.max(0, Math.ceil((new Date(trialEnd).getTime() - Date.now()) / 86400000))
    : null;

  return NextResponse.json({
    subscription: {
      id: sub.id,
      status: sub.status,
      plan: sub.plan,
      trialEnd: sub.trialEnd,
      currentPeriodEnd: sub.currentPeriodEnd,
      daysLeftInTrial,
      whopMemberId: sub.whopMemberId,
    },
  });
}
