import { NextResponse } from "next/server";
import { scrapeWebsite } from "@/lib/onboarding/html";
import { checkSite } from "@/lib/onboarding/site";
import { getPageSpeed } from "@/lib/onboarding/pagespeed";
import { checkRanking } from "@/lib/onboarding/ranking";
import { detectIssues, calculateScores } from "@/lib/onboarding/scorer";
import { generateAiSummary } from "@/lib/onboarding/summary";
import type { FullAnalysis, SiteData } from "@/lib/onboarding/types";

export async function POST(req: Request) {
  const body = await req.json() as { url?: string };
  if (!body.url?.trim()) {
    return NextResponse.json({ error: "url required" }, { status: 400 });
  }

  const url = body.url.trim().startsWith("http") ? body.url.trim() : `https://${body.url.trim()}`;

  // Phase 1 — parallel: HTML scrape + site checks + PageSpeed
  const [htmlResult, siteResult, pageSpeedResult] = await Promise.allSettled([
    scrapeWebsite(url),
    checkSite(url),
    getPageSpeed(url),
  ]);

  const html = htmlResult.status === "fulfilled" ? htmlResult.value : null;
  const site: SiteData = siteResult.status === "fulfilled"
    ? siteResult.value
    : {
        ssl: url.startsWith("https"),
        robotsTxt: false,
        robotsHasDisallow: false,
        sitemapFound: false,
        sitemapUrlCount: null,
      };
  const pageSpeed = pageSpeedResult.status === "fulfilled" ? pageSpeedResult.value : null;

  // Phase 2 — ranking (needs html city/category)
  const [rankingResult] = await Promise.allSettled([
    checkRanking(
      html?.businessName ?? null,
      html?.city ?? null,
      html?.category ?? null,
      url,
    ),
  ]);
  const ranking = rankingResult.status === "fulfilled" ? rankingResult.value : null;

  // Scoring + issues (synchronous)
  const issues = detectIssues(html, pageSpeed, site, ranking);
  const scores = calculateScores(html, pageSpeed, site, ranking);

  // Phase 3 — AI summary (uses all findings)
  const partial: Omit<FullAnalysis, "aiSummary"> = { html, pageSpeed, site, ranking, scores, issues };
  const aiSummary = await generateAiSummary({ ...partial, aiSummary: "" });

  const result: FullAnalysis = { ...partial, aiSummary };

  return NextResponse.json(result);
}
