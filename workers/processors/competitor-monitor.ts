import type { Job } from "bullmq";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

interface PlacesResult {
  result?: {
    name?: string;
    rating?: number;
    user_ratings_total?: number;
    photos?: unknown[];
  };
  status?: string;
}

async function fetchPlaceData(placeId: string): Promise<{
  rating: number | null;
  reviewCount: number | null;
  photoCount: number | null;
}> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return { rating: null, reviewCount: null, photoCount: null };

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=rating,user_ratings_total,photos&key=${key}`,
      { signal: AbortSignal.timeout(8_000) }
    );
    if (!res.ok) return { rating: null, reviewCount: null, photoCount: null };

    const data = await res.json() as PlacesResult;
    if (data.status !== "OK" || !data.result) return { rating: null, reviewCount: null, photoCount: null };

    return {
      rating: data.result.rating ?? null,
      reviewCount: data.result.user_ratings_total ?? null,
      photoCount: data.result.photos?.length ?? null,
    };
  } catch {
    return { rating: null, reviewCount: null, photoCount: null };
  }
}

interface CompetitorMonitorJob {
  businessId: string;
}

export async function processCompetitorMonitor(job: Job<CompetitorMonitorJob>) {
  const { businessId } = job.data;
  const start = Date.now();

  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business) throw new Error(`Business ${businessId} not found`);

  const competitors = await prisma.competitor.findMany({ where: { businessId } });
  if (competitors.length === 0) {
    await logAudit({ businessId, jobType: "competitor.monitor", status: "skipped", details: { reason: "no competitors" }, durationMs: Date.now() - start });
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let snapshotsCreated = 0;
  const alerts: string[] = [];

  // Get yesterday's snapshot for change detection
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  for (const competitor of competitors) {
    const existing = await prisma.competitorSnapshot.findFirst({
      where: { competitorId: competitor.id, snapshotDate: today },
    });
    if (existing) continue;

    // Fetch real data from Google Places API using competitor's GBP place_id
    const placeData = competitor.gbpLocationId
      ? await fetchPlaceData(competitor.gbpLocationId)
      : { rating: null, reviewCount: null, photoCount: null };

    await prisma.competitorSnapshot.create({
      data: {
        competitorId: competitor.id,
        snapshotDate: today,
        reviewCount: placeData.reviewCount,
        avgRating: placeData.rating,
        postCountWeek: 0, // GBP API doesn't expose competitor posts
        photoCount: placeData.photoCount,
      },
    });
    snapshotsCreated++;

    // Change detection: compare to previous snapshot
    if (placeData.reviewCount !== null) {
      const prev = await prisma.competitorSnapshot.findFirst({
        where: { competitorId: competitor.id, snapshotDate: { lt: today } },
        orderBy: { snapshotDate: "desc" },
      });

      if (prev?.reviewCount && placeData.reviewCount - prev.reviewCount >= 5) {
        alerts.push(
          `${competitor.name ?? "A competitor"} got ${placeData.reviewCount - prev.reviewCount} new reviews this week (now at ${placeData.reviewCount})`
        );
      }

      if (prev?.avgRating && placeData.rating && Math.abs(placeData.rating - Number(prev.avgRating)) >= 0.2) {
        const dir = placeData.rating > Number(prev.avgRating) ? "rose" : "dropped";
        alerts.push(
          `${competitor.name ?? "A competitor"}'s rating ${dir} to ${placeData.rating} (was ${Number(prev.avgRating).toFixed(1)})`
        );
      }
    }

    // Rate limit: 1 Places API call per second
    await new Promise((r) => setTimeout(r, 1_000));
  }

  await logAudit({
    businessId,
    jobType: "competitor.monitor",
    status: "success",
    details: { competitorCount: competitors.length, snapshotsCreated, alerts },
    durationMs: Date.now() - start,
  });
}
