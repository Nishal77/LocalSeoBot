import type { Job } from "bullmq";
import { prisma } from "@/lib/prisma";
import { generateText } from "@/lib/anthropic";
import { logAudit } from "@/lib/audit";
import { queues } from "@/lib/queue";
import { sendPostApprovalEmail } from "../lib/email";

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

// Maps business category to Unsplash search terms for relevant imagery
const CATEGORY_IMAGE_QUERIES: Record<string, string> = {
  dentist: "dental clinic bright modern",
  plumber: "plumbing pipes tools",
  hvac: "air conditioning hvac technician",
  restaurant: "restaurant food plating",
  salon: "hair salon styling",
  gym: "fitness gym workout",
  lawyer: "law office professional",
  realtor: "real estate house keys",
  doctor: "medical clinic doctor",
  default: "local business storefront professional",
};

async function fetchUnsplashImage(category: string): Promise<string | null> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return null;

  const catLower = (category ?? "").toLowerCase();
  const query =
    Object.entries(CATEGORY_IMAGE_QUERIES).find(([k]) => catLower.includes(k))?.[1] ??
    CATEGORY_IMAGE_QUERIES.default;

  try {
    const res = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape&content_filter=high`,
      {
        headers: { Authorization: `Client-ID ${key}` },
        signal: AbortSignal.timeout(8_000),
      }
    );
    if (!res.ok) return null;
    const data = await res.json() as { urls?: { regular?: string } };
    return data.urls?.regular ?? null;
  } catch {
    return null;
  }
}

export async function processGbpPostGenerate(job: Job) {
  const { businessId } = job.data as { businessId: string };
  const start = Date.now();

  try {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { botSettings: true, user: true },
    });

    if (!business || business.status !== "active") {
      await logAudit({
        businessId,
        jobType: "gbp.post.generate",
        status: "skipped",
        details: { reason: "business inactive" },
      });
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

    const [content, imageUrl] = await Promise.all([
      generateText(prompt, 500),
      fetchUnsplashImage(business.category ?? ""),
    ]);

    const weekOf = new Date();
    weekOf.setHours(0, 0, 0, 0);

    const needsApproval = settings?.postApprovalRequired ?? false;

    const post = await prisma.gbpPost.create({
      data: {
        businessId,
        content,
        imageUrl: imageUrl ?? undefined,
        postType: "STANDARD",
        status: needsApproval ? "pending_approval" : "draft",
        weekOf,
        ctaType: "CALL",
      },
    });

    if (needsApproval) {
      // Send approval email to business owner
      const ownerEmail = business.user.email;
      await sendPostApprovalEmail({
        to: ownerEmail,
        businessName: business.name,
        postId: post.id,
        content,
      });

      await prisma.gbpPost.update({
        where: { id: post.id },
        data: { approvalSentAt: new Date() },
      });
    } else {
      // No approval needed — queue publish immediately
      await queues.gbpPostPublish.add("publish", { businessId, postId: post.id });
    }

    await logAudit({
      businessId,
      jobType: "gbp.post.generate",
      status: "success",
      details: { postId: post.id, topic, hasImage: !!imageUrl, needsApproval },
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
