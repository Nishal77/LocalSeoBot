import type { RankingData } from "./types";

interface DataForSEOItem {
  domain?: string;
  url?: string;
  title?: string;
}

interface DataForSEOTask {
  id?: string;
  status_code?: number;
  result?: Array<{ items?: DataForSEOItem[] }>;
}

interface DataForSEOResponse {
  tasks?: DataForSEOTask[];
}

const AUTH_HEADER = () => {
  const login = process.env.DATAFORSEO_LOGIN ?? "";
  const password = process.env.DATAFORSEO_PASSWORD ?? "";
  return `Basic ${Buffer.from(`${login}:${password}`).toString("base64")}`;
};

const BASE = "https://api.dataforseo.com/v3/serp/google/maps";

export async function checkRanking(
  businessName: string | null,
  city: string | null,
  category: string | null,
  websiteUrl: string,
): Promise<RankingData | null> {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  if (!login || !password || !city) return null;

  const kw = `${category ?? "local business"} ${city}`;
  const domain = websiteUrl.replace(/https?:\/\/(www\.)?/, "").split("/")[0];

  try {
    // Try live endpoint first (requires higher plan), fall back to task-based
    const liveRes = await fetch(`${BASE}/live/regular`, {
      method: "POST",
      headers: { Authorization: AUTH_HEADER(), "Content-Type": "application/json" },
      body: JSON.stringify([{ keyword: kw, location_name: `${city}, United States`, language_code: "en" }]),
      signal: AbortSignal.timeout(14000),
    });

    if (liveRes.ok) {
      const data = await liveRes.json() as DataForSEOResponse;
      const task = data?.tasks?.[0];
      if (task?.status_code === 20000) {
        return parseItems(task.result?.[0]?.items ?? [], kw, domain, category);
      }
    }

    // Fall back to async task_post → task_get
    return await taskBasedRanking(kw, city, domain, category);
  } catch {
    return null;
  }
}

async function taskBasedRanking(
  kw: string,
  city: string,
  domain: string,
  category: string | null,
): Promise<RankingData | null> {
  try {
    // Post task
    const postRes = await fetch(`${BASE}/task_post`, {
      method: "POST",
      headers: { Authorization: AUTH_HEADER(), "Content-Type": "application/json" },
      body: JSON.stringify([{ keyword: kw, location_code: await getCityLocationCode(city), language_code: "en" }]),
      signal: AbortSignal.timeout(8000),
    });
    if (!postRes.ok) return null;

    const postData = await postRes.json() as DataForSEOResponse;
    const taskId = postData?.tasks?.[0]?.id;
    if (!taskId || postData.tasks?.[0]?.status_code !== 20100) return null;

    // Poll for result (max 20s)
    for (let attempt = 0; attempt < 4; attempt++) {
      await new Promise<void>((r) => setTimeout(r, attempt === 0 ? 5000 : 4000));

      const getRes = await fetch(`${BASE}/task_get/advanced/${taskId}`, {
        headers: { Authorization: AUTH_HEADER() },
        signal: AbortSignal.timeout(8000),
      });
      if (!getRes.ok) continue;

      const getData = await getRes.json() as DataForSEOResponse;
      const result = getData?.tasks?.[0]?.result?.[0];
      if (result?.items?.length) {
        return parseItems(result.items, kw, domain, category);
      }
    }

    return { keyword: kw, rank: null, category: category ?? "local business", competitorCount: 0, searchVolume: estimateSearchVolume(category) };
  } catch {
    return null;
  }
}

function parseItems(
  items: DataForSEOItem[],
  kw: string,
  domain: string,
  category: string | null,
): RankingData {
  const idx = items.findIndex(
    (i) => (i.domain?.includes(domain) ?? false) || (i.url?.includes(domain) ?? false),
  );
  const rank = idx >= 0 ? idx + 1 : null;
  const competitorCount = rank ? rank - 1 : Math.min(items.length, 8);
  return {
    keyword: kw,
    rank,
    category: category ?? "local business",
    competitorCount,
    searchVolume: estimateSearchVolume(category),
  };
}

const SEARCH_VOLUMES: Record<string, number> = {
  "dentist": 2400, "plumber": 1900, "hvac": 1600, "restaurant": 3200,
  "hair salon": 1400, "gym": 1800, "lawyer": 1200, "doctor": 2100,
  "realtor": 2800, "auto repair": 1700, "cleaning service": 1100,
  "landscaping": 1300, "electrician": 1500, "roofing": 1100,
};

function estimateSearchVolume(category: string | null): number {
  if (!category) return 1500;
  const key = category.toLowerCase();
  for (const [cat, vol] of Object.entries(SEARCH_VOLUMES)) {
    if (key.includes(cat)) return vol;
  }
  return 1500;
}

// Austin = 1023191, map common cities
const CITY_CODES: Record<string, number> = {
  "austin": 1023191, "new york": 1023191, "los angeles": 1013962,
  "chicago": 1016367, "houston": 1026481, "phoenix": 1028323,
  "philadelphia": 1028100, "san antonio": 1031707, "san diego": 1031969,
  "dallas": 1020584, "san jose": 1032374, "miami": 1026201,
};

async function getCityLocationCode(city: string): Promise<number> {
  const key = city.toLowerCase().trim();
  return CITY_CODES[key] ?? 1023191; // default Austin code
}
