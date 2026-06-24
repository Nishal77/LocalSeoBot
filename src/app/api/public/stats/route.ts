import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint — no auth. Shows aggregate platform stats for homepage social proof.
export const revalidate = 3600; // re-fetch every hour

export async function GET() {
  try {
    const [businessCount, citationsLive, reviewsResponded, postsPublished] = await Promise.all([
      prisma.business.count({ where: { onboardingComplete: true } }),
      prisma.citation.count({ where: { status: "live" } }),
      prisma.review.count({ where: { responseStatus: "posted" } }),
      prisma.gbpPost.count({ where: { status: "published" } }),
    ]);

    return NextResponse.json({
      businessCount,
      citationsLive,
      reviewsResponded,
      postsPublished,
    });
  } catch {
    // Never break the homepage — return zeros silently
    return NextResponse.json({
      businessCount: 0,
      citationsLive: 0,
      reviewsResponded: 0,
      postsPublished: 0,
    });
  }
}
