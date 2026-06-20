import type { Job } from "bullmq";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

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

  for (const competitor of competitors) {
    const existing = await prisma.competitorSnapshot.findFirst({
      where: { competitorId: competitor.id, snapshotDate: today },
    });
    if (existing) continue;

    await prisma.competitorSnapshot.create({
      data: {
        competitorId: competitor.id,
        snapshotDate: today,
        reviewCount: 0,
        avgRating: null,
        postCountWeek: 0,
        photoCount: 0,
      },
    });
    snapshotsCreated++;
  }

  await logAudit({
    businessId,
    jobType: "competitor.monitor",
    status: "success",
    details: { competitorCount: competitors.length, snapshotsCreated },
    durationMs: Date.now() - start,
  });
}
