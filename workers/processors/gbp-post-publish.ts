import { Job } from "bullmq";
import { prisma } from "@/lib/prisma";
import { createGBPPost } from "@/lib/gbp";
import { logAudit } from "@/lib/audit";

export async function processGbpPostPublish(job: Job) {
  const { businessId, postId } = job.data as { businessId: string; postId: string };
  const start = Date.now();

  try {
    const [business, post] = await Promise.all([
      prisma.business.findUnique({ where: { id: businessId } }),
      prisma.gbpPost.findUnique({ where: { id: postId } }),
    ]);

    if (!business?.gbpAccountId || !business?.gbpLocationId) {
      throw new Error("Business missing GBP account/location ID");
    }

    if (!post || post.status === "published") {
      await logAudit({ businessId, jobType: "gbp.post.publish", status: "skipped", details: { postId } });
      return;
    }

    const gbpPost = await createGBPPost(
      businessId,
      business.gbpAccountId,
      business.gbpLocationId,
      {
        summary: post.content,
        callToAction: post.ctaType
          ? { actionType: post.ctaType, url: post.ctaUrl ?? undefined }
          : undefined,
        media: post.imageUrl
          ? [{ mediaFormat: "PHOTO", sourceUrl: post.imageUrl }]
          : undefined,
      }
    );

    await prisma.gbpPost.update({
      where: { id: postId },
      data: {
        status: "published",
        gbpPostId: gbpPost.name,
        publishedAt: new Date(),
        approvedBy: "auto",
      },
    });

    await logAudit({
      businessId,
      jobType: "gbp.post.publish",
      status: "success",
      details: { postId, gbpPostId: gbpPost.name },
      durationMs: Date.now() - start,
    });
  } catch (err) {
    await prisma.gbpPost.update({
      where: { id: postId },
      data: { status: "failed" },
    });
    await logAudit({
      businessId,
      jobType: "gbp.post.publish",
      status: "failed",
      details: { postId, error: String(err) },
      durationMs: Date.now() - start,
    });
    throw err;
  }
}
