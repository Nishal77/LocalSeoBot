import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get("businessId");

  if (!businessId) {
    return NextResponse.json({ error: "businessId required" }, { status: 400 });
  }

  const business = await prisma.business.findFirst({
    where: { id: businessId, userId: session.user.id },
    select: { onboardingComplete: true },
  });

  if (!business) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Check audit log for completion
  const log = await prisma.auditLog.findFirst({
    where: { businessId, jobType: "onboarding.audit" },
    orderBy: { createdAt: "desc" },
  });

  if (!log || log.status === null) {
    return NextResponse.json({ status: "pending" });
  }

  if (log.status === "failed") {
    return NextResponse.json({ status: "failed", error: "Audit failed" });
  }

  const details = log.details as Record<string, unknown> | null;

  return NextResponse.json({
    status: "completed",
    result: {
      score: (details?.score as number) ?? 50,
      issues: (details?.issues as string[]) ?? [],
    },
  });
}
