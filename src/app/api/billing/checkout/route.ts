import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getDodoClient } from "@/lib/dodo";

const BASE = process.env.NEXTAUTH_URL ?? "https://rankagent.run";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await prisma.business.findFirst({
    where: { userId: session.user.id },
    include: { user: true },
  });
  if (!business) return NextResponse.json({ error: "No business found" }, { status: 404 });

  const productId = process.env.DODO_PRODUCT_ID;
  if (!productId) return NextResponse.json({ error: "Billing not configured" }, { status: 503 });

  try {
    const dodo = getDodoClient();

    const checkoutSession = await dodo.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: {
        email: business.user.email,
        name: business.user.name ?? business.name,
      },
      // 14-day trial
      subscription_data: { trial_period_days: 14 },
      return_url: `${BASE}/dashboard?payment=success`,
    } as Parameters<typeof dodo.checkoutSessions.create>[0]);

    const checkoutUrl = (checkoutSession as unknown as { checkout_url: string }).checkout_url;

    return NextResponse.json({ checkoutUrl });
  } catch (err) {
    console.error("DodoPayments checkout error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
