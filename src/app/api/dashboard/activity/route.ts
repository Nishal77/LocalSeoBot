import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await prisma.business.findFirst({ where: { userId: session.user.id } });
  if (!business) return NextResponse.json({ error: "No business found" }, { status: 404 });

  const logs = await prisma.auditLog.findMany({
    where: { businessId: business.id, status: "success" },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  const activity = logs.map((log) => {
    let label = "";
    const details = log.details as Record<string, unknown>;

    switch (log.jobType) {
      case "gbp.post.publish":
        label = `GBP post published`;
        break;
      case "review.respond":
        label = `Review responded to — ${String(details?.reviewerName ?? "customer")}`;
        break;
      case "citation.submit.batch":
        label = `Citation submitted — ${String(details?.directoryName ?? "directory")}`;
        break;
      case "ranking.check":
        label = `Rankings checked for ${String(details?.keywordCount ?? 0)} keywords`;
        break;
      case "report.send":
        label = `Weekly report sent to your email`;
        break;
      case "onboarding.audit":
        label = `Initial audit completed (score: ${String(details?.score ?? "?")}%)`;
        break;
      default:
        label = (log.jobType ?? "").replace(/\./g, " ");
    }

    return {
      id: log.id,
      label,
      jobType: log.jobType,
      createdAt: log.createdAt,
    };
  });

  return NextResponse.json({ activity });
}
