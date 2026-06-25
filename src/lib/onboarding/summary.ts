import Anthropic from "@anthropic-ai/sdk";
import type { FullAnalysis } from "./types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function generateAiSummary(analysis: FullAnalysis): Promise<string> {
  const { html, pageSpeed, site, ranking, scores, issues } = analysis;
  const criticals = issues.filter((i) => i.severity === "critical").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;

  const context = [
    `Business: ${html?.businessName ?? "unknown"}, Category: ${html?.category ?? "unknown"}, City: ${html?.city ?? "unknown"}`,
    `Overall SEO score: ${scores.overall}/100 (Grade ${scores.grade})`,
    `Sub-scores — Technical: ${scores.technical}/100, Content: ${scores.content}/100, Performance: ${scores.performance}/100, Local: ${scores.local}/100`,
    pageSpeed
      ? `PageSpeed mobile: ${pageSpeed.score}/100 | LCP: ${pageSpeed.lcp ?? "n/a"} | FCP: ${pageSpeed.fcp ?? "n/a"} | CLS: ${pageSpeed.cls ?? "n/a"} | TBT: ${pageSpeed.tbt ?? "n/a"}`
      : "PageSpeed: unavailable",
    `HTTPS: ${site.ssl ? "yes" : "NO"} | robots.txt: ${site.robotsTxt ? "yes" : "missing"} | sitemap: ${site.sitemapFound ? `yes (${site.sitemapUrlCount ?? "?"} URLs)` : "missing"}`,
    html
      ? [
          `Title: ${html.title ? `"${html.title.slice(0, 60)}" (${html.titleLength} chars)` : "MISSING"}`,
          `Meta desc: ${html.metaDescription ? `${html.descriptionLength} chars` : "MISSING"}`,
          `H1: ${html.h1Count} | H2: ${html.h2Count} | H3: ${html.h3Count}`,
          `Images: ${html.imageCount} total, ${html.imagesWithoutAlt} without alt text`,
          `Internal links: ${html.internalLinks} | Word count: ~${html.wordCount}`,
          `Schema: ${html.hasSchemaMarkup ? html.schemaTypes.join(", ") : "NONE"}`,
          `Tech stack: ${html.technologies.length ? html.technologies.join(", ") : "undetected"}`,
        ].join(" | ")
      : "HTML analysis: failed",
    ranking
      ? `Google Maps rank: ${ranking.rank ? `#${ranking.rank}` : "not found"} for "${ranking.keyword}"`
      : "Google Maps rank: unavailable",
    `Issues: ${criticals} critical, ${warnings} warnings`,
  ].join("\n");

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: `You are a senior SEO analyst writing an honest 3-sentence audit summary for a local business website.

Website data:
${context}

Rules:
- Sentence 1: lead with one clear strength (cite specific number)
- Sentence 2: name the 1-2 most impactful issues found (specific, not vague)
- Sentence 3: quantify what improvement would unlock ("this alone could push you into top 3")
- No fluff. No "As an AI". No tool names. No "I". Direct expert voice.
- If data is poor across the board, be honest — don't sugarcoat

Output only the 3 sentences, nothing else.`,
        },
      ],
    });

    const text = response.content[0]?.type === "text" ? response.content[0].text.trim() : "";
    return text || fallbackSummary(analysis);
  } catch {
    return fallbackSummary(analysis);
  }
}

function fallbackSummary(analysis: FullAnalysis): string {
  const { scores, issues, pageSpeed, site } = analysis;
  const topCritical = issues.find((i) => i.severity === "critical");
  const topWarning = issues.find((i) => i.severity === "warning");
  const topIssue = topCritical ?? topWarning;

  const strength =
    site.ssl && scores.technical >= 50
      ? `Your website is served over HTTPS with a technical score of ${scores.technical}/100, giving it a secure foundation.`
      : pageSpeed && pageSpeed.score >= 60
      ? `Your site loads at a reasonable ${pageSpeed.score}/100 on mobile, which meets Google's baseline threshold.`
      : `Your website is live and indexable, scoring ${scores.overall}/100 overall.`;

  const weakness = topIssue
    ? `However, ${topIssue.message.toLowerCase()}, which is directly limiting your local search visibility.`
    : `Several gaps in your local SEO setup are suppressing your rankings below competitors.`;

  const opportunity =
    scores.overall < 50
      ? `Fixing these issues could move you from near-invisible to a top-3 position in local search, where 87% of customers click.`
      : `Addressing these gaps would likely push you into the top 3 Google Maps results for your area.`;

  return `${strength} ${weakness} ${opportunity}`;
}
