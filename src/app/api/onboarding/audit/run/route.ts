import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { queues } from "@/lib/queue";

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

    // Verify business belongs to user
    const business = await prisma.business.findFirst({
      where: { id: businessId, userId: session.user.id },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    const job = await queues.onboardingAudit.add("audit", { businessId });

    return NextResponse.json({ jobId: job.id });
  } catch (err) {
    console.error("Audit run error:", err);
    return NextResponse.json({ error: "Failed to start audit" }, { status: 500 });
  }
}
