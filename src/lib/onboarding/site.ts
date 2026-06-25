import type { SiteData } from "./types";

export async function checkSite(url: string): Promise<SiteData> {
  let base = "";
  try { base = new URL(url).origin; } catch { return defaultSite(url); }

  const ssl = url.startsWith("https://");

  const [robotsResult, sitemapResult] = await Promise.allSettled([
    fetchRobots(base),
    fetchSitemap(base),
  ]);

  const robots = robotsResult.status === "fulfilled" ? robotsResult.value : null;
  const sitemap = sitemapResult.status === "fulfilled" ? sitemapResult.value : null;

  return {
    ssl,
    robotsTxt: robots?.found ?? false,
    robotsHasDisallow: robots?.hasDisallow ?? false,
    sitemapFound: sitemap?.found ?? false,
    sitemapUrlCount: sitemap?.urlCount ?? null,
  };
}

function defaultSite(url: string): SiteData {
  return {
    ssl: url.startsWith("https"),
    robotsTxt: false,
    robotsHasDisallow: false,
    sitemapFound: false,
    sitemapUrlCount: null,
  };
}

async function fetchRobots(base: string): Promise<{ found: boolean; hasDisallow: boolean }> {
  try {
    const res = await fetch(`${base}/robots.txt`, {
      signal: AbortSignal.timeout(5000),
      headers: { "User-Agent": "RankAgentAI/1.0" },
    });
    if (!res.ok) return { found: false, hasDisallow: false };
    const text = await res.text();
    return {
      found: text.length > 0,
      hasDisallow: /^Disallow:\s+\//m.test(text),
    };
  } catch {
    return { found: false, hasDisallow: false };
  }
}

async function fetchSitemap(base: string): Promise<{ found: boolean; urlCount: number | null }> {
  const candidates = [
    `${base}/sitemap.xml`,
    `${base}/sitemap_index.xml`,
    `${base}/sitemap/sitemap.xml`,
    `${base}/wp-sitemap.xml`,
  ];

  for (const candidate of candidates) {
    try {
      const res = await fetch(candidate, {
        signal: AbortSignal.timeout(5000),
        headers: { "User-Agent": "RankAgentAI/1.0" },
      });
      if (!res.ok) continue;
      const text = await res.text();
      if (!text.includes("<url") && !text.includes("<sitemap")) continue;
      const urlCount =
        (text.match(/<url>/gi)?.length ?? 0) ||
        (text.match(/<sitemap>/gi)?.length ?? 0) ||
        null;
      return { found: true, urlCount };
    } catch { /* try next */ }
  }

  return { found: false, urlCount: null };
}
