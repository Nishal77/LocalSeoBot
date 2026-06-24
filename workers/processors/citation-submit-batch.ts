import type { Job } from "bullmq";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { submitViaApi } from "../lib/citation-api";
import { submitCitationForm } from "../lib/citation-form";
import { sendCitationManualAlert } from "../lib/email";

const BATCH_SIZE = 10;
const STAGGER_MS = 2_000; // 2 seconds between submissions

export async function processCitationSubmitBatch(job: Job) {
  const { businessId } = job.data as { businessId: string };
  const start = Date.now();
  let submitted = 0;
  let failed = 0;
  let manual = 0;

  try {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });
    if (!business || business.status !== "active") return;

    const nap = {
      name: business.name,
      phone: business.phone ?? "",
      website: business.websiteUrl ?? undefined,
      address: [business.addressLine1, business.addressLine2].filter(Boolean).join(" "),
      city: business.city ?? "",
      state: business.state ?? "",
      zip: business.zip ?? "",
      category: business.category ?? "local business",
    };

    // Highest domain authority / priority first, skip already-attempted
    const pending = await prisma.citation.findMany({
      where: { businessId, status: "pending" },
      include: { directory: true },
      orderBy: [
        { directory: { priority: "asc" } },
        { directory: { domainAuthority: "desc" } },
      ],
      take: BATCH_SIZE,
    });

    if (pending.length === 0) {
      await logAudit({
        businessId,
        jobType: "citation.submit.batch",
        status: "skipped",
        details: { reason: "no pending citations" },
        durationMs: Date.now() - start,
      });
      return;
    }

    for (const citation of pending) {
      const dir = citation.directory;
      let status: string;
      let method: string;
      let notes: string | undefined;
      let listingUrl: string | undefined;

      try {
        if (dir.submissionType === "manual") {
          status = "submitted";
          method = "manual";
          notes = `Queued for manual ops: ${dir.name}. Add-business URL: ${dir.url ?? dir.formUrl ?? "N/A"}`;
          manual++;
          sendCitationManualAlert({
            citationId: citation.id,
            businessName: business.name,
            directoryName: dir.name,
            directoryUrl: dir.url ?? dir.formUrl ?? null,
            reason: "Directory type requires manual submission (partner login / human verification)",
            nap,
          }).catch(() => {});
        } else if (dir.submissionType === "api") {
          const result = await submitViaApi(dir.name, nap);

          if (result.success) {
            status = "submitted";
            method = "api";
            listingUrl = result.listingUrl;
            submitted++;
          } else if (result.needsManual) {
            status = "submitted";
            method = "manual";
            notes = result.error ?? "Requires manual ops";
            manual++;
            sendCitationManualAlert({ citationId: citation.id, businessName: business.name, directoryName: dir.name, directoryUrl: dir.url ?? dir.formUrl ?? null, reason: result.error ?? "API — requires partner login", nap }).catch(() => {});
          } else {
            // needsForm — fall through to Playwright form submission
            const formResult = await submitCitationForm(dir.name, dir.formUrl ?? null, nap);

            if (formResult.success) {
              status = "submitted";
              method = "form";
              listingUrl = formResult.listingUrl;
              submitted++;
            } else if (formResult.needsManual) {
              status = "submitted";
              method = "manual";
              notes = formResult.error ?? "Requires manual submission";
              manual++;
              sendCitationManualAlert({ citationId: citation.id, businessName: business.name, directoryName: dir.name, directoryUrl: dir.url ?? dir.formUrl ?? null, reason: formResult.error ?? "CAPTCHA on form fallback", nap }).catch(() => {});
            } else {
              status = "failed";
              method = "form";
              notes = formResult.error;
              failed++;
            }
          }
        } else {
          // form type
          const result = await submitCitationForm(dir.name, dir.formUrl ?? null, nap);

          if (result.success) {
            status = "submitted";
            method = "form";
            listingUrl = result.listingUrl;
            submitted++;
          } else if (result.needsManual) {
            status = "submitted";
            method = "manual";
            notes = result.error ?? "CAPTCHA or login wall — manual required";
            manual++;
            sendCitationManualAlert({ citationId: citation.id, businessName: business.name, directoryName: dir.name, directoryUrl: dir.url ?? dir.formUrl ?? null, reason: result.error ?? "CAPTCHA detected", nap }).catch(() => {});
          } else {
            status = "failed";
            method = "form";
            notes = result.error;
            failed++;
          }
        }

        await prisma.citation.update({
          where: { id: citation.id },
          data: {
            status,
            submittedAt: new Date(),
            submissionMethod: method,
            listingUrl: listingUrl ?? undefined,
            notes: notes ?? undefined,
          },
        });
      } catch (err) {
        failed++;
        await prisma.citation.update({
          where: { id: citation.id },
          data: { status: "failed", notes: String(err) },
        });
      }

      // Stagger to look natural and avoid rate limits
      await new Promise((r) => setTimeout(r, STAGGER_MS));
    }

    await logAudit({
      businessId,
      jobType: "citation.submit.batch",
      status: "success",
      details: {
        batchSize: pending.length,
        submitted,
        manual,
        failed,
        directoryName: pending[0]?.directory?.name,
      },
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
