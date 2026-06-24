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

    const BASE = process.env.NEXTAUTH_URL ?? "https://rankagent.run";
    const weekLabel = format(weekStart, "MMMM d, yyyy");
    const citationPct = Math.min(100, Math.round((citationsLive / 200) * 100));

    const metricCard = (value: string, label: string) => `
      <td width="25%" style="padding:0 6px 0 0;text-align:center">
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px 8px">
          <div style="font-size:22px;font-weight:700;color:#0f172a">${value}</div>
          <div style="font-size:11px;color:#64748b;margin-top:4px;text-transform:uppercase;letter-spacing:0.5px">${label}</div>
        </div>
      </td>`;

    const rankRow = (text: string) => {
      const up = text.startsWith("↑");
      const down = text.startsWith("↓");
      const color = up ? "#16a34a" : down ? "#dc2626" : "#64748b";
      return `<tr><td style="padding:6px 0;border-bottom:1px solid #f1f5f9;color:${color};font-size:14px">${text}</td></tr>`;
    };

    const reportHtml = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden">

  <!-- Header -->
  <tr><td style="background:#2563eb;padding:24px 32px">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><span style="color:#fff;font-size:18px;font-weight:700">RankAgent AI</span></td>
      <td align="right"><span style="color:#93c5fd;font-size:13px">Week of ${weekLabel}</span></td>
    </tr></table>
  </td></tr>

  <!-- Business name -->
  <tr><td style="padding:24px 32px 16px">
    <h1 style="margin:0;font-size:20px;font-weight:700;color:#0f172a">${business.name}</h1>
    <p style="margin:4px 0 0;color:#64748b;font-size:14px">Your weekly SEO report</p>
  </td></tr>

  <!-- Metric cards -->
  <tr><td style="padding:0 32px 24px">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      ${metricCard(String(postsPublished), "Posts Published")}
      ${metricCard(`${citationsLive}/200`, "Citations Live")}
      ${metricCard(String(reviewsResponded), "Reviews Replied")}
      ${metricCard(avgRating ? `${avgRating.toFixed(1)}★` : "—", "Avg Rating")}
    </tr></table>
  </td></tr>

  <!-- Divider -->
  <tr><td style="padding:0 32px"><div style="border-top:1px solid #e2e8f0"></div></td></tr>

  <!-- This week's work -->
  <tr><td style="padding:24px 32px 0">
    <h2 style="margin:0 0 16px;font-size:15px;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:0.5px">This week's work</h2>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${[
        [`✓ ${postsPublished} Google post${postsPublished !== 1 ? "s" : ""} published`, "#16a34a"],
        [`✓ ${citationsSubmitted} new citations submitted (${citationsLive} total live)`, "#16a34a"],
        [`✓ ${reviewsResponded} review${reviewsResponded !== 1 ? "s" : ""} responded to`, "#16a34a"],
        [`✓ Rankings tracked for ${keywords.length} keywords`, "#16a34a"],
      ].map(([text, color]) => `<tr><td style="padding:6px 0;font-size:14px;color:${color}">${text}</td></tr>`).join("")}
    </table>
  </td></tr>

  <!-- Ranking highlights -->
  <tr><td style="padding:24px 32px 0">
    <h2 style="margin:0 0 12px;font-size:15px;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:0.5px">Ranking highlights</h2>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${rankingHighlights.length > 0
        ? rankingHighlights.map(rankRow).join("")
        : `<tr><td style="padding:6px 0;color:#94a3b8;font-size:14px">No ranking changes this week — rankings are stable.</td></tr>`}
    </table>
  </td></tr>

  <!-- Review summary -->
  ${reviews.length > 0 ? `
  <tr><td style="padding:24px 32px 0">
    <h2 style="margin:0 0 12px;font-size:15px;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:0.5px">
      Reviews this week (${reviews.length}${avgRating ? ` · avg ${avgRating.toFixed(1)}★` : ""})
    </h2>
    ${reviews.slice(0, 2).map((r) => `
    <div style="border-left:3px solid #2563eb;padding:12px 16px;margin:0 0 12px;background:#f8fafc;border-radius:0 8px 8px 0">
      <div style="font-weight:600;font-size:14px;color:#0f172a;margin-bottom:4px">
        ${r.reviewerName ?? "Anonymous"} <span style="color:#f59e0b">${"★".repeat(r.starRating ?? 0)}${"☆".repeat(5 - (r.starRating ?? 0))}</span>
      </div>
      <div style="font-size:13px;color:#475569;font-style:italic;margin-bottom:8px">"${(r.reviewText ?? "").slice(0, 160)}${(r.reviewText ?? "").length > 160 ? "…" : ""}"</div>
      ${r.responseText ? `<div style="font-size:13px;color:#16a34a">✓ Bot responded: "${r.responseText.slice(0, 120)}${r.responseText.length > 120 ? "…" : ""}"</div>` : ""}
    </div>`).join("")}
  </td></tr>` : ""}

  <!-- Citation progress -->
  <tr><td style="padding:24px 32px 0">
    <h2 style="margin:0 0 12px;font-size:15px;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:0.5px">Citation progress</h2>
    <div style="background:#f1f5f9;border-radius:6px;height:10px;overflow:hidden;margin-bottom:8px">
      <div style="background:#2563eb;height:10px;width:${citationPct}%;border-radius:6px"></div>
    </div>
    <p style="margin:0;font-size:13px;color:#64748b">${citationsLive} / 200 directories live · ${citationsSubmitted} submitted this week</p>
  </td></tr>

  <!-- CTA -->
  <tr><td style="padding:28px 32px">
    <a href="${BASE}/dashboard" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px">View full dashboard →</a>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0">
    <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center">
      RankAgent AI · Your local SEO, running itself ·
      <a href="${BASE}/dashboard/settings" style="color:#94a3b8;text-decoration:none">Settings</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`;

    const reportData = {
      postsPublished,
      citationsSubmitted,
      citationsLive,
      reviewsResponded,
      avgRatingThisWeek: avgRating,
      keywordsImproved: improved,
      keywordsDeclined: declined,
      reportHtml,
    };

    const existing = await prisma.weeklyReport.findFirst({
      where: { businessId, weekOf: weekStart },
      select: { id: true },
    });

    const report = existing
      ? await prisma.weeklyReport.update({ where: { id: existing.id }, data: reportData })
      : await prisma.weeklyReport.create({ data: { businessId, weekOf: weekStart, ...reportData } });

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
