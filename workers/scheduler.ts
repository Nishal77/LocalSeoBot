/**
 * Global job scheduler — runs on Railway alongside workers.
 * Enqueues jobs for ALL active businesses on their scheduled cadence.
 * Uses cron-like approach: runs every minute, checks if it's time to fire each job type.
 */
import "dotenv/config";
import { getQueues } from "@/lib/queue";
import { prisma } from "@/lib/prisma";

type ScheduleKey =
  | "review.poll"
  | "gbp.post.generate"
  | "citation.submit.batch"
  | "ranking.check"
  | "competitor.monitor"
  | "report.generate";

const SCHEDULES: Record<ScheduleKey, (now: Date) => boolean> = {
  "review.poll": (_now) => true, // every tick (30-min interval enforced below)
  "gbp.post.generate": (now) => now.getDay() === 1 && now.getHours() === 6 && now.getMinutes() < 5,
  "citation.submit.batch": (now) => now.getHours() === 9 && now.getMinutes() < 5,
  "ranking.check": (now) => now.getDay() === 1 && now.getHours() === 5 && now.getMinutes() < 5,
  "competitor.monitor": (now) => now.getDay() === 1 && now.getHours() === 7 && now.getMinutes() < 5,
  "report.generate": (now) => now.getDay() === 1 && now.getHours() === 7 && now.getMinutes() >= 5 && now.getMinutes() < 10,
};

// Track last review.poll fire per business to enforce 30-min minimum
const lastReviewPoll = new Map<string, number>();

async function tick() {
  const now = new Date();
  const queues = getQueues();

  const businesses = await prisma.business.findMany({
    where: { status: "active" },
    select: { id: true },
  });

  if (businesses.length === 0) return;

  for (const { id: businessId } of businesses) {
    // review.poll: every 30 minutes
    const lastPoll = lastReviewPoll.get(businessId) ?? 0;
    if (Date.now() - lastPoll >= 30 * 60 * 1000) {
      await queues.reviewPoll.add("review.poll", { businessId }, {
        jobId: `review.poll:${businessId}:${Date.now()}`,
      });
      lastReviewPoll.set(businessId, Date.now());
    }

    // Other scheduled jobs
    for (const [jobName, shouldRun] of Object.entries(SCHEDULES) as [ScheduleKey, (d: Date) => boolean][]) {
      if (jobName === "review.poll") continue;
      if (!shouldRun(now)) continue;

      const dateKey = `${now.toISOString().slice(0, 10)}`;
      const jobId = `${jobName}:${businessId}:${dateKey}`;

      const queue = {
        "gbp.post.generate": queues.gbpPostGenerate,
        "citation.submit.batch": queues.citationSubmitBatch,
        "ranking.check": queues.rankingCheck,
        "competitor.monitor": queues.competitorMonitor,
        "report.generate": queues.reportGenerate,
      }[jobName];

      if (!queue) continue;

      // add with deduplicate jobId — won't duplicate if already enqueued today
      await queue.add(jobName, { businessId }, { jobId }).catch(() => {
        // job already exists with this ID, skip
      });
    }
  }
}

async function run() {
  console.log("[Scheduler] Starting...");

  // Run immediately then every 60 seconds
  await tick().catch((err: unknown) => console.error("[Scheduler] tick error:", err));

  setInterval(() => {
    tick().catch((err: unknown) => console.error("[Scheduler] tick error:", err));
  }, 60_000);
}

run().catch((err) => {
  console.error("[Scheduler] Fatal error:", err);
  process.exit(1);
});
