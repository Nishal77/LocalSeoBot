import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getDodoClient } from "@/lib/dodo";
import { checkRateLimit } from "@/lib/ratelimit";
import { z } from "zod";

const BASE = process.env.NEXTAUTH_URL ?? "https://rankagent.run";

const schema = z.object({ businessId: z.string().uuid() });

/**
 * POST /api/onboarding/complete
 * Step 7 — creates a DodoPayments checkout session and returns the URL.
 * Onboarding is NOT marked complete here. The billing webhook
 * (SubscriptionActiveWebhookEvent) activates the business and starts bot jobs
 * after successful payment.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await checkRateLimit(session.user.id, "checkout");
  if (limited) return limited;

  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    const { businessId } = parsed.data;

    const business = await prisma.business.findFirst({
      where: { id: businessId, userId: session.user.id },
      include: { user: true },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const productId = process.env.DODO_PRODUCT_ID;
    if (!productId) {
      return NextResponse.json({ error: "Billing not configured" }, { status: 503 });
    }

    const dodo = getDodoClient();

    const checkoutSession = await dodo.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: {
        email: business.user.email,
        name: business.user.name ?? business.name,
      },
      subscription_data: { trial_period_days: 14 },
      return_url: `${BASE}/dashboard?payment=success`,
    } as Parameters<typeof dodo.checkoutSessions.create>[0]);

    const checkoutUrl = (checkoutSession as unknown as { checkout_url: string }).checkout_url;

    return NextResponse.json({ checkoutUrl });
  } catch (err) {
    console.error("Onboarding complete error:", err);
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
  }
}
