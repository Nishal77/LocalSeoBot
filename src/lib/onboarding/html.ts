import type { HtmlAnalysis } from "./types";

const TECH_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  { name: "WordPress", pattern: /wp-content|wp-includes/i },
  { name: "Shopify", pattern: /shopify|myshopify\.com/i },
  { name: "Wix", pattern: /wixsite\.com|wix\.com/i },
  { name: "Squarespace", pattern: /squarespace\.com/i },
  { name: "Webflow", pattern: /webflow\.io/i },
  { name: "Next.js", pattern: /__NEXT_DATA__|_next\/static/i },
  { name: "React", pattern: /react\.production\.min|react-dom/i },
  { name: "Vue.js", pattern: /vue\.min\.js|vue@/i },
  { name: "jQuery", pattern: /jquery[\.\-][\d\.]+\.min/i },
  { name: "Google Analytics", pattern: /google-analytics\.com\/analytics|gtag\('config'/i },
  { name: "Google Tag Manager", pattern: /googletagmanager\.com\/gtm/i },
  { name: "HubSpot", pattern: /js\.hs-scripts\.com|hubspot/i },
  { name: "Cloudflare", pattern: /cloudflare\.com/i },
  { name: "Bootstrap", pattern: /bootstrap\.min\.css|bootstrap@/i },
  { name: "Tailwind CSS", pattern: /tailwindcss|tailwind\.min/i },
];

const CATEGORY_PATTERNS: Array<{ category: string; pattern: RegExp }> = [
  { category: "dentist", pattern: /dental|dentist|orthodont|smile|teeth/i },
  { category: "plumber", pattern: /plumb|pipe.?repair|drain/i },
  { category: "hvac", pattern: /hvac|air.?condition|heating|cooling|furnace/i },
  { category: "restaurant", pattern: /restaurant|dining|cafe|pizza|bistro|eatery/i },
  { category: "hair salon", pattern: /salon|haircutt?|barber|nail.?spa/i },
  { category: "gym", pattern: /gym|fitness center|yoga studio|pilates/i },
  { category: "lawyer", pattern: /law firm|attorney|legal.?services|solicitor/i },
  { category: "doctor", pattern: /medical.?clinic|physician|family.?medicine|urgent.?care/i },
  { category: "realtor", pattern: /real.?estate|realtor|property.?agent/i },
  { category: "auto repair", pattern: /auto.?repair|car.?service|mechanic|tire/i },
  { category: "cleaning service", pattern: /cleaning.?service|maid|janitorial|house.?clean/i },
  { category: "landscaping", pattern: /landscap|lawn.?care|garden.?service/i },
  { category: "electrician", pattern: /electric|electrician|wiring/i },
  { category: "roofing", pattern: /roof|roofing|shingle/i },
];

export function analyzeHtml(html: string, siteUrl: string): HtmlAnalysis {
  let domain = "";
  try { domain = new URL(siteUrl).hostname; } catch { /* use empty */ }

  // Title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const ogTitleMatch =
    html.match(/property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ??
    html.match(/content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
  const title = (ogTitleMatch?.[1] ?? titleMatch?.[1] ?? "").trim() || null;

  // Meta description
  const descMatch =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ??
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
  const metaDescription = descMatch?.[1]?.trim() ?? null;

  // Canonical
  const canonicalMatch =
    html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) ??
    html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  const canonical = canonicalMatch?.[1]?.trim() ?? null;

  // OG tags
  const hasOgTags = /property=["']og:(title|description|image)["']/.test(html);

  // Headings
  const h1Matches = Array.from(html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi));
  const h1Count = h1Matches.length;
  const h1Text = h1Matches[0]?.[1]?.replace(/<[^>]+>/g, "").trim() ?? null;
  const h2Count = Array.from(html.matchAll(/<h2[^>]*>/gi)).length;
  const h3Count = Array.from(html.matchAll(/<h3[^>]*>/gi)).length;

  // Images
  const imgTags = Array.from(html.matchAll(/<img([^>]+)>/gi));
  const imageCount = imgTags.length;
  const imagesWithoutAlt = imgTags.filter((m) => !/alt=["'][^"']+["']/.test(m[1])).length;

  // Links
  const linkMatches = Array.from(html.matchAll(/href=["']([^"'#?]+)["']/gi));
  let internalLinks = 0;
  let externalLinks = 0;
  for (const m of linkMatches) {
    const href = m[1];
    if (!href || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) continue;
    if (href.startsWith("/") || (domain && href.includes(domain))) {
      internalLinks++;
    } else if (href.startsWith("http")) {
      externalLinks++;
    }
  }

  // Word count (strip tags, count words > 2 chars)
  const textContent = html.replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const wordCount = textContent.split(/\s+/).filter((w) => w.length > 2).length;

  // Phone
  const phoneMatch = html.match(/\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/);
  const phone = phoneMatch?.[0] ?? null;

  // Technologies
  const technologies: string[] = [];
  for (const tech of TECH_PATTERNS) {
    if (tech.pattern.test(html)) technologies.push(tech.name);
  }

  // Schema.org JSON-LD
  let businessName: string | null = null;
  let city: string | null = null;
  let state: string | null = null;
  let address: string | null = null;
  let category: string | null = null;
  let hasSchemaMarkup = false;
  const schemaTypes: string[] = [];

  const schemaRe = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = schemaRe.exec(html)) !== null) {
    try {
      const raw: unknown = JSON.parse(m[1]);
      const items: unknown[] = Array.isArray(raw) ? raw : [raw];
      for (const item of items) {
        const obj = item as Record<string, unknown>;
        const type = String(obj["@type"] ?? "");
        if (type) schemaTypes.push(type);
        if (/LocalBusiness|MedicalBusiness|FoodEstablishment|HomeAndConstructionBusiness|LegalService|HealthAndBeautyBusiness|SportsActivityLocation/i.test(type)) {
          hasSchemaMarkup = true;
          businessName = (obj.name as string) ?? null;
          const addr = obj.address as Record<string, string> | null;
          city = addr?.addressLocality ?? null;
          state = addr?.addressRegion ?? null;
          address = addr?.streetAddress ?? null;
          category = type.replace("LocalBusiness", "local business");
        }
      }
    } catch { /* ignore */ }
  }

  // Business name fallback
  if (!businessName && title) {
    businessName = title.split(/[|\-–—]/)[0].trim() || null;
  }

  // Category detection fallback
  if (!category) {
    const searchText = [businessName, metaDescription, textContent.slice(0, 600)].filter(Boolean).join(" ");
    for (const { category: cat, pattern } of CATEGORY_PATTERNS) {
      if (pattern.test(searchText)) { category = cat; break; }
    }
  }

  return {
    businessName,
    phone,
    address,
    city,
    state,
    category,
    hasSchemaMarkup,
    schemaTypes,
    title,
    titleLength: title?.length ?? 0,
    metaDescription,
    descriptionLength: metaDescription?.length ?? 0,
    canonical,
    hasOgTags,
    h1Count,
    h1Text,
    h2Count,
    h3Count,
    imageCount,
    imagesWithoutAlt,
    internalLinks,
    externalLinks,
    wordCount,
    technologies,
  };
}

export async function scrapeWebsite(url: string): Promise<HtmlAnalysis | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; RankAgentAI/1.0; +https://rankagentai.com)",
        "Accept": "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) return null;
    const html = await res.text();
    return analyzeHtml(html, url);
  } catch {
    return null;
  }
}
