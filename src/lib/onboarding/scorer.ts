import type { HtmlAnalysis, PageSpeedData, SiteData, RankingData, SEOIssue, ScoreBreakdown } from "./types";

export function detectIssues(
  html: HtmlAnalysis | null,
  pageSpeed: PageSpeedData | null,
  site: SiteData,
  ranking: RankingData | null,
): SEOIssue[] {
  const issues: SEOIssue[] = [];

  // Security
  if (!site.ssl) {
    issues.push({ severity: "critical", category: "Security", message: "Website not using HTTPS — Google penalises insecure sites" });
  }

  // robots / sitemap
  if (!site.robotsTxt) {
    issues.push({ severity: "info", category: "Technical", message: "robots.txt file not found" });
  }
  if (!site.sitemapFound) {
    issues.push({ severity: "warning", category: "Technical", message: "XML sitemap not found — harder for Google to crawl all pages" });
  }

  // Performance
  if (pageSpeed) {
    if (pageSpeed.score < 50) {
      issues.push({ severity: "critical", category: "Performance", message: `Mobile PageSpeed critically low (${pageSpeed.score}/100) — Google uses mobile-first indexing` });
    } else if (pageSpeed.score < 70) {
      issues.push({ severity: "warning", category: "Performance", message: `Mobile PageSpeed needs improvement (${pageSpeed.score}/100)` });
    }
  }

  if (html) {
    // Title
    if (!html.title) {
      issues.push({ severity: "critical", category: "Content", message: "Page title is missing — critical for search rankings" });
    } else if (html.titleLength < 30) {
      issues.push({ severity: "warning", category: "Content", message: `Title too short (${html.titleLength} chars) — aim for 50-60 characters` });
    } else if (html.titleLength > 60) {
      issues.push({ severity: "warning", category: "Content", message: `Title too long (${html.titleLength} chars) — Google truncates after 60` });
    }

    // Meta description
    if (!html.metaDescription) {
      issues.push({ severity: "critical", category: "Content", message: "Meta description missing — reduces click-through rate from search results" });
    } else if (html.descriptionLength < 70) {
      issues.push({ severity: "warning", category: "Content", message: `Meta description too short (${html.descriptionLength} chars) — aim for 120-160` });
    } else if (html.descriptionLength > 160) {
      issues.push({ severity: "info", category: "Content", message: `Meta description too long (${html.descriptionLength} chars) — Google may truncate` });
    }

    // H1
    if (html.h1Count === 0) {
      issues.push({ severity: "critical", category: "Content", message: "No H1 heading found — required for keyword relevance signals" });
    } else if (html.h1Count > 1) {
      issues.push({ severity: "warning", category: "Content", message: `Multiple H1 headings found (${html.h1Count}) — use exactly one` });
    }

    // Images
    if (html.imagesWithoutAlt > 5) {
      issues.push({ severity: "warning", category: "Content", message: `${html.imagesWithoutAlt} images missing alt text — hurts accessibility and image SEO` });
    } else if (html.imagesWithoutAlt > 0) {
      issues.push({ severity: "info", category: "Content", message: `${html.imagesWithoutAlt} image${html.imagesWithoutAlt > 1 ? "s" : ""} missing alt text` });
    }

    // Schema
    if (!html.hasSchemaMarkup) {
      issues.push({ severity: "warning", category: "Local SEO", message: "No structured data (Schema.org) — missing local business signals Google needs" });
    }

    // OG tags
    if (!html.hasOgTags) {
      issues.push({ severity: "info", category: "Social", message: "Open Graph tags missing — poor appearance when shared on social media" });
    }

    // Canonical
    if (!html.canonical) {
      issues.push({ severity: "info", category: "Technical", message: "No canonical URL tag — can cause duplicate content issues" });
    }

    // Internal links
    if (html.internalLinks < 5) {
      issues.push({ severity: "warning", category: "Technical", message: `Very low internal link count (${html.internalLinks}) — limits Google crawl depth` });
    }

    // Word count
    if (html.wordCount < 200) {
      issues.push({ severity: "warning", category: "Content", message: `Thin content (~${html.wordCount} words) — Google favors pages with 500+ words` });
    }
  }

  // Local SEO
  if (ranking && (ranking.rank === null || ranking.rank > 3)) {
    const pos = ranking.rank ? `at #${ranking.rank}` : "not in top 20";
    issues.push({ severity: "warning", category: "Local SEO", message: `Ranking ${pos} for "${ranking.keyword}" — top 3 gets 87% of clicks` });
  }

  return issues;
}

export function calculateScores(
  html: HtmlAnalysis | null,
  pageSpeed: PageSpeedData | null,
  site: SiteData,
  ranking: RankingData | null,
): ScoreBreakdown {
  // Technical (0–100)
  let technical = 0;
  if (site.ssl) technical += 30;
  if (site.robotsTxt) technical += 15;
  if (site.sitemapFound) technical += 15;
  if (html?.canonical) technical += 10;
  if (html?.hasOgTags) technical += 10;
  if ((html?.internalLinks ?? 0) >= 10) technical += 15;
  else if ((html?.internalLinks ?? 0) >= 5) technical += 8;
  if ((html?.wordCount ?? 0) >= 300) technical += 5;

  // Content (0–100)
  let content = 0;
  if (html?.title) {
    content += 20;
    if (html.titleLength >= 30 && html.titleLength <= 60) content += 10;
  }
  if (html?.metaDescription) {
    content += 20;
    if (html.descriptionLength >= 70 && html.descriptionLength <= 160) content += 10;
  }
  if (html?.h1Count === 1) content += 20;
  else if ((html?.h1Count ?? 0) > 1) content += 8;
  if ((html?.h2Count ?? 0) > 0) content += 10;
  const altRatio = html && html.imageCount > 0 ? (html.imageCount - html.imagesWithoutAlt) / html.imageCount : 1;
  if (altRatio >= 0.9) content += 10;
  else if (altRatio >= 0.7) content += 5;

  // Performance (0–100) — directly from PageSpeed
  const performance = pageSpeed?.score ?? 0;

  // Local (0–100)
  let local = 0;
  if (html?.hasSchemaMarkup) local += 35;
  if (html?.phone) local += 15;
  if (html?.city) local += 15;
  if (html?.address) local += 10;
  if (ranking?.rank) {
    if (ranking.rank <= 3) local += 25;
    else if (ranking.rank <= 7) local += 15;
    else if (ranking.rank <= 15) local += 8;
  }

  // Weighted overall
  const overall = Math.round(
    technical * 0.25 +
    content * 0.25 +
    performance * 0.30 +
    local * 0.20,
  );

  const grade =
    overall >= 80 ? "A" :
    overall >= 65 ? "B" :
    overall >= 45 ? "C" :
    overall >= 25 ? "D" : "F";

  return {
    technical: Math.min(100, technical),
    performance,
    content: Math.min(100, content),
    local: Math.min(100, local),
    overall: Math.max(5, Math.min(100, overall)),
    grade,
  };
}
