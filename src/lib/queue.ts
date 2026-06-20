import { Queue, type QueueOptions, type ConnectionOptions } from "bullmq";

function getConnection(): ConnectionOptions {
  const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL;
  if (!redisUrl) {
    throw new Error("REDIS_URL or UPSTASH_REDIS_URL must be set");
  }
  return {
    url: redisUrl,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    tls: redisUrl.startsWith("rediss://") ? {} : undefined,
  };
}

function makeQueue(name: string): Queue {
  const opts: QueueOptions = {
    connection: getConnection(),
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 500 },
    },
  };
  return new Queue(name, opts);
}

let _queues: ReturnType<typeof buildQueues> | null = null;

function buildQueues() {
  return {
    gbpPostGenerate: makeQueue("gbp.post.generate"),
    gbpPostPublish: makeQueue("gbp.post.publish"),
    gbpPhotosUpload: makeQueue("gbp.photos.upload"),
    citationSubmitBatch: makeQueue("citation.submit.batch"),
    citationVerifyLive: makeQueue("citation.verify.live"),
    reviewPoll: makeQueue("review.poll"),
    reviewRespond: makeQueue("review.respond"),
    rankingCheck: makeQueue("ranking.check"),
    competitorMonitor: makeQueue("competitor.monitor"),
    reportGenerate: makeQueue("report.generate"),
    reportSend: makeQueue("report.send"),
    onboardingAudit: makeQueue("onboarding.audit"),
  } as const;
}

export function getQueues() {
  if (!_queues) _queues = buildQueues();
  return _queues;
}

// Convenience proxy — same API as before but lazy
export const queues = new Proxy({} as ReturnType<typeof buildQueues>, {
  get(_, prop) {
    return getQueues()[prop as keyof ReturnType<typeof buildQueues>];
  },
});

export type QueueName = keyof ReturnType<typeof buildQueues>;
