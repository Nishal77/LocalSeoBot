import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await prisma.business.findFirst({ where: { userId: session.user.id } });
  if (!business) return NextResponse.json({ error: "No business found" }, { status: 404 });

  const [pending, submitted, live, failed] = await Promise.all([
    prisma.citation.count({ where: { businessId: business.id, status: "pending" } }),
    prisma.citation.count({ where: { businessId: business.id, status: "submitted" } }),
    prisma.citation.count({ where: { businessId: business.id, status: "live" } }),
    prisma.citation.count({ where: { businessId: business.id, status: "failed" } }),
  ]);

  return NextResponse.json({ pending, submitted, live, failed, total: pending + submitted + live + failed });
}
