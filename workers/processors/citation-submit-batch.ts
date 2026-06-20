import { Job } from "bullmq";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

const BATCH_SIZE = 10;

export async function processCitationSubmitBatch(job: Job) {
  const { businessId } = job.data as { businessId: string };
  const start = Date.now();
  let submitted = 0;

  try {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });
    if (!business || business.status !== "active") return;

    // Find pending citations not yet submitted
    const pending = await prisma.citation.findMany({
      where: { businessId, status: "pending" },
      include: { directory: true },
      orderBy: [
        { directory: { priority: "asc" } },
        { directory: { domainAuthority: "desc" } },
      ],
      take: BATCH_SIZE,
    });

    for (const citation of pending) {
      try {
        if (citation.directory.submissionType === "api") {
          // API-based submission logic per directory
          // Each directory has its own endpoint in citation_directories.api_endpoint
          // For now: mark as submitted (real impl per directory)
          await prisma.citation.update({
            where: { id: citation.id },
            data: {
              status: "submitted",
              submittedAt: new Date(),
              submissionMethod: "api",
            },
          });
          submitted++;
        } else if (citation.directory.submissionType === "manual") {
          await prisma.citation.update({
            where: { id: citation.id },
            data: { status: "submitted", submittedAt: new Date(), submissionMethod: "manual", notes: "Queued for manual processing" },
          });
          submitted++;
        } else {
          // form submission — mark as submitted, Playwright handles actual form
          await prisma.citation.update({
            where: { id: citation.id },
            data: { status: "submitted", submittedAt: new Date(), submissionMethod: "form" },
          });
          submitted++;
        }
      } catch (err) {
        await prisma.citation.update({
          where: { id: citation.id },
          data: { status: "failed", notes: String(err) },
        });
      }

      // Stagger submissions — not all at once
      await new Promise((r) => setTimeout(r, 500));
    }

    await logAudit({
      businessId,
      jobType: "citation.submit.batch",
      status: "success",
      details: { submitted, batch: pending.length },
      durationMs: Date.now() - start,
    });
  } catch (err) {
    await logAudit({
      businessId,
      jobType: "citation.submit.batch",
      status: "failed",
      details: { error: String(err) },
      durationMs: Date.now() - start,
    });
    throw err;
  }
}
