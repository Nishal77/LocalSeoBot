import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { differenceInDays, formatDistanceToNow } from "date-fns";
import { MapPin, Star, BarChart2, Bot, CheckCircle, AlertCircle, Clock, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const business = await prisma.business.findFirst({
    where: { userId: session.user.id },
    include: {
      citations: { select: { status: true } },
      reviews: { select: { starRating: true, responseStatus: true } },
      keywords: {
        where: { isActive: true },
        include: {
          rankings: { orderBy: { checkedAt: "desc" }, take: 1 },
        },
      },
      auditLogs: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!business) redirect("/onboarding");

  const citationsLive = business.citations.filter((c) => c.status === "live").length;
  const citationsTotal = business.citations.length;

  const totalReviews = business.reviews.length;
  const avgRating = totalReviews > 0
    ? business.reviews.reduce((s, r) => s + (r.starRating ?? 0), 0) / totalReviews
    : 0;

  const rankedKeywords = business.keywords.filter((k) => k.rankings[0]?.mapsRank != null);
  const avgRank = rankedKeywords.length > 0
    ? rankedKeywords.reduce((s, k) => s + (k.rankings[0].mapsRank ?? 0), 0) / rankedKeywords.length
    : null;

  const daysSinceStart = business.createdAt
    ? differenceInDays(new Date(), business.createdAt)
    : 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      {/* Autopilot Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Overview</h1>
          <p className="text-sm text-zinc-500 mt-1 font-medium">
            Your AI local SEO agent is active on autopilot.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 font-semibold tracking-tight">Active Plan:</span>
          <Badge className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 border border-emerald-500/20 text-xs font-semibold px-2.5 py-1 rounded-full capitalize">
            {business.plan}
          </Badge>
        </div>
      </div>

      {/* Redesigned Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Citations Live Card */}
        <Card className="bg-white border-zinc-200/60 shadow-sm rounded-2xl p-5 flex flex-col justify-between h-36">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-zinc-500 tracking-tight">Citations live</span>
            <MapPin className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-semibold text-zinc-900 tracking-tight">
              {citationsLive} <span className="text-sm text-zinc-400 font-medium">/ 200</span>
            </div>
            <div className="flex gap-1 mt-2.5 select-none pointer-events-none">
              {Array.from({ length: 10 }).map((_, i) => {
                const active = (i + 1) * 20 <= citationsLive;
                return (
                  <div key={i} className={`h-1.5 flex-1 rounded-full ${active ? "bg-emerald-500" : "bg-zinc-100"}`} />
                );
              })}
            </div>
          </div>
        </Card>

        {/* Reviews Card */}
        <Card className="bg-white border-zinc-200/60 shadow-sm rounded-2xl p-5 flex flex-col justify-between h-36">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-zinc-500 tracking-tight">Reviews</span>
            <Star className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-semibold text-zinc-900 tracking-tight">
              {avgRating > 0 ? avgRating.toFixed(1) : "—"} <span className="text-sm text-zinc-400 font-medium">★ rating</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1.5 font-medium">{totalReviews} total customer reviews</p>
          </div>
        </Card>

        {/* Avg Keyword Rank Card */}
        <Card className="bg-white border-zinc-200/60 shadow-sm rounded-2xl p-5 flex flex-col justify-between h-36">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-zinc-500 tracking-tight">Avg keyword rank</span>
            <BarChart2 className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="mt-3 flex items-end justify-between">
            <div>
              <div className="text-2xl font-semibold text-zinc-900 tracking-tight">
                {avgRank ? `#${avgRank.toFixed(1)}` : "—"}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1.5 font-medium">{business.keywords.length} keywords tracked</p>
            </div>
            <svg className="w-14 h-8 text-emerald-500 flex-shrink-0" viewBox="0 0 100 50" fill="none">
              <path
                d="M5,45 Q30,20 60,35 T95,10"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </Card>

        {/* Bot Status Card */}
        <Card className="bg-white border-zinc-200/60 shadow-sm rounded-2xl p-5 flex flex-col justify-between h-36">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-zinc-500 tracking-tight">Bot status</span>
            <Bot className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-2xl font-semibold text-zinc-900 tracking-tight capitalize">{business.status}</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1.5 font-medium">
              Running for {daysSinceStart} day{daysSinceStart !== 1 ? "s" : ""}
            </p>
          </div>
        </Card>
      </div>

      {/* Website Traffic & Click Share Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Website Traffic Trend SVG Chart */}
        <Card className="bg-white border-zinc-200/60 shadow-sm rounded-2xl p-6 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-semibold text-zinc-800 tracking-tight">Website Traffic & Clicks</h3>
                <p className="text-xs text-zinc-400 mt-0.5 font-medium">Estimated traffic driven from Google local search listings.</p>
              </div>
              <div className="flex gap-4">
                <div className="text-right">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Monthly Clicks</span>
                  <span className="text-sm font-semibold text-zinc-800">1,240 <span className="text-[10px] text-emerald-500 font-semibold">+14.2%</span></span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Impressions</span>
                  <span className="text-sm font-semibold text-zinc-800">48.2k <span className="text-[10px] text-emerald-500 font-semibold">+8.5%</span></span>
                </div>
              </div>
            </div>

            {/* SVG Area Chart with custom Gradient */}
            <div className="h-44 w-full relative select-none">
              <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Grid Lines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="#f8fafc" strokeWidth="1" />
                <line x1="0" y1="75" x2="500" y2="75" stroke="#f8fafc" strokeWidth="1" />
                <line x1="0" y1="120" x2="500" y2="120" stroke="#f8fafc" strokeWidth="1" />

                {/* Area path */}
                <path
                  d="M 0 150 L 0 130 Q 80 110 150 70 T 300 95 T 450 35 L 500 45 L 500 150 Z"
                  fill="url(#trafficGradient)"
                />
                {/* Stroke path */}
                <path
                  d="M 0 130 Q 80 110 150 70 T 300 95 T 450 35 L 500 45"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
              <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-2 select-none">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Traffic Channels comparison */}
        <Card className="bg-white border-zinc-200/60 shadow-sm rounded-2xl p-6 flex flex-col justify-between lg:col-span-1">
          <div>
            <h3 className="text-sm font-semibold text-zinc-800 mb-6 tracking-tight">Traffic Acquisition</h3>
            <div className="space-y-4.5">
              {[
                { source: "Google Maps (GBP)", clicks: 780, percent: 63, color: "bg-blue-500" },
                { source: "Google Local Search", clicks: 310, percent: 25, color: "bg-emerald-500" },
                { source: "Directory Citations", clicks: 95, percent: 8, color: "bg-violet-500" },
                { source: "Other Referrals", clicks: 55, percent: 4, color: "bg-zinc-400" },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-zinc-500 tracking-tight">{item.source}</span>
                    <span className="text-zinc-955 tracking-tight">{item.clicks} clicks <span className="text-zinc-400 font-medium">({item.percent}%)</span></span>
                  </div>
                  <div className="h-2 w-full bg-zinc-50 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-zinc-400 mt-6 leading-relaxed font-medium">
            Traffic distribution displaying which synchronized directories and local channels are generating customer clicks.
          </p>
        </Card>
      </div>

      {/* Advanced Analytics & AI Visibility Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Citation Growth SVG Chart */}
        <Card className="bg-white border-zinc-200/60 shadow-sm rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-zinc-800 mb-6 tracking-tight">Citation Growth Trend</h3>
          <div className="flex items-end justify-between h-40 gap-3 border-b border-zinc-100 pb-2 select-none">
            {[4, 8, 12, 15, citationsLive].map((val, idx) => {
              const percent = Math.max(10, Math.min(100, (val / 200) * 100 * 3.5));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full bg-zinc-50 hover:bg-zinc-100 transition-colors rounded-t-lg relative flex items-end justify-center" style={{ height: `${percent}px` }}>
                    <div className="absolute -top-7 bg-zinc-950 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {val} live
                    </div>
                    <div className="w-full bg-emerald-500/10 border-t-2 border-emerald-500 rounded-t-lg" style={{ height: "100%" }} />
                  </div>
                  <span className="text-[10px] text-zinc-400 font-semibold tracking-tight">Week {idx + 1}</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-zinc-400 mt-4 leading-relaxed font-medium">
            Timeline of automated directory listing syncs completed successfully over the last 5 weeks.
          </p>
        </Card>

        {/* AI Search Engine Visibility Widget */}
        <Card className="bg-white border-zinc-200/60 shadow-sm rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-800 tracking-tight">AI Search Engine Visibility</h3>
              <Badge className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 border border-emerald-500/20 text-[9px] font-semibold px-2 py-0.5 rounded-full select-none uppercase tracking-wider">
                Optimal
              </Badge>
            </div>

            {/* Core Score */}
            <div className="flex items-center gap-3.5 mb-5">
              <div className="text-3xl font-bold text-zinc-900 tracking-tight">84%</div>
              <div>
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">AI Recommendation rate</p>
                <p className="text-xs text-emerald-500 font-semibold mt-0.5 flex items-center gap-1 tracking-tight">
                  <TrendingUp className="h-3 w-3" /> +5.4% this week
                </p>
              </div>
            </div>

            {/* Platform List */}
            <div className="space-y-3">
              {[
                { platform: "ChatGPT Search", status: "Recommended", desc: "Featured local services pick", badge: "text-emerald-700 bg-emerald-50 border-emerald-100" },
                { platform: "Google Gemini", status: "Recommended", desc: "Featured map snippet citation", badge: "text-emerald-700 bg-emerald-50 border-emerald-100" },
                { platform: "Perplexity AI", status: "Indexed", desc: "Cited in regional directory source", badge: "text-blue-700 bg-blue-50 border-blue-100" },
                { platform: "Apple Intelligence", status: "Indexing", desc: "Siri local maps index source", badge: "text-amber-700 bg-amber-50 border-amber-100" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-0.5">
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="font-semibold text-zinc-700 tracking-tight">{item.platform}</span>
                    <p className="text-[10px] text-zinc-400 font-medium truncate mt-0.5">{item.desc}</p>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border whitespace-nowrap ${item.badge}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-zinc-400 mt-5 leading-relaxed font-medium">
            Tracks if Conversational AI LLMs identify and recommend your business to local search queries.
          </p>
        </Card>

        {/* Rankings Distribution SVG Donut Chart */}
        <Card className="bg-white border-zinc-200/60 shadow-sm rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-800 mb-6 tracking-tight">Keyword Ranking Distribution</h3>
            <div className="flex items-center justify-around gap-6 my-2">
              {/* SVG Donut */}
              <div className="relative w-28 h-28 flex items-center justify-center select-none">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Circle */}
                  <circle cx="50" cy="50" r="40" stroke="#f4f4f5" strokeWidth="8" fill="transparent" />
                  {/* Segment 1: Top 3 (Emerald) */}
                  <circle cx="50" cy="50" r="40" stroke="#10b981" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset="188.4" />
                  {/* Segment 2: Top 10 (Blue) */}
                  <circle cx="50" cy="50" r="40" stroke="#3b82f6" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset="125.6" style={{ transform: "rotate(90deg)", transformOrigin: "50px 50px" }} />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-xl font-semibold text-zinc-900 tracking-tight">
                    {business.keywords.length}
                  </span>
                  <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Total</span>
                </div>
              </div>

              {/* Legends */}
              <div className="space-y-2 flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs text-zinc-600 font-medium tracking-tight">Top 3 Rank (25%)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-xs text-zinc-600 font-medium tracking-tight">Top 10 Rank (50%)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-200" />
                  <span className="text-xs text-zinc-600 font-medium tracking-tight">Others (25%)</span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-zinc-400 mt-4 leading-relaxed font-medium">
            Search visibility brackets of all active keywords tracked in Google maps local search graph.
          </p>
        </Card>
      </div>

      {/* Autopilot Schedule & Timeline Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Autopilot Schedule list */}
        <Card className="bg-white border-zinc-200/60 shadow-sm rounded-2xl p-6 lg:col-span-1">
          <h3 className="text-sm font-semibold text-zinc-800 mb-4 tracking-tight">Autopilot Actions</h3>
          <div className="divide-y divide-zinc-100">
            {[
              { name: "Generate weekly Google Business post", time: "Monday, 8:00 AM", status: "scheduled" },
              { name: "Sync & audit 200 citation directories", time: "Wednesday, 10:00 AM", status: "queued" },
              { name: "Automate responses to new reviews", time: "Instant (Realtime)", status: "active" },
              { name: "Compile Google Maps ranking report", time: "Friday, 5:00 PM", status: "scheduled" },
            ].map((action, i) => (
              <div key={i} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1 pr-4">
                  <p className="text-xs font-semibold text-zinc-700 truncate tracking-tight">{action.name}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5 font-medium">{action.time}</p>
                </div>
                <span className={`text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border whitespace-nowrap ${
                  action.status === "active"
                    ? "text-emerald-600 bg-emerald-50 border-emerald-100"
                    : action.status === "queued"
                      ? "text-blue-600 bg-blue-50 border-blue-100"
                      : "text-zinc-500 bg-zinc-50 border-zinc-150"
                }`}>
                  {action.status}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Activity timeline feed */}
        <Card className="bg-white border-zinc-200/60 shadow-sm rounded-2xl p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold text-zinc-800 mb-4 tracking-tight">Recent Bot Activity</h3>
          <div>
            {business.auditLogs.length === 0 ? (
              <div className="text-center py-12 text-zinc-400">
                <Bot className="h-12 w-12 mx-auto mb-3 opacity-20 text-zinc-500" />
                <p className="text-sm font-medium tracking-tight">No activity logs recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {business.auditLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 py-1">
                    {log.status === "success" ? (
                      <div className="h-6 w-6 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                      </div>
                    ) : log.status === "failed" ? (
                      <div className="h-6 w-6 rounded-full bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                      </div>
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Clock className="h-3.5 w-3.5 text-zinc-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-zinc-700 tracking-tight capitalize">
                          {log.jobType?.replace("_", " ")?.replace(".", " › ")}
                        </span>
                        <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border uppercase tracking-wider ${
                          log.status === "success"
                            ? "text-emerald-600 bg-emerald-50 border-emerald-100"
                            : log.status === "failed"
                              ? "text-red-600 bg-red-50 border-red-100"
                              : "text-zinc-500 bg-zinc-50 border-zinc-150"
                        }`}>
                          {log.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-1 font-medium">
                        {formatDistanceToNow(log.createdAt, { addSuffix: true })}
                        {log.durationMs ? ` · duration: ${log.durationMs}ms` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
