import { Job } from "bullmq";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/twilio";
import { logAudit } from "@/lib/audit";

export async function processReviewRequestSend(job: Job) {
  const { reviewRequestId } = job.data as { reviewRequestId: string };
  const start = Date.now();

  try {
    const request = await prisma.reviewRequest.findUnique({
      where: { id: reviewRequestId },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            gbpLocationId: true,
            status: true,
          },
        },
      },
    });

    if (!request) {
      console.warn(`[ReviewRequestWorker] Request not found: ${reviewRequestId}`);
      return;
    }

    if (request.business.status !== "active") {
      console.warn(`[ReviewRequestWorker] Business is inactive for request: ${reviewRequestId}`);
      return;
    }

    // Generate Google review link
    // Default format: https://search.google.com/local/writereview?placeid=<id>
    const reviewLink = request.business.gbpLocationId
      ? `https://search.google.com/local/writereview?placeid=${request.business.gbpLocationId}`
      : "https://g.page/r/google-business";

    const body = `Hi ${request.customerName}, thank you for choosing ${request.business.name}! We would love to hear about your experience. Could you spare 30 seconds to leave us a quick review on Google? ${reviewLink}`;

    const res = await sendSms({
      to: request.customerPhone,
      body,
    });

    if (res.success) {
      await prisma.reviewRequest.update({
        where: { id: reviewRequestId },
        data: {
          status: "sent",
          sentAt: new Date(),
        },
      });

      await logAudit({
        businessId: request.business.id,
        jobType: "review.request.send",
        status: "success",
        details: { reviewRequestId, to: request.customerPhone, msgId: res.messageId },
        durationMs: Date.now() - start,
      });
    } else {
      await prisma.reviewRequest.update({
        where: { id: reviewRequestId },
        data: {
          status: "failed",
        },
      });

      await logAudit({
        businessId: request.business.id,
        jobType: "review.request.send",
        status: "failed",
        details: { reviewRequestId, error: res.error },
        durationMs: Date.now() - start,
      });
    }
  } catch (err) {
    console.error(`[ReviewRequestWorker] Failed to process job ${job.id}:`, err);
    throw err;
  }
}
