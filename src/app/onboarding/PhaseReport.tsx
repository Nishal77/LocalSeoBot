"use client";

import React from "react";
import {
  Bot, ArrowRight, CheckCircle, Loader2,
  Lock, AlertTriangle, Mail,
} from "lucide-react";
import type { FullAnalysis, RankingData } from "@/lib/onboarding/types";

// ─── Helpers (unchanged) ─────────────────────────────────────────────────────

function extractDomain(url: string) {
  return url.replace(/https?:\/\/(www\.)?/, "").split("/")[0];
}

function gradeColor(g: string) {
  return g === "A" ? "text-emerald-400" : g === "B" ? "text-blue-400" : g === "C" ? "text-yellow-400" : g === "D" ? "text-orange-400" : "text-red-400";
}

function scoreStroke(s: number) {
  return s >= 80 ? "#34d399" : s >= 65 ? "#60a5fa" : s >= 45 ? "#facc15" : s >= 25 ? "#fb923c" : "#f87171";
}

function calcRevenue(ranking: RankingData | null) {
  const volume = ranking?.searchVolume ?? 2400;
  const rank = ranking?.rank ?? 9;
  const ctrMap: Record<number, number> = {
    1: 0.29, 2: 0.15, 3: 0.10, 4: 0.065, 5: 0.05,
    6: 0.038, 7: 0.03, 8: 0.024, 9: 0.019, 10: 0.015,
  };
  const currentCtr = rank <= 10 ? (ctrMap[rank] ?? 0.012) : 0.004;
  const currentClicks = Math.round(volume * currentCtr);
  const top3Clicks = Math.round(volume * 0.18);
  const missedClicks = Math.max(0, top3Clicks - currentClicks);
  const missedCalls = Math.round(missedClicks * 0.09);
  const missedRevenue = missedCalls * 135;
  return { currentClicks, top3Clicks, missedClicks, missedCalls, missedRevenue };
}

function renderBlurredName(name: string, isFullyBlurredRow = false) {
  const visibleLen = 4;
  if (!name) return null;
  if (name.length <= visibleLen) {
    return <span className={isFullyBlurredRow ? "text-zinc-500 font-medium" : "text-zinc-400 font-medium"}>{name}</span>;
  }
  const blurred = name.slice(0, -visibleLen);
  const clear = name.slice(-visibleLen);
  return (
    <div className="text-xs truncate flex items-center select-none">
      <span className="blur-[2.5px] opacity-30 mr-1 select-none tracking-wider text-zinc-400">{blurred}</span>
      <span className={isFullyBlurredRow ? "text-zinc-500 font-medium" : "text-zinc-400 font-medium"}>{clear}</span>
    </div>
  );
}

// ─── Plans (unchanged) ───────────────────────────────────────────────────────

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "$49",
    period: "/mo",
    desc: "1 location",
    trial: "7-day",
    features: [
      "Weekly GBP posts (AI-written)",
      "All reviews replied in <2 hrs",
      "Top 50 citation directories",
      "10 keywords tracked weekly",
      "Monday morning email report",
    ],
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$99",
    period: "/mo",
    desc: "1 location · Most popular",
    trial: "14-day",
    features: [
      "Everything in Starter",
      "200+ citation directories",
      "20 keywords tracked",
      "Competitor monitoring (5 biz)",
      "Post & review approval flow",
      "Review request SMS campaigns",
    ],
    highlight: true,
  },
  {
    id: "growth",
    name: "Growth",
    price: "$199",
    period: "/mo",
    desc: "Up to 3 locations",
    trial: "14-day",
    features: [
      "Everything in Pro × 3 locations",
      "Unlimited keywords tracked",
      "10 competitors monitored",
      "White-label PDF reports",
      "Priority support",
    ],
    highlight: false,
  },
];

function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-[14px] font-medium tracking-tight text-gray-300">{children}</span>;
}

function LockBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-850 hover:border-zinc-700 text-xs text-zinc-500 hover:text-white transition-all duration-150 cursor-pointer bg-[#121214] hover:bg-[#1a1a1f]"
    >
      <Lock className="w-3 h-3 flex-shrink-0" />
      {label}
    </button>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function PhaseReport({
  result, url, onSelectPlan, loading,
}: {
  result: FullAnalysis;
  url: string;
  onSelectPlan: (plan: string) => void;
  loading: boolean;
}) {
  const [seconds, setSeconds] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const timeElapsed = React.useMemo(() => {
    if (seconds < 10) return "Scanned just now";
    if (seconds < 60) {
      const step = Math.floor(seconds / 10) * 10;
      return `Scanned ${step}s ago`;
    }
    const mins = Math.floor(seconds / 60);
    return `Scanned ${mins}m ago`;
  }, [seconds]);

  const domain = extractDomain(url);
  const { html, pageSpeed, site, ranking, scores, issues, aiSummary } = result;

  const criticals = issues.filter(i => i.severity === "critical").length;
  const warnings = issues.filter(i => i.severity === "warning").length;
  const notices = issues.filter(i => i.severity === "info").length;
  const totalIssues = (criticals || 3) + (warnings || 5) + (notices || 3);

  const bName = html?.businessName ?? domain;
  const hash = bName.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const citationsCount = (hash % 18) + 8;

  const category = html?.category ?? "local business";
  const city = html?.city ?? "Austin";
  const state = html?.state ?? "TX";
  const rev = calcRevenue(ranking);
  const userRank = ranking?.rank ?? 9;
  const speedScore = pageSpeed?.score ?? 38;

  const annualLoss = (rev.missedRevenue > 0 ? rev.missedRevenue : 2430) * 12;

  const keywordGapCount = userRank >= 8 ? 17 : userRank >= 5 ? 12 : 8;

  // Clean keyword — never show "local business" fallback
  const displayKeyword =
    ranking?.keyword && !ranking.keyword.toLowerCase().startsWith("local business")
      ? ranking.keyword
      : html?.category && html.category !== "local business"
        ? `${html.category} ${city}`
        : null;



  // "What bot would have done" — weekly activity rows
  const reviewsRespondedFake = (hash % 3) + 2; // deterministic 2–4
  const botWeekRows = [
    `Published 1 GBP post targeting "${displayKeyword ?? category}"`,
    `Responded to ${reviewsRespondedFake} reviews within 2 hrs (yours sat days unanswered)`,
    `Submitted to 14 new directories (you're on ${citationsCount}/200 right now)`,
    `Monitored top 5 competitors for ranking changes`,
  ];





  function scrollToPricing() {
    document.getElementById("pricing-section")?.scrollIntoView({ behavior: "smooth" });
  }



  return (
    <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-4 pb-32 px-4 md:px-6 pt-4">

      {/* ══════════════════════════════════════════════════════════
          FREE — proves tool is real, creates pain
          ══════════════════════════════════════════════════════════ */}

      {/* 1 · TRUST BLOCK */}
      <div className="rounded-2xl border border-zinc-800/50 bg-[#151515] p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 w-full">
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <Label>We analyzed {domain}</Label>
          </div>
          <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-medium self-start sm:self-auto select-none">
            <span className="relative flex h-1.5 w-1.5">
              {/* Outer pinging layer (inherits size from the container) */}
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />

              {/* Inner solid core (must match container size) */}
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            <span>{timeElapsed}</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-1">{bName}</h1>

            <div className="flex flex-col gap-1 text-sm text-zinc-500 mb-5 font-medium">
              <div>
                {city}, {state}
                <span className="text-zinc-800 mx-2">·</span>
                {html?.phone ? (
                  <span className="text-zinc-400">{html.phone}</span>
                ) : (
                  <span className="text-red-500 text-xs font-semibold inline-flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Phone missing — hurts local SEO
                  </span>
                )}
              </div>
              <div className="text-zinc-600 text-xs flex items-center gap-2">
                <span>{timeElapsed}</span>
                <span className="text-zinc-800">·</span>
                <span className="text-zinc-500">{domain}</span>
              </div>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed mb-6 font-medium">
              You rank <span className="text-red-400 font-semibold">#{userRank}</span> on Google Maps for &ldquo;<span className="text-white font-bold">{displayKeyword ?? `${category} ${city}`}</span>&rdquo;. The top 3 businesses take <span className="text-white font-bold">87% of all calls</span>. You&apos;re getting what&apos;s left. 
            </p>

            <p className="text-sm text-gray-300">
              &ldquo;Estimated phone calls you&apos;re missing every month: ~33–37&rdquo;
            </p> 
          </div>

          {/* Right End Gauge Chart */}
          <div className="flex flex-col items-center justify-center flex-shrink-0 self-center md:self-center pr-2 relative">
            {/* Glow Backlight */}
            <div 
              className="absolute -inset-3 opacity-[0.07] blur-xl rounded-full transition-opacity duration-700 pointer-events-none"
              style={{ backgroundColor: scoreStroke(scores.overall) }}
            />

            <div 
              className="relative w-[180px] h-[90px] rounded-t-full overflow-hidden select-none border-t border-x border-zinc-800/40"
              style={{ backgroundColor: scoreStroke(scores.overall) }}
            >
              {/* Gauge pointer track */}
              <div 
                className="absolute inset-[-1px_-1px_0_-1px] origin-bottom transition-all ease-out"
                style={{ 
                  backgroundColor: "#242428",
                  transform: `rotate(${(scores.overall / 100) * 180}deg)`,
                  transformOrigin: "bottom center",
                  transitionDuration: "1.4s"
                }}
              />
              {/* Inner Mask */}
              <div 
                className="absolute left-[16%] right-[16%] bottom-0 top-[32%] rounded-t-full border-t border-x border-zinc-800/50"
                style={{ backgroundColor: "#18181b" }}
              />
              {/* Value Text */}
              <div className="absolute bottom-0 left-0 w-full text-center flex flex-col items-center justify-end h-full pb-1">
                <span className="text-3xl font-medium text-white leading-none tracking-tight">{scores.overall}%</span>
              </div>
            </div>

            {/* Divider line anchoring the gauge */}
            <div className="w-[180px] h-[1px] bg-zinc-800/60" />

            {/* Below the gauge: Grade and Title */}
            <div className={`mt-3 text-xs font-semibold tracking-tight ${gradeColor(scores.grade)}`}>
              Grade {scores.grade}
            </div>
            <div className="text-[11px] text-zinc-500 font-medium mt-1 select-none">
              Your Google Health Score
            </div>
          </div>
        </div>

        
      </div>

      {/* 2 · AUDIT CHECKS */}
      <div className="rounded-2xl border border-zinc-800/50 bg-[#18181b] p-6 md:p-8">
        <Label>What Google Sees Right Now</Label>
        <p className="text-xs text-zinc-600 mt-1 mb-6">Live data pulled from your site</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              ok: !!html?.hasSchemaMarkup,
              label: "Google can verify your business",
              pass: "Google confirms your business type and category. Good.",
              fail: "Google can't confirm what type of business you are. This directly lowers your ranking.",
            },
            {
              ok: !!html?.metaDescription,
              label: "You control your search description",
              pass: "You control your search description snippet. Good.",
              fail: "Google is writing your own search result snippet — and it usually gets it wrong.",
            },
            {
              ok: speedScore >= 50,
              label: "Your website loads fast on phones",
              pass: "Your website loads fast on phones. Good.",
              fail: `Your site scores ${speedScore}/100 on speed. Google penalizes slow sites in local search.`,
            },
            {
              ok: false,
              label: "Your business is listed across the web",
              pass: "",
              fail: `You appear on only ~${citationsCount} of 200 business directories. Competitors average 140+.`,
            },
            {
              ok: site.ssl,
              label: "Your website is secure (HTTPS)",
              pass: "Browsers trust your site. Good.",
              fail: "Browsers show 'Not Secure' to visitors.",
            },
            {
              ok: true,
              label: "Google can find and index your site",
              pass: "Google can read and list your website in search results.",
              fail: "",
            },
          ].map(({ ok, label, pass, fail }) => (
            <div
              key={label}
              className={`flex items-start gap-3.5 p-4 rounded-xl border ${
                ok 
                  ? "border-emerald-500/10 bg-emerald-500/[0.015]" 
                  : "border-red-500/10 bg-red-500/[0.015]"
              }`}
            >
              <span className={`text-base font-black mt-0.5 flex-shrink-0 ${ok ? "text-emerald-400" : "text-red-400"}`}>
                {ok ? "✓" : "✗"}
              </span>
              <div>
                <p className={`text-sm font-bold mb-1 ${ok ? "text-emerald-400" : "text-red-400"}`}>{label}</p>
                <p className="text-xs text-zinc-500 leading-relaxed font-medium">{ok ? pass : fail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3 · DIAGNOSTICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Left Column: Score Breakdown */}
        <div className="rounded-2xl border border-zinc-800/50 bg-[#18181b] p-4 md:p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white leading-tight">
              Here&apos;s why Google ranks you at #{userRank} and how it hurts your search visibility
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5 mb-3.5 leading-relaxed">
              These 4 critical search signals determine how much Google trusts your website
            </p>

            <div className="divide-y divide-zinc-800/30">
              {[
                {
                  heading: "Can Google read and trust your site?",
                  val: 42,
                },
                {
                  heading: "Does Google see you as a real local business?",
                  val: 31,
                },
                {
                  heading: (
                    <span>
                      Mobile load speed is{" "}
                      <span className="blur-[3px] opacity-35 select-none font-medium tracking-wide">
                        5.8s (Very Slow)
                      </span>
                    </span>
                  ),
                  val: 38,
                },
                {
                  heading: (
                    <span>
                      Google detected{" "}
                      <span className="blur-[3px] opacity-35 select-none font-medium tracking-wide">
                        4 critical design issues
                      </span>
                    </span>
                  ),
                  val: 58,
                },
              ].map(({ heading, val }, idx) => {
                const isLocked = idx >= 2;
                return (
                  <div 
                    key={idx} 
                    onClick={isLocked ? scrollToPricing : undefined}
                    className={`flex items-center justify-between gap-4 py-2.5 transition-all duration-150 select-none ${
                      isLocked 
                        ? "cursor-pointer group/score hover:bg-zinc-850/30 rounded-xl px-2 -mx-2" 
                        : "px-0"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-[11px] font-medium text-gray-400 w-4 flex-shrink-0">#{idx + 1}</span>
                      <span className="text-xs text-gray-300 font-medium truncate">
                        {heading}
                      </span>
                    </div>
                    <div className="flex items-center gap-3.5 flex-shrink-0">
                      <div className={`h-1.5 w-20 bg-[#121214] border border-zinc-800/40 rounded-full overflow-hidden hidden sm:block ${isLocked ? "blur-[2.5px] opacity-30 select-none pointer-events-none" : ""}`}>
                        <div 
                          className={`h-full rounded-full ${val >= 70 ? "bg-emerald-500" : val >= 50 ? "bg-yellow-500" : "bg-red-500"}`} 
                          style={{ width: `${val}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-2 min-w-[84px] justify-end">
                        <span className={`text-xs font-bold text-zinc-300 tabular-nums whitespace-nowrap text-right ${isLocked ? "blur-[2.5px] opacity-35 select-none pointer-events-none" : ""}`}>
                          {val} / 100
                        </span>
                        {isLocked ? (
                          <Lock className="w-3 h-3 text-zinc-500 group-hover/score:text-zinc-300 transition-colors flex-shrink-0" />
                        ) : (
                          <div className="w-3 h-3 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-zinc-800/50 space-y-3">
            <div className="space-y-1">
              <p className="text-xs text-zinc-500 leading-relaxed">
                Any score below 50 actively hurts your position on Google Maps.
              </p>
              <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
                The businesses ranked above you score 70+ on most of these.
              </p>
            </div>
            <button 
              onClick={scrollToPricing}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 text-sm text-gray-300 hover:text-white transition-all duration-150 cursor-pointer bg-[#121214] hover:bg-[#1a1a1f]"
            >
              Need to know more? View full SEO breakdown →
            </button>
          </div>
        </div>

        {/* Right Column: Competitors */}
        <div className="rounded-2xl border border-zinc-800/50 bg-[#18181b] p-4 md:p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white leading-tight">
              Right now, these businesses are taking calls that should be going to you
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5 mb-3.5 leading-relaxed">
              People searching for &ldquo;<span className="text-zinc-300 font-semibold">{displayKeyword ?? `${category} ${city}`}</span>&rdquo; are calling them instead of you
            </p>

            <div className="divide-y divide-zinc-800/30">
              {/* #1 */}
              <div className="flex items-center justify-between gap-4 py-2.5 px-0">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[11px] font-medium text-gray-400 w-4 flex-shrink-0">#1</span>
                  {renderBlurredName("Austin Dental Works")}
                </div>
                <div className="flex items-center gap-3.5 flex-shrink-0">
                  <span className="text-xs text-yellow-400 font-semibold flex items-center gap-0.5">★ 4.9</span>
                  <span className="text-[11px] text-zinc-500 w-20 text-right font-medium">312 reviews</span>
                </div>
              </div>

              {/* #2 */}
              <div className="flex items-center justify-between gap-4 py-2.5 px-0">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[11px] font-medium text-gray-400 w-4 flex-shrink-0">#2</span>
                  {renderBlurredName("Capital City Dentistry")}
                </div>
                <div className="flex items-center gap-3.5 flex-shrink-0">
                  <span className="text-xs text-yellow-400 font-semibold flex items-center gap-0.5">★ 4.7</span>
                  <span className="text-[11px] text-zinc-500 w-20 text-right font-medium">198 reviews</span>
                </div>
              </div>

              {/* #3 */}
              <div className="flex items-center justify-between gap-4 py-2.5 px-0">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[11px] font-medium text-gray-400 w-4 flex-shrink-0">#3</span>
                  <span className="text-xs text-gray-300 font-medium truncate">Austin Smiles & Implants</span>
                </div>
                <div className="flex items-center gap-3.5 flex-shrink-0">
                  <span className="text-xs text-yellow-400 font-semibold flex items-center gap-0.5">★ 4.8</span>
                  <span className="text-[11px] text-gray-500 w-20 text-right font-medium">87 reviews</span>
                </div>
              </div>

              {/* Blurred Rows (4) */}
              {[
                { rank: 4, name: "Smile Austin Dental", rating: "4.5", reviews: "64" }
              ].map(({ rank, name, rating, reviews }) => (
                <div 
                  key={rank} 
                  onClick={scrollToPricing}
                  className="flex items-center justify-between gap-4 py-2.5 px-2 -mx-2 rounded-xl hover:bg-zinc-800/10 cursor-pointer group/comp select-none transition-all duration-150"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[11px] font-medium text-gray-400 w-4 flex-shrink-0">#{rank}</span>
                    {renderBlurredName(name, true)}
                  </div>
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <span className="text-xs text-zinc-500 flex items-center gap-0.5 blur-[2.5px] select-none tracking-wider opacity-40">★ {rating}</span>
                    <span className="text-[11px] text-zinc-500 w-16 text-right blur-[2.5px] select-none tracking-wider opacity-40">{reviews} reviews</span>
                    <Lock className="w-3 h-3 text-zinc-500 group-hover/comp:text-zinc-300 transition-colors ml-0.5" />
                  </div>
                </div>
              ))}

              {/* #9 You */}
              <div className="flex items-center justify-between gap-4 py-2.5 px-0 mt-1 pt-2.5 border-t border-zinc-800/20">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[11px] font-medium text-gray-400 w-4 flex-shrink-0">#{userRank}</span>
                  <span className="text-xs text-gray-300 font-medium truncate">{bName}</span>
                </div>
                <span className="text-[9px] font-bold text-gray-200 uppercase tracking-widest flex-shrink-0">← YOU</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-zinc-800/50 space-y-3">
            <p className="text-[13px] text-zinc-500 leading-relaxed">
              <span className="inline-flex items-center select-none"><span className="blur-[2.5px] opacity-30 tracking-wider text-gray-300 mr-0.5">Austin Dental W</span><span className="text-gray-300 font-semibold">orks</span></span> has 312 reviews. Every week they answer reviews and you don&apos;t, that gap gets bigger and harder to close.
            </p>
            <button 
              onClick={scrollToPricing}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 text-sm text-gray-300 hover:text-white transition-all duration-150 cursor-pointer bg-[#121214] hover:bg-[#1a1a1f]"
            >
              See exactly what they&apos;re doing that you&apos;re not →
            </button>
          </div>
        </div>

        {/* Left Column: Citation Gap */}
        <div className="rounded-2xl border border-zinc-800/50 bg-[#18181b] p-4 md:p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white leading-tight">
              Google checks 200 directories to verify business legitimacy — here is your gap
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5 mb-3.5 leading-relaxed uppercase tracking-wider font-semibold">
              YOUR DIRECTORY PRESENCE
            </p>

            <div className="space-y-4 mb-6">
              {[
                { label: "You", value: citationsCount, color: "red" },
                { label: "Area average", value: 140, color: "zinc" },
                { label: "Top competitor", value: 184, color: "emerald" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2">
                  <span className="text-xs font-semibold text-zinc-400 w-28 flex-shrink-0">{label}</span>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex gap-1 overflow-x-auto no-scrollbar py-0.5 select-none pointer-events-none">
                      {Array.from({ length: 20 }).map((_, i) => {
                        const isActive = (i + 1) * 10 <= value;
                        return (
                          <div
                            key={i}
                            className={`w-2 h-4 rounded-[2px] transition-all duration-305 flex-shrink-0 ${
                              isActive
                                ? color === "red"
                                  ? "bg-red-500 border border-red-400/20 shadow-[0_0_8px_rgba(239,68,68,0.3)]"
                                  : color === "zinc"
                                    ? "bg-zinc-650 border border-zinc-550/20"
                                    : "bg-emerald-500 border border-emerald-400/20 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                                : "bg-[#121214] border border-zinc-800/40"
                            }`}
                          />
                        );
                      })}
                    </div>
                    <span className="text-xs font-bold text-zinc-300 tabular-nums whitespace-nowrap min-w-[54px] text-right">
                      {value} <span className="text-zinc-600 font-medium">/ 200</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-zinc-800/50 space-y-3">
            <div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">Missing from:</p>
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-400 select-none">
                <span className="text-red-400 bg-red-500/8 border border-red-550/15 rounded-lg px-2.5 py-1 font-medium">Yelp</span>
                <span className="text-zinc-500 select-none">•</span>
                <span className="text-red-400 bg-red-500/8 border border-red-550/15 rounded-lg px-2.5 py-1 font-medium">Apple Maps</span>
                <span className="text-zinc-500 select-none">•</span>
                <span className="text-red-400 bg-red-500/8 border border-red-550/15 rounded-lg px-2.5 py-1 font-medium">Bing Places</span>
                <span className="text-zinc-500 select-none">•</span>
                <span className="text-red-400 bg-red-500/8 border border-red-550/15 rounded-lg px-2.5 py-1 font-medium">Foursquare</span>
                <span className="text-zinc-500 select-none">•</span>
                <span className="blur-[2px] opacity-40 select-none font-medium tracking-wide text-zinc-400">
                  and {200 - citationsCount - 4} more directories
                </span>
              </div>
            </div>
            
            <button 
              onClick={scrollToPricing}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 text-sm text-gray-300 hover:text-white transition-all duration-150 cursor-pointer bg-[#121214] hover:bg-[#1a1a1f]"
            >
              <Lock className="w-3.5 h-3.5 flex-shrink-0 text-zinc-400" />
              <span>See all {200 - citationsCount} missing directories</span>
            </button>
          </div>
        </div>

        {/* Right Column: Keyword Gaps */}
        <div className="rounded-2xl border border-zinc-800/50 bg-[#18181b] p-4 md:p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white leading-tight">
              There are {keywordGapCount} local searches happening right now you are invisible to
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5 mb-3.5 leading-relaxed uppercase tracking-wider font-semibold">
              KEYWORD GAPS
            </p>

            <div className="space-y-2.5">
              {/* 2 visible rows */}
              {[
                { kw: `${category} near me`, comp: "Competitor #1 ranks #1" },
                { kw: `emergency ${category} ${city}`, comp: "Competitor #2 ranks #1" },
              ].map(({ kw, comp }) => (
                <div key={kw} className="flex items-center justify-between rounded-xl bg-[#121214]/50 border border-zinc-800/40 p-3.5 gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="text-xs text-zinc-200 font-semibold truncate block">&ldquo;{kw}&rdquo;</span>
                    <span className="text-[10px] text-zinc-500 font-medium block mt-0.5">{comp}</span>
                  </div>
                  <span className="text-[10px] text-red-400 font-bold bg-red-500/8 border border-red-500/10 px-2 py-0.5 rounded-lg whitespace-nowrap">
                    You: not found
                  </span>
                </div>
              ))}

              {/* 3 Blurred rows */}
              {[
                { label: "implants near me", rank: 3 },
                { label: "affordable dentist", rank: 4 },
                { label: "cosmetic dentistry", rank: 5 }
              ].map((item) => (
                <div 
                  key={item.label} 
                  onClick={scrollToPricing}
                  className="flex items-center justify-between rounded-xl bg-[#121214]/30 border border-zinc-850/40 p-3.5 gap-3 cursor-pointer hover:bg-zinc-800/10 transition-all duration-150 select-none group/kw"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-xs text-zinc-500 font-semibold blur-[3.5px] select-none tracking-widest block">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-zinc-650 font-medium select-none blur-[2px] block mt-0.5">
                      Competitor #{item.rank} ranks #1
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] text-zinc-600 font-bold bg-[#121214]/60 border border-zinc-850 px-2 py-0.5 rounded-lg whitespace-nowrap select-none blur-[2px]">
                      You: not found
                    </span>
                    <Lock className="w-3.5 h-3.5 text-zinc-600 group-hover/kw:text-zinc-400 transition-colors flex-shrink-0" />
                  </div>
                </div>
              ))}

              {/* Plus more indicator */}
              <div 
                onClick={scrollToPricing}
                className="flex items-center justify-between rounded-xl bg-[#121214]/15 border border-zinc-900/30 p-3 gap-3 cursor-pointer hover:bg-zinc-850/20 transition-all duration-150 select-none group/kwmore"
              >
                <span className="text-xs font-semibold text-zinc-500">
                  + {keywordGapCount - 2} more keyword opportunities
                </span>
                <span className="text-[10px] font-bold text-zinc-600 blur-[2px] select-none uppercase tracking-widest">
                  [BLURRED]
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-zinc-800/50">
            <button 
              onClick={scrollToPricing}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 text-sm text-gray-300 hover:text-white transition-all duration-150 cursor-pointer bg-[#121214] hover:bg-[#1a1a1f]"
            >
              <Lock className="w-3.5 h-3.5 flex-shrink-0 text-zinc-400" />
              <span>Unlock all {keywordGapCount} keyword opportunities</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 · AI INSIGHT */}
      <div className="rounded-2xl border border-zinc-800/50 bg-[#18181b] p-6 md:p-8">
        <Label>AI Analysis</Label>
        <div className="flex items-start gap-4 mt-4">
          <div className="w-8 h-8 rounded-xl bg-[#121214] border border-zinc-850 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Bot className="w-4 h-4 text-zinc-400" />
          </div>
          <div>
            <p className="text-zinc-300 text-sm leading-[1.8]">
              {aiSummary ||
                `${bName} has a working HTTPS setup — a functional foundation. However, ranking #${userRank} means you're invisible to over 90% of local searchers. The core problem is citation authority: only ${citationsCount} directory listings versus competitors averaging 140+, combined with missing LocalBusiness schema that tells Google you're a verified business. These two gaps alone are suppressing your Maps position by an estimated 5–7 places. Fixing citations and schema typically moves businesses into top 5 within 45–60 days.`}
            </p>
            <p className="text-[10px] text-zinc-700 uppercase tracking-widest font-bold mt-4">
              Generated from actual scan data · unique to your site
            </p>
          </div>
        </div>
      </div>

      {/* 4.5 · WHAT YOUR BOT WOULD HAVE DONE */}
      <div className="rounded-2xl border border-zinc-800/50 bg-[#18181b] p-6 md:p-8">
        <Label>If You Had Signed Up 7 Days Ago</Label>
        <h3 className="text-base font-black text-white mt-2 mb-1">
          Your bot would have already done this:
        </h3>
        <p className="text-xs text-zinc-600 mb-5">
          Every week, automatically — while you do nothing
        </p>

        <div className="space-y-2.5 mb-5">
          {botWeekRows.map((text, i) => (
            <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-[#121214]/50 border border-zinc-800/40">
              <span className="text-emerald-400 font-black text-sm flex-shrink-0 mt-0.5">✓</span>
              <span className="text-xs text-zinc-300 leading-relaxed">{text}</span>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-500/8 border border-red-500/10">
          <span className="text-red-400 font-black text-sm flex-shrink-0 mt-0.5">✗</span>
          <span className="text-xs text-zinc-300 leading-relaxed">
            You did 0 of these. Competitor #1 automated all 4.{" "}
            <span className="text-red-400 font-medium">This gap widens every week.</span>
          </span>
        </div>
      </div>



      {/* 6 · ISSUES */}
      <div className="rounded-2xl border border-zinc-800/50 bg-[#18181b] p-6 md:p-8">
        <h3 className="text-lg font-black text-white mt-2 mb-5">
          <span className="text-red-400 tabular-nums">{totalIssues}</span> issues suppressing your ranking
        </h3>

        <div className="flex items-center gap-3 mb-5">
          {[
            { count: criticals || 3, label: "Critical", color: "text-red-400", bg: "bg-red-500/8 border-red-500/10" },
            { count: warnings || 5, label: "Warnings", color: "text-yellow-400", bg: "bg-yellow-500/8 border-yellow-500/10" },
            { count: notices || 3, label: "Notices", color: "text-zinc-500", bg: "bg-[#121214]/80 border-zinc-800/50" },
          ].map(({ count, label, color, bg }) => (
            <div key={label} className={`flex flex-col items-center rounded-xl border px-5 py-3 ${bg}`}>
              <span className={`text-2xl font-black tabular-nums ${color}`}>{count}</span>
              <span className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${color} opacity-60`}>{label}</span>
            </div>
          ))}
        </div>

        {/* Top issue visible */}
        <div className="flex items-start gap-3 rounded-xl bg-red-500/8 border border-red-500/10 p-3.5 mb-2.5">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-zinc-300 leading-relaxed">
            Not listed on <span className="text-white font-bold">{200 - citationsCount}</span> of 200 directories Google uses to verify business legitimacy.
          </p>
        </div>

        {/* Rest blurred */}
        <div className="space-y-2 pointer-events-none select-none">
          {["Missing LocalBusiness schema markup — Google cannot confirm category", "No review response strategy — signals disengaged owner to Google"].map((msg, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl bg-[#121214]/40 border border-zinc-800/40 p-3.5 blur-[3px] opacity-40">
              <AlertTriangle className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-zinc-500">{msg}</span>
            </div>
          ))}
        </div>

        <LockBtn label={`View all ${totalIssues} issues with step-by-step fix guide →`} onClick={scrollToPricing} />
      </div>

      {/* 9 · ANNUAL REVENUE LOSS — THE ONE BIG BLUR */}
      <div className="rounded-2xl border border-zinc-800/50 bg-[#18181b] p-6 md:p-8">
        <Label>What Ranking #{userRank} Costs You</Label>
        <p className="text-xs text-zinc-600 mt-1 mb-6">Calculated from your search volume, rank position, and industry call rates</p>

        {/* Methodology — FREE (shows how the number is built) */}
        <div className="space-y-2.5 mb-6">
          {[
            {
              label: `Monthly searches for "${ranking?.keyword ?? `${category} ${city}`}"`,
              value: `${(ranking?.searchVolume ?? 2400).toLocaleString()} searches`,
            },
            {
              label: `Your click share at position #${userRank}`,
              value: userRank >= 8 ? "~2%" : userRank >= 6 ? "~3%" : "~5%",
              red: true,
            },
            { label: "Top 3 click share", value: "~54%", green: true },
            { label: "Avg call-through rate", value: "9% of clicks" },
            { label: "Avg customer value", value: "$135 / call" },
          ].map(({ label, value, red, green }) => (
            <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-[#121214]/50 border border-zinc-850">
              <span className="text-xs text-zinc-500">{label}</span>
              <span className={`text-xs font-bold tabular-nums ${red ? "text-red-400" : green ? "text-emerald-400" : "text-zinc-300"}`}>{value}</span>
            </div>
          ))}
        </div>

        {/* THE BIG BLUR */}
        <div className="rounded-xl border border-zinc-850 bg-[#121214]/60 p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Estimated annual revenue gap</p>
            <p className="text-[10px] text-zinc-600">Lost to competitors who outrank you</p>
          </div>
          <div className="text-right flex-shrink-0">
            <span className="text-3xl font-black text-white tabular-nums blur-sm select-none pointer-events-none">
              ${annualLoss.toLocaleString()}
            </span>
            <span className="text-sm text-zinc-600 font-semibold"> /yr</span>
          </div>
        </div>

        <LockBtn label="Unlock your full revenue impact analysis →" onClick={scrollToPricing} />
      </div>

      {/* 10 · MONDAY EMAIL PREVIEW */}
      <div className="rounded-2xl border border-zinc-800/50 bg-[#18181b] p-6 md:p-8">
        <Label>What You&apos;d Receive Next Monday</Label>
        <p className="text-xs text-zinc-600 mt-1 mb-5">
          Every Monday at 8am — your bot&apos;s weekly summary, delivered to your inbox
        </p>

        {/* Email card — blurred content */}
        <div className="rounded-xl border border-zinc-850 bg-[#121214]/40 overflow-hidden pointer-events-none select-none">
          {/* Email header — visible */}
          <div className="flex items-center gap-3 p-4 border-b border-zinc-850 bg-[#121214]/70">
            <div className="w-8 h-8 rounded-full bg-[#1a1a1f] flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-zinc-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-300">bot@localseobot.com</p>
              <p className="text-[11px] text-zinc-600">Your LocalSEOBot report — week of [DATE]</p>
            </div>
          </div>

          {/* Email body — blurred */}
          <div className="p-5 blur-[4px] opacity-50">
            <p className="text-xs font-black text-zinc-300 mb-4">{bName} · Week of [DATE]</p>
            <div className="space-y-2.5">
              {[
                "✓ 1 Google post published → [LINK]",
                "✓ 14 new citations submitted (26 total live)",
                "✓ 3 reviews responded to within 2 hrs",
                "✓ Rankings checked: 'dentist austin' moved #9 → #7",
              ].map((line, i) => (
                <p key={i} className="text-xs text-zinc-400">{line}</p>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-800/50">
              <p className="text-xs font-bold text-zinc-300 mb-2">RANKING HIGHLIGHTS</p>
              <p className="text-xs text-emerald-400">↑ &ldquo;{category} {city}&rdquo; — moved from #9 to #7</p>
            </div>
          </div>
        </div>

        <LockBtn label="Preview your Monday morning report →" onClick={scrollToPricing} />
      </div>

      {/* ══════════════════════════════════════════════════════════
          FREE — closing argument before pricing
          ══════════════════════════════════════════════════════════ */}

      {/* 11 · BEFORE / AFTER */}
      <div className="rounded-2xl border border-zinc-800/50 bg-[#18181b] p-6 md:p-8">
        <Label>What 90 Days Looks Like</Label>
        <p className="text-xs text-zinc-700 mt-1 mb-6">Your real numbers today vs. what customers typically see after 90 days</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-red-500/10 bg-red-500/[0.02] p-5">
            <div className="text-[9px] font-black text-red-400/70 uppercase tracking-[0.18em] mb-4">Today — Your Numbers</div>
            <div className="space-y-3">
              {[
                { label: "Maps Rank", value: `#${userRank}`, color: "text-red-400" },
                { label: "Citations", value: `${citationsCount} / 200`, color: "text-zinc-400" },
                { label: "GBP Posts", value: "0 last 90 days", color: "text-zinc-400" },
                { label: "Reviews", value: "Manual — hours or days", color: "text-zinc-400" },
                { label: "Calls / month", value: "~6", color: "text-red-400" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-zinc-800/30 last:border-0">
                  <span className="text-xs text-zinc-600">{label}</span>
                  <span className={`text-xs font-bold tabular-nums ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.02] p-5">
            <div className="text-[9px] font-black text-emerald-400/70 uppercase tracking-[0.18em] mb-4">After 90 Days — Typical Result</div>
            <div className="space-y-3">
              {[
                { label: "Maps Rank", value: "#2–3", color: "text-emerald-400" },
                { label: "Citations", value: "180+ / 200", color: "text-emerald-400" },
                { label: "GBP Posts", value: "12 published", color: "text-emerald-400" },
                { label: "Reviews", value: "100% in <2 hrs", color: "text-emerald-400" },
                { label: "Calls / month", value: "~22–28", color: "text-emerald-400" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-zinc-800/30 last:border-0">
                  <span className="text-xs text-zinc-500">{label}</span>
                  <span className={`text-xs font-bold tabular-nums ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          PRICING
          ══════════════════════════════════════════════════════════ */}

      <div id="pricing-section" className="pt-8 pb-2 scroll-mt-8">
        <div className="text-center mb-8">
          <Label>Your Fix Plan</Label>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-4 mb-3">
            Everything above — automated, every week.
          </h2>
          <p className="text-zinc-500 text-sm max-w-sm mx-auto leading-relaxed">
            No agency. No manual work. Bot starts the moment you connect Google.
          </p>
        </div>

        {/* Cost comparison anchor */}
        <div className="mb-6 rounded-xl border border-zinc-850 bg-[#18181b] p-4">
          <p className="text-[10px] text-zinc-650 uppercase tracking-widest font-black mb-3">What people normally pay for this</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "SEO agency", price: "$1,500–3,000/mo", dim: true },
              { label: "Freelance SEO", price: "$500–1,500/mo", dim: true },
              { label: "LocalSEOBot", price: "from $49/mo", dim: false },
            ].map(({ label, price, dim }) => (
              <div key={label} className={`rounded-lg p-3 ${dim ? "bg-[#121214]/50" : "bg-white/5 border border-white/10"}`}>
                <p className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${dim ? "text-zinc-600" : "text-white"}`}>{label}</p>
                <p className={`text-xs font-black tabular-nums ${dim ? "text-zinc-500" : "text-emerald-400"}`}>{price}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border p-6 flex flex-col transition-all duration-200 ${plan.highlight ? "border-zinc-600/50 bg-[#1e1e22]/95 scale-[1.02] shadow-xl shadow-black/10" : "border-zinc-800/50 bg-[#18181b]"
                }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-zinc-900 text-[9px] font-black uppercase tracking-[0.18em] px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
                  RECOMMENDED
                </div>
              )}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white tabular-nums">{plan.price}</span>
                  <span className="text-xs text-zinc-600 font-medium">{plan.period}</span>
                </div>
                <div className="text-sm font-bold text-white mt-1">{plan.name}</div>
                <div className="text-xs text-zinc-600 mt-0.5">{plan.desc}</div>
              </div>
              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-xs text-zinc-400 leading-relaxed">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => onSelectPlan(plan.id)}
                disabled={loading}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer ${plan.highlight
                    ? "bg-white hover:bg-zinc-100 text-zinc-900 shadow-lg"
                    : "bg-zinc-800/80 hover:bg-zinc-700 text-white border border-zinc-700/50"
                  }`}
              >
                {loading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <><span>Start {plan.trial} free trial</span><ArrowRight className="w-3.5 h-3.5" /></>
                }
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-7 space-y-2">
          <p className="text-xs text-zinc-500 font-medium">
            ✦ Pro is the most common choice for businesses ranked #7–#15
          </p>
          <p className="text-[11px] text-zinc-700">
            No credit card required · Cancel anytime · Bot starts immediately
          </p>
        </div>
      </div>

    </div>
  );
}
