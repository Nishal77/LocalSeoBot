import { Job } from "bullmq";
import { prisma } from "@/lib/prisma";
import { generateText } from "@/lib/anthropic";
import { replyToGBPReview } from "@/lib/gbp";
import { logAudit } from "@/lib/audit";

export async function processReviewRespond(job: Job) {
  const { businessId, reviewId } = job.data as { businessId: string; reviewId: string };
  const start = Date.now();

  try {
    const [business, review] = await Promise.all([
      prisma.business.findUnique({
        where: { id: businessId },
        include: { botSettings: true },
      }),
      prisma.review.findUnique({ where: { id: reviewId } }),
    ]);

    if (!business || !review) throw new Error("Business or review not found");
    if (review.responseStatus === "posted") return;

    const stars = review.starRating ?? 0;
    let toneGuide: string;
    if (stars >= 5) {
      toneGuide = "grateful, warm response, invite them back";
    } else if (stars === 4) {
      toneGuide = "acknowledge any mild complaint specifically, invite them to reach out directly";
    } else if (stars === 3) {
      toneGuide = "empathetic response, address specific concerns, offer to make it right";
    } else {
      toneGuide = "calm, professional, non-defensive, invite private resolution, do NOT offer discounts publicly";
    }

    const firstName = review.reviewerName?.split(" ")[0] ?? "there";

    const prompt = `You are responding to a Google review on behalf of ${business.name}, a ${business.category ?? "local business"} in ${business.city ?? "the area"}.

Review (star rating: ${stars}/5):
"${review.reviewText ?? "(no text)"}"

Reviewer name: ${review.reviewerName ?? "Customer"}

Write a response that:
- Opens with the reviewer's first name (${firstName})
- Is 50-100 words
- Sounds like the owner wrote it, not a corporation
- Addresses the specific content of the review (not generic)
- Tone: ${toneGuide}
- Does NOT say "Thank you for your review" as the first sentence (too generic)
- Does NOT use exclamation marks more than once

Business owner name: ${business.name} Team
Tone: ${business.botSettings?.postTone ?? "professional"}

Output only the response text. No commentary.`;

    const responseText = await generateText(prompt, 300);

    await prisma.review.update({
      where: { id: reviewId },
      data: {
        responseText,
        responseGeneratedAt: new Date(),
        responseStatus: business.botSettings?.reviewApprovalRequired
          ? "pending_approval"
          : "draft",
      },
    });

    if (!business.botSettings?.reviewApprovalRequired) {
      if (!business.gbpAccountId || !business.gbpLocationId || !review.googleReviewId) {
        throw new Error("Missing GBP credentials for review reply");
      }

      await replyToGBPReview(
        businessId,
        business.gbpAccountId,
        business.gbpLocationId,
        review.googleReviewId,
        responseText
      );

      await prisma.review.update({
        where: { id: reviewId },
        data: {
          responseStatus: "posted",
          responsePostedAt: new Date(),
          respondedBy: "bot",
        },
      });
    }

    await logAudit({
      businessId,
      jobType: "review.respond",
      status: "success",
      details: { reviewId, stars },
      durationMs: Date.now() - start,
    });
  } catch (err) {
    await prisma.review.update({
      where: { id: reviewId },
      data: { responseStatus: "failed" },
    }).catch(() => {});

    await logAudit({
      businessId,
      jobType: "review.respond",
      status: "failed",
      details: { reviewId, error: String(err) },
      durationMs: Date.now() - start,
    });
    throw err;
  }
}
