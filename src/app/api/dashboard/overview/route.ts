import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await prisma.business.findFirst({
    where: { userId: session.user.id },
    include: {
      subscriptions: { take: 1, orderBy: { createdAt: "desc" } },
      botSettings: true,
    },
  });
  if (!business) return NextResponse.json({ error: "No business found" }, { status: 404 });

  const [citationsLive, citationsTotal, reviewStats, keywords] = await Promise.all([
    prisma.citation.count({ where: { businessId: business.id, status: "live" } }),
    prisma.citation.count({ where: { businessId: business.id } }),
    prisma.review.aggregate({
      where: { businessId: business.id },
      _count: { id: true },
      _avg: { starRating: true },
    }),
    prisma.keyword.findMany({
      where: { businessId: business.id, isActive: true },
      include: { rankings: { orderBy: { checkedAt: "desc" }, take: 1 } },
    }),
  ]);

  const rankedKeywords = keywords.filter((k) => k.rankings[0]?.mapsRank != null);
  const avgRank = rankedKeywords.length > 0
    ? rankedKeywords.reduce((sum, k) => sum + (k.rankings[0]?.mapsRank ?? 0), 0) / rankedKeywords.length
    : null;

  const sub = business.subscriptions[0];
  const trialEndsAt = sub?.trialEnd ?? null;
  const daysLeftInTrial = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86400000))
    : null;

  return NextResponse.json({
    business: {
      id: business.id,
      name: business.name,
      status: business.status,
      city: business.city,
      category: business.category,
    },
    subscription: sub
      ? { status: sub.status, plan: sub.plan, trialEnd: sub.trialEnd, daysLeftInTrial }
      : null,
    metrics: {
      citationsLive,
      citationsTotal,
      reviewCount: reviewStats._count.id,
      avgRating: reviewStats._avg.starRating ? Number(reviewStats._avg.starRating.toFixed(1)) : null,
      avgRank: avgRank ? Number(avgRank.toFixed(1)) : null,
      keywordCount: keywords.length,
    },
    botSettings: business.botSettings,
  });
}
