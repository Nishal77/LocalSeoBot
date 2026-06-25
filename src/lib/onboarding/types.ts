export interface HtmlAnalysis {
  businessName: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  category: string | null;
  hasSchemaMarkup: boolean;
  schemaTypes: string[];
  title: string | null;
  titleLength: number;
  metaDescription: string | null;
  descriptionLength: number;
  canonical: string | null;
  hasOgTags: boolean;
  h1Count: number;
  h1Text: string | null;
  h2Count: number;
  h3Count: number;
  imageCount: number;
  imagesWithoutAlt: number;
  internalLinks: number;
  externalLinks: number;
  wordCount: number;
  technologies: string[];
}

export interface PageSpeedData {
  score: number;
  lcp: string | null;
  fcp: string | null;
  cls: string | null;
  tbt: string | null;
  speedIndex: string | null;
}

export interface SiteData {
  ssl: boolean;
  robotsTxt: boolean;
  robotsHasDisallow: boolean;
  sitemapFound: boolean;
  sitemapUrlCount: number | null;
}

export interface RankingData {
  keyword: string;
  rank: number | null;
  category: string;
}

export interface SEOIssue {
  severity: "critical" | "warning" | "info";
  category: string;
  message: string;
}

export interface ScoreBreakdown {
  technical: number;
  performance: number;
  content: number;
  local: number;
  overall: number;
  grade: string;
}

export interface FullAnalysis {
  html: HtmlAnalysis | null;
  pageSpeed: PageSpeedData | null;
  site: SiteData;
  ranking: RankingData | null;
  scores: ScoreBreakdown;
  issues: SEOIssue[];
  aiSummary: string;
}
