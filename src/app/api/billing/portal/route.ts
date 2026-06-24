import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const BASE = process.env.NEXTAUTH_URL ?? "https://rankagent.run";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await prisma.business.findFirst({
    where: { userId: session.user.id },
    include: { subscriptions: { take: 1, orderBy: { createdAt: "desc" } } },
  });
  if (!business) return NextResponse.json({ error: "No business found" }, { status: 404 });

  const sub = business.subscriptions[0];

  // Active subscription — link to DodoPayments customer portal
  if (sub?.dodoCustomerId) {
    const portalUrl = `https://app.dodopayments.com/portal/${sub.dodoCustomerId}`;
    return NextResponse.redirect(portalUrl);
  }

  // No subscription — send to checkout
  return NextResponse.redirect(`${BASE}/api/billing/checkout`);
}
