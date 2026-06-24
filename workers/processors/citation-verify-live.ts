/**
 * Monthly NAP accuracy check on live citations.
 * For each "live" citation, fetches the listing URL and checks
 * whether business name + phone appear on the page.
 */
import type { Job } from "bullmq";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function processCitationVerifyLive(job: Job) {
  const { businessId } = job.data as { businessId: string };
  const start = Date.now();
  let verified = 0;
  let mismatched = 0;

  try {
    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business || business.status !== "active") return;

    // Only verify citations that went live > 3 days ago and haven't been verified in 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const liveCitations = await prisma.citation.findMany({
      where: {
        businessId,
        status: "live",
        listingUrl: { not: null },
        wentLiveAt: { lt: threeDaysAgo },
        OR: [
          { lastVerifiedAt: null },
          { lastVerifiedAt: { lt: thirtyDaysAgo } },
        ],
      },
      take: 20, // Cap per run — full verification happens over multiple job runs
    });

    if (liveCitations.length === 0) {
      await logAudit({
        businessId,
        jobType: "citation.verify.live",
        status: "skipped",
        details: { reason: "no citations due for verification" },
        durationMs: Date.now() - start,
      });
      return;
    }

    const phone = (business.phone ?? "").replace(/\D/g, ""); // digits only for matching
    const nameWords = business.name.toLowerCase().split(/\s+/).filter((w) => w.length > 2);

    for (const citation of liveCitations) {
      if (!citation.listingUrl) continue;

      try {
        const res = await fetch(citation.listingUrl, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; RankAgent AI/1.0)" },
          signal: AbortSignal.timeout(10_000),
        });

        if (!res.ok) {
          // Page unreachable — mark for re-check later but don't mark as mismatch
          await prisma.citation.update({
            where: { id: citation.id },
            data: { lastVerifiedAt: new Date(), notes: `Verification fetch failed: ${res.status}` },
          });
          continue;
        }

        const html = await res.text();
        const text = html.replace(/<[^>]+>/g, " ").toLowerCase(); // strip tags

        // Check: business name (any significant word appears)
        const nameMatch = nameWords.some((word) => text.includes(word));

        // Check: phone number (digits match, ignoring formatting)
        const textDigits = text.replace(/\D/g, "");
        const phoneMatch = phone.length >= 7 && textDigits.includes(phone.slice(-7));

        const napMatch = nameMatch && phoneMatch;

        await prisma.citation.update({
          where: { id: citation.id },
          data: {
            lastVerifiedAt: new Date(),
            napMatch,
            notes: napMatch
              ? "NAP verified"
              : `NAP mismatch: name=${nameMatch}, phone=${phoneMatch}`,
          },
        });

        if (napMatch) {
          verified++;
        } else {
          mismatched++;
        }
      } catch (err) {
        await prisma.citation.update({
          where: { id: citation.id },
          data: { lastVerifiedAt: new Date(), notes: `Verification error: ${String(err)}` },
        });
      }

      // Rate limit: 1 fetch per 500ms to avoid hammering directories
      await new Promise((r) => setTimeout(r, 500));
    }

    await logAudit({
      businessId,
      jobType: "citation.verify.live",
      status: "success",
      details: { checked: liveCitations.length, verified, mismatched },
      durationMs: Date.now() - start,
    });
  } catch (err) {
    await logAudit({
      businessId,
      jobType: "citation.verify.live",
      status: "failed",
      details: { error: String(err) },
      durationMs: Date.now() - start,
    });
    throw err;
  }
}
