import type { PageSpeedData } from "./types";

interface LighthouseAudit {
  displayValue?: string;
  score?: number | null;
  numericValue?: number;
}

interface PageSpeedResponse {
  lighthouseResult?: {
    categories?: { performance?: { score?: number } };
    audits?: Record<string, LighthouseAudit>;
  };
}

export async function getPageSpeed(url: string): Promise<PageSpeedData | null> {
  try {
    const key = process.env.GOOGLE_PAGESPEED_API_KEY ?? "";
    const endpoint =
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed` +
      `?url=${encodeURIComponent(url)}&strategy=mobile` +
      (key ? `&key=${key}` : "");

    const res = await fetch(endpoint, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) return null;

    const data = await res.json() as PageSpeedResponse;
    const lh = data.lighthouseResult;
    if (!lh) return null;

    const score = Math.round((lh.categories?.performance?.score ?? 0) * 100);

    return {
      score,
      lcp: lh.audits?.["largest-contentful-paint"]?.displayValue ?? null,
      fcp: lh.audits?.["first-contentful-paint"]?.displayValue ?? null,
      cls: lh.audits?.["cumulative-layout-shift"]?.displayValue ?? null,
      tbt: lh.audits?.["total-blocking-time"]?.displayValue ?? null,
      speedIndex: lh.audits?.["speed-index"]?.displayValue ?? null,
    };
  } catch {
    return null;
  }
}
