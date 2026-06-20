import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await prisma.business.findFirst({ where: { userId: session.user.id } });
  if (!business) return NextResponse.json({ error: "No business found" }, { status: 404 });

  const reports = await prisma.weeklyReport.findMany({
    where: { businessId: business.id },
    orderBy: { weekOf: "desc" },
    select: {
      id: true,
      weekOf: true,
      postsPublished: true,
      citationsSubmitted: true,
      citationsLive: true,
      reviewsResponded: true,
      avgRatingThisWeek: true,
      keywordsImproved: true,
      keywordsDeclined: true,
      sentAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ reports });
}
