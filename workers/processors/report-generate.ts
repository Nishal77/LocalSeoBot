import { Job } from "bullmq";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { queues } from "@/lib/queue";
import { startOfWeek, endOfWeek, format } from "date-fns";

export async function processReportGenerate(job: Job) {
  const { businessId } = job.data as { businessId: string };
  const start = Date.now();

  try {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

    const [business, postsPublished, citations, reviews, keywords] = await Promise.all([
      prisma.business.findUnique({ where: { id: businessId } }),
      prisma.gbpPost.count({
        where: { businessId, status: "published", publishedAt: { gte: weekStart, lte: weekEnd } },
      }),
      prisma.citation.findMany({
        where: { businessId },
        include: { directory: true },
      }),
      prisma.review.findMany({
        where: { businessId, reviewDate: { gte: weekStart, lte: weekEnd } },
        orderBy: { reviewDate: "desc" },
        take: 5,
      }),
      prisma.keyword.findMany({
        where: { businessId, isActive: true },
        include: {
          rankings: {
            orderBy: { checkedAt: "desc" },
            take: 2,
          },
        },
      }),
    ]);

    if (!business) return;

    const citationsLive = citations.filter((c) => c.status === "live").length;
    const citationsSubmitted = citations.filter(
      (c) => c.submittedAt && c.submittedAt >= weekStart && c.submittedAt <= weekEnd
    ).length;
    const reviewsResponded = reviews.filter((r) => r.responseStatus === "posted").length;

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((s, r) => s + (r.starRating ?? 0), 0) / reviews.length
        : null;

    // Keyword changes
    let improved = 0, declined = 0;
    const rankingHighlights: string[] = [];

    for (const kw of keywords) {
      if (kw.rankings.length >= 2) {
        const current = kw.rankings[0].mapsRank;
        const prev = kw.rankings[1].mapsRank;
        if (current !== null && prev !== null) {
          if (current < prev) {
            improved++;
            rankingHighlights.push(`↑ "${kw.keyword}" — moved from #${prev} to #${current}`);
          } else if (current > prev) {
            declined++;
            rankingHighlights.push(`↓ "${kw.keyword}" — moved from #${prev} to #${current}`);
          } else {
            rankingHighlights.push(`→ "${kw.keyword}" — holding at #${current}`);
          }
        }
      }
    }

    const reportHtml = `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <h2>${business.name} | Week of ${format(weekStart, "MMMM d, yyyy")}</h2>

  <h3>THIS WEEK'S WORK</h3>
  <ul>
    <li>✓ ${postsPublished} Google post${postsPublished !== 1 ? "s" : ""} published</li>
    <li>✓ ${citationsSubmitted} new citations submitted (${citationsLive} total live)</li>
    <li>✓ ${reviewsResponded} reviews responded to</li>
    <li>✓ Rankings checked for ${keywords.length} keywords</li>
  </ul>

  <h3>RANKING HIGHLIGHTS</h3>
  ${rankingHighlights.length > 0
    ? `<ul>${rankingHighlights.map((h) => `<li>${h}</li>`).join("")}</ul>`
    : "<p>No ranking changes this week.</p>"}

  <h3>REVIEW SUMMARY</h3>
  <p>New this week: ${reviews.length} reviews${avgRating ? ` | Average: ${avgRating.toFixed(1)} stars` : ""}</p>
  ${reviews
    .slice(0, 2)
    .map(
      (r) => `
    <div style="border-left: 3px solid #ddd; padding-left: 12px; margin: 8px 0;">
      <strong>${r.reviewerName ?? "Anonymous"}</strong> — ${"★".repeat(r.starRating ?? 0)}
      <p>${r.reviewText ?? "(no text)"}</p>
      ${r.responseText ? `<p><em>Bot response: ${r.responseText}</em></p>` : ""}
    </div>
  `
    )
    .join("")}

  <h3>CITATION PROGRESS</h3>
  <p>${citationsLive}/200 directories live | ${citationsSubmitted} submitted this week</p>

  <p><a href="${process.env.NEXTAUTH_URL}/dashboard">See full dashboard →</a></p>
</div>
`.trim();

    const report = await prisma.weeklyReport.upsert({
      where: {
        id: (await prisma.weeklyReport.findFirst({
          where: { businessId, weekOf: weekStart },
          select: { id: true },
        }))?.id ?? "new",
      },
      create: {
        businessId,
        weekOf: weekStart,
        postsPublished,
        citationsSubmitted,
        citationsLive,
        reviewsResponded,
        avgRatingThisWeek: avgRating,
        keywordsImproved: improved,
        keywordsDeclined: declined,
        reportHtml,
      },
      update: {
        postsPublished,
        citationsSubmitted,
        citationsLive,
        reviewsResponded,
        avgRatingThisWeek: avgRating,
        keywordsImproved: improved,
        keywordsDeclined: declined,
        reportHtml,
      },
    });

    await queues.reportSend.add("send", { businessId, reportId: report.id });

    await logAudit({
      businessId,
      jobType: "report.generate",
      status: "success",
      details: { reportId: report.id },
      durationMs: Date.now() - start,
    });
  } catch (err) {
    await logAudit({
      businessId,
      jobType: "report.generate",
      status: "failed",
      details: { error: String(err) },
      durationMs: Date.now() - start,
    });
    throw err;
  }
}
