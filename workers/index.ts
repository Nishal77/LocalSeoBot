import "dotenv/config";
import { Worker, WorkerOptions } from "bullmq";
import { getQueues } from "@/lib/queue";
import type { ConnectionOptions } from "bullmq";

const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL;
if (!redisUrl) throw new Error("REDIS_URL or UPSTASH_REDIS_URL must be set");

const connection: ConnectionOptions = {
  url: redisUrl,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  tls: redisUrl.startsWith("rediss://") ? {} : undefined,
};

getQueues(); // ensure queues initialized
import { processGbpPostGenerate } from "./processors/gbp-post-generate";
import { processGbpPostPublish } from "./processors/gbp-post-publish";
import { processReviewPoll } from "./processors/review-poll";
import { processReviewRespond } from "./processors/review-respond";
import { processCitationSubmitBatch } from "./processors/citation-submit-batch";
import { processRankingCheck } from "./processors/ranking-check";
import { processReportGenerate } from "./processors/report-generate";
import { processReportSend } from "./processors/report-send";
import { processOnboardingAudit } from "./processors/onboarding-audit";
import { processCompetitorMonitor } from "./processors/competitor-monitor";
import { processCitationVerifyLive } from "./processors/citation-verify-live";
import { processReviewRequestSend } from "./processors/review-request-send";

const workerOptions: WorkerOptions = {
  connection,
  concurrency: 5,
};

const workers = [
  new Worker("gbp.post.generate", processGbpPostGenerate, workerOptions),
  new Worker("gbp.post.publish", processGbpPostPublish, workerOptions),
  new Worker("review.poll", processReviewPoll, workerOptions),
  new Worker("review.respond", processReviewRespond, workerOptions),
  new Worker("citation.submit.batch", processCitationSubmitBatch, workerOptions),
  new Worker("ranking.check", processRankingCheck, workerOptions),
  new Worker("report.generate", processReportGenerate, workerOptions),
  new Worker("report.send", processReportSend, workerOptions),
  new Worker("onboarding.audit", processOnboardingAudit, workerOptions),
  new Worker("competitor.monitor", processCompetitorMonitor, workerOptions),
  new Worker("citation.verify.live", processCitationVerifyLive, workerOptions),
  new Worker("review.request.send", processReviewRequestSend, workerOptions),
];

for (const worker of workers) {
  worker.on("failed", (job, err) => {
    console.error(`[Worker] Job ${job?.id} on ${worker.name} failed:`, err.message);
  });
  worker.on("completed", (job) => {
    console.log(`[Worker] Job ${job.id} on ${worker.name} completed`);
  });
}

console.log(`[Workers] ${workers.length} workers started`);

async function shutdown() {
  console.log("[Workers] Shutting down...");
  await Promise.all(workers.map((w) => w.close()));
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
