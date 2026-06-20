import { Job } from "bullmq";
import { prisma } from "@/lib/prisma";
import { getGBPReviews } from "@/lib/gbp";
import { logAudit } from "@/lib/audit";
import { queues } from "@/lib/queue";

interface GBPReview {
  reviewId: string;
  reviewer: { displayName: string; profilePhotoUrl?: string };
  starRating: string;
  comment?: string;
  createTime: string;
  reviewReply?: { comment: string };
}

const STAR_MAP: Record<string, number> = {
  ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5,
};

export async function processReviewPoll(job: Job) {
  const { businessId } = job.data as { businessId: string };
  const start = Date.now();
  let newCount = 0;

  try {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business?.gbpAccountId || !business?.gbpLocationId || business.status !== "active") {
      return;
    }

    const data = await getGBPReviews(
      businessId,
      business.gbpAccountId,
      business.gbpLocationId
    );

    const reviews: GBPReview[] = data.reviews ?? [];

    for (const review of reviews) {
      const existing = await prisma.review.findUnique({
        where: { googleReviewId: review.reviewId },
      });
      if (existing) continue;

      const stars = STAR_MAP[review.starRating] ?? 0;
      const sentiment = stars >= 4 ? "positive" : stars === 3 ? "neutral" : "negative";

      const created = await prisma.review.create({
        data: {
          businessId,
          googleReviewId: review.reviewId,
          reviewerName: review.reviewer.displayName,
          reviewerPhotoUrl: review.reviewer.profilePhotoUrl,
          starRating: stars,
          reviewText: review.comment,
          reviewDate: new Date(review.createTime),
          sentiment,
          responseStatus: review.reviewReply ? "posted" : "pending",
          responseText: review.reviewReply?.comment,
        },
      });

      if (!review.reviewReply) {
        await queues.reviewRespond.add("respond", {
          businessId,
          reviewId: created.id,
        });
        newCount++;
      }
    }

    await logAudit({
      businessId,
      jobType: "review.poll",
      status: "success",
      details: { total: reviews.length, new: newCount },
      durationMs: Date.now() - start,
    });
  } catch (err) {
    await logAudit({
      businessId,
      jobType: "review.poll",
      status: "failed",
      details: { error: String(err) },
      durationMs: Date.now() - start,
    });
    throw err;
  }
}
