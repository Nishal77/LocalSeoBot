import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/ratelimit";
import { z } from "zod";

const schema = z.object({
  businessId: z.string().uuid(),
  plan: z.string().optional(),
});

/**
 * POST /api/onboarding/complete
 * Directly marks the onboarding complete and activates the business with the selected plan.
 * Payment logic will be integrated here later.
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
    const { businessId, plan } = parsed.data;

    const business = await prisma.business.findFirst({
      where: { id: businessId, userId: session.user.id },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Direct database update to bypass checkout screens for now
    await prisma.business.update({
      where: { id: businessId },
      data: {
        onboardingComplete: true,
        plan: plan ?? "starter",
        status: "active",
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14-day trial
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Onboarding complete error:", err);
    return NextResponse.json({ error: "Failed to complete onboarding" }, { status: 500 });
  }
}
