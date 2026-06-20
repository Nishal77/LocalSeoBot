import { Job } from "bullmq";
import { prisma } from "@/lib/prisma";
import { generateText } from "@/lib/anthropic";
import { logAudit } from "@/lib/audit";
import { queues } from "@/lib/queue";

const POST_TOPICS = [
  "weekly tip",
  "service spotlight",
  "customer success story",
  "seasonal update",
  "team story",
  "FAQ answer",
  "promotion or offer",
  "community connection",
];

export async function processGbpPostGenerate(job: Job) {
  const { businessId } = job.data as { businessId: string };
  const start = Date.now();

  try {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { botSettings: true },
    });

    if (!business || business.status !== "active") {
      await logAudit({ businessId, jobType: "gbp.post.generate", status: "skipped", details: { reason: "business inactive" } });
      return;
    }

    const postCount = await prisma.gbpPost.count({ where: { businessId } });
    const topic = POST_TOPICS[postCount % POST_TOPICS.length];
    const month = new Date().toLocaleString("default", { month: "long" });
    const settings = business.botSettings;

    const prompt = `You are a local SEO content writer for ${business.name}, a ${business.category ?? "local"} business in ${business.city ?? "the area"}.

Write a Google Business Profile post for this week. The post should:
- Be 150-250 words
- Sound like a local, real business owner wrote it (not a corporation)
- Include a reference to ${month} naturally
- Include one clear call to action
- Mention ${business.city ?? "the local area"} naturally at least once
- Focus this week on: ${topic}

Business details:
- Services: ${business.nicheTags?.join(", ") ?? business.category ?? "local services"}
- Tone: ${settings?.postTone ?? "professional"}
- Avoid: ${settings?.avoidTopics?.join(", ") ?? "nothing specific"}

Do not use emojis. Do not use hashtags. Write in plain English.
Output only the post text. No commentary.`;

    const content = await generateText(prompt, 500);

    const weekOf = new Date();
    weekOf.setHours(0, 0, 0, 0);

    const post = await prisma.gbpPost.create({
      data: {
        businessId,
        content,
        postType: "STANDARD",
        status: settings?.postApprovalRequired ? "pending_approval" : "draft",
        weekOf,
        ctaType: "CALL",
      },
    });

    if (!settings?.postApprovalRequired) {
      await queues.gbpPostPublish.add("publish", { businessId, postId: post.id });
    }

    await logAudit({
      businessId,
      jobType: "gbp.post.generate",
      status: "success",
      details: { postId: post.id, topic },
      durationMs: Date.now() - start,
    });

    return { postId: post.id };
  } catch (err) {
    await logAudit({
      businessId,
      jobType: "gbp.post.generate",
      status: "failed",
      details: { error: String(err) },
      durationMs: Date.now() - start,
    });
    throw err;
  }
}
