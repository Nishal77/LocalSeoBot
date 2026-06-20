import { Job } from "bullmq";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

interface DataForSEOResult {
  items?: {
    title?: string;
    place_id?: string;
    rank_group?: number;
    rank_absolute?: number;
  }[];
}

async function checkKeywordRank(
  keyword: string,
  businessName: string,
  locationCode: number
): Promise<{ mapsRank: number | null; organicRank: number | null; competitorAbove: string | null }> {
  const login = process.env.DATAFORSEO_LOGIN!;
  const password = process.env.DATAFORSEO_PASSWORD!;
  const credentials = Buffer.from(`${login}:${password}`).toString("base64");

  const res = await fetch(
    "https://api.dataforseo.com/v3/serp/google/maps/live/regular",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        {
          keyword,
          location_code: locationCode,
          language_code: "en",
          device: "desktop",
          os: "windows",
        },
      ]),
    }
  );

  if (!res.ok) throw new Error(`DataForSEO error: ${res.status}`);

  const data = await res.json() as { tasks?: { result?: DataForSEOResult[] }[] };
  const items = data.tasks?.[0]?.result?.[0]?.items ?? [];

  let mapsRank: number | null = null;
  let competitorAbove: string | null = null;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const title = item.title?.toLowerCase() ?? "";
    if (title.includes(businessName.toLowerCase())) {
      mapsRank = item.rank_group ?? i + 1;
      if (i > 0) competitorAbove = items[i - 1].title ?? null;
      break;
    }
  }

  return { mapsRank, organicRank: null, competitorAbove };
}

export async function processRankingCheck(job: Job) {
  const { businessId } = job.data as { businessId: string };
  const start = Date.now();

  try {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { keywords: { where: { isActive: true } } },
    });

    if (!business) return;

    const locationCode = 1023191; // Default: US national; should be resolved from city

    for (const kw of business.keywords) {
      try {
        const { mapsRank, organicRank, competitorAbove } = await checkKeywordRank(
          kw.keyword,
          business.name,
          locationCode
        );

        await prisma.keywordRanking.create({
          data: {
            keywordId: kw.id,
            mapsRank,
            organicRank,
            competitorAbove,
          },
        });

        await new Promise((r) => setTimeout(r, 200));
      } catch {
        // Continue on individual keyword failure
      }
    }

    await logAudit({
      businessId,
      jobType: "ranking.check",
      status: "success",
      details: { keywords: business.keywords.length },
      durationMs: Date.now() - start,
    });
  } catch (err) {
    await logAudit({
      businessId,
      jobType: "ranking.check",
      status: "failed",
      details: { error: String(err) },
      durationMs: Date.now() - start,
    });
    throw err;
  }
}
