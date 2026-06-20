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

  const whopApiKey = process.env.WHOP_API_KEY;
  const whopProductId = process.env.WHOP_PRODUCT_ID;

  if (!whopApiKey || !whopProductId) {
    return NextResponse.json({ error: "Billing not configured" }, { status: 503 });
  }

  const sub = business.subscriptions[0];
  // If they already have a Whop membership, redirect to manage page
  if (sub?.whopMemberId) {
    const portalUrl = `https://whop.com/hub/${whopProductId}/`;
    return NextResponse.json({ url: portalUrl });
  }

  // No subscription yet — redirect to Whop checkout
  const checkoutUrl = `https://whop.com/checkout/${whopProductId}/`;
  return NextResponse.json({ url: checkoutUrl });
}
