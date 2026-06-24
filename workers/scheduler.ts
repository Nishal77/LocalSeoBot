/**
 * Global job scheduler — runs on Railway alongside workers.
 * Enqueues jobs for ALL active businesses on their scheduled cadence.
 * Also handles auto-approve timeouts for posts and review responses.
 */
import "dotenv/config";
import { getQueues } from "@/lib/queue";
import { prisma } from "@/lib/prisma";
import { sendTrialEndingEmail } from "@/lib/emails";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL ?? process.env.UPSTASH_REDIS_URL ?? "");

type ScheduleKey =
  | "review.poll"
  | "gbp.post.generate"
  | "citation.submit.batch"
  | "citation.verify.live"
  | "ranking.check"
  | "competitor.monitor"
  | "report.generate";

const SCHEDULES: Record<ScheduleKey, (now: Date) => boolean> = {
  "review.poll": (_now) => true, // every tick (30-min interval enforced below)
  "gbp.post.generate": (now) => now.getDay() === 1 && now.getHours() === 6 && now.getMinutes() < 5,
  "citation.submit.batch": (now) => now.getHours() === 9 && now.getMinutes() < 5,
  "citation.verify.live": (now) =>
    // First Monday of the month, 4am
    now.getDay() === 1 &&
    now.getDate() <= 7 &&
    now.getHours() === 4 &&
    now.getMinutes() < 5,
  "ranking.check": (now) => now.getDay() === 1 && now.getHours() === 5 && now.getMinutes() < 5,
  "competitor.monitor": (now) =>
    now.getDay() === 1 && now.getHours() === 7 && now.getMinutes() < 5,
  "report.generate": (now) =>
    now.getDay() === 1 &&
    now.getHours() === 7 &&
    now.getMinutes() >= 5 &&
    now.getMinutes() < 10,
};

// Redis keys for dedup (survive restarts)
const reviewPollKey = (businessId: string) => `scheduler:review-poll-last:${businessId}`;
const trialWarnKey = (businessId: string) => `scheduler:trial-warn-sent:${businessId}`;

// Auto-approve: posts/reviews pending approval past their timeout get published automatically
async function runAutoApproveTimeouts() {
  const businesses = await prisma.business.findMany({
    where: { status: "active" },
    include: { botSettings: true },
  });

  for (const business of businesses) {
    const hours = business.botSettings?.reviewAutoPostAfterHours ?? 4;
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);

    // --- Auto-approve pending review responses ---
    const timedOutReviews = await prisma.review.findMany({
      where: {
        businessId: business.id,
        responseStatus: "pending_approval",
        approvalSentAt: { lt: cutoff },
        responseText: { not: null },
        googleReviewId: { not: null },
      },
    });

    for (const review of timedOutReviews) {
      try {
        const queues = getQueues();
        await queues.reviewRespond.add(
          "auto-approve",
          { businessId: business.id, reviewId: review.id, skipGeneration: true },
          { jobId: `auto-approve:review:${review.id}` }
        ).catch(() => {}); // already queued = fine

        await prisma.review.update({
          where: { id: review.id },
          data: { responseStatus: "draft" },
        });
      } catch (err) {
        console.error(`[Scheduler] Auto-approve review ${review.id} failed:`, err);
      }
    }

    // --- Auto-approve pending GBP posts ---
    const timedOutPosts = await prisma.gbpPost.findMany({
      where: {
        businessId: business.id,
        status: "pending_approval",
        approvalSentAt: { lt: cutoff },
        content: { not: "" },
      },
    });

    for (const post of timedOutPosts) {
      try {
        const queues = getQueues();
        // Queue for publish — gbp-post-publish handles the actual GBP API call
        await queues.gbpPostPublish.add(
          "publish",
          { businessId: business.id, postId: post.id },
          { jobId: `auto-approve:post:${post.id}` }
        ).catch(() => {}); // already queued = fine

        await prisma.gbpPost.update({
          where: { id: post.id },
          data: {
            status: "draft", // publish job will set to "published"
            approvedAt: new Date(),
            approvedBy: "auto",
          },
        });
      } catch (err) {
        console.error(`[Scheduler] Auto-approve post ${post.id} failed:`, err);
      }
    }
  }
}

async function checkTrialEnding(now: Date) {
  // Only run once daily at 10am
  if (now.getHours() !== 10 || now.getMinutes() >= 5) return;

  const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const businesses = await prisma.business.findMany({
    where: {
      trialEndsAt: { gte: now, lte: in3Days },
      status: "active",
    },
    include: { user: true },
  });

  for (const business of businesses) {
    if (!business.user?.email) continue;
    // Redis SET NX with 4-day TTL — survives scheduler restarts, fires at most once per trial
    const alreadySent = await redis.set(trialWarnKey(business.id), "1", "EX", 4 * 24 * 60 * 60, "NX");
    if (alreadySent === null) continue; // already set → already sent

    try {
      const trialEnd = business.trialEndsAt!;
      const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      await sendTrialEndingEmail({
        to: business.user.email,
        businessName: business.name,
        daysLeft,
        trialEndDate: trialEnd.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      });
    } catch (err) {
      console.error(`[Scheduler] Trial ending email failed for ${business.id}:`, err);
    }
  }
}

async function tick() {
  const now = new Date();
  const queues = getQueues();

  const businesses = await prisma.business.findMany({
    where: { status: "active" },
    select: { id: true },
  });

  if (businesses.length === 0) return;

  for (const { id: businessId } of businesses) {
    // review.poll: every 30 minutes — Redis NX with 25-min TTL (5-min grace)
    const pollSet = await redis.set(reviewPollKey(businessId), "1", "EX", 25 * 60, "NX");
    if (pollSet !== null) {
      await queues.reviewPoll.add("review.poll", { businessId }, {
        jobId: `review.poll:${businessId}:${Math.floor(Date.now() / (30 * 60 * 1000))}`,
      });
    }

    // All other scheduled jobs
    for (const [jobName, shouldRun] of Object.entries(SCHEDULES) as [ScheduleKey, (d: Date) => boolean][]) {
      if (jobName === "review.poll") continue;
      if (!shouldRun(now)) continue;

      const dateKey = now.toISOString().slice(0, 10);
      const jobId = `${jobName}:${businessId}:${dateKey}`;

      const queue = {
        "gbp.post.generate": queues.gbpPostGenerate,
        "citation.submit.batch": queues.citationSubmitBatch,
        "citation.verify.live": queues.citationVerifyLive,
        "ranking.check": queues.rankingCheck,
        "competitor.monitor": queues.competitorMonitor,
        "report.generate": queues.reportGenerate,
      }[jobName];

      if (!queue) continue;

      await queue.add(jobName, { businessId }, { jobId }).catch(() => {});
    }
  }

  // Auto-approve timeouts — runs every tick (every 60s is fine, DB query is cheap)
  await runAutoApproveTimeouts().catch((err) =>
    console.error("[Scheduler] auto-approve error:", err)
  );

  // Trial-ending warning emails — runs once daily at 10am
  await checkTrialEnding(now).catch((err) =>
    console.error("[Scheduler] trial-ending check error:", err)
  );
}

async function run() {
  console.log("[Scheduler] Starting...");

  await tick().catch((err: unknown) => console.error("[Scheduler] tick error:", err));

  setInterval(() => {
    tick().catch((err: unknown) => console.error("[Scheduler] tick error:", err));
  }, 60_000);
}

run().catch((err) => {
  console.error("[Scheduler] Fatal error:", err);
  process.exit(1);
});
