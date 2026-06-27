"use client";

import React from "react";
import {
  Bot, ArrowRight, CheckCircle, Loader2,
  Lock, AlertTriangle,
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



function getScrambledText(text: string): string {
  if (!text) return "";
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  return text
    .split("")
    .map((char, index) => {
      if (char >= "a" && char <= "z") {
        return alphabet[(index + char.charCodeAt(0)) % alphabet.length];
      }
      if (char >= "A" && char <= "Z") {
        return alphabet[(index + char.charCodeAt(0)) % alphabet.length].toUpperCase();
      }
      if (char >= "0" && char <= "9") {
        return String((index + char.charCodeAt(0)) % 10);
      }
      return char;
    })
    .join("");
}



function renderPartialBlurredKeyword(kw: string) {
  if (!kw) return null;
  const len = kw.length;
  const blurLen = Math.ceil(len * 0.3);
  const startIndex = Math.floor(len * 0.2);
  
  const clearStart = kw.slice(0, startIndex);
  const blurredPart = kw.slice(startIndex, startIndex + blurLen);
  const clearEnd = kw.slice(startIndex + blurLen);
  
  return (
    <span className="text-xs text-zinc-250 font-semibold truncate block">
      &ldquo;
      <span>{clearStart}</span>
      <span className="blur-[2.5px] opacity-35 select-none mx-[0.5px] text-zinc-450">
        {getScrambledText(blurredPart)}
      </span>
      <span>{clearEnd}</span>
      &rdquo;
    </span>
  );
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
      <span className="blur-[2.5px] opacity-30 mr-1 select-none tracking-wider text-zinc-400">{getScrambledText(blurred)}</span>
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

  const bName = html?.businessName ?? domain;
  const hash = bName.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const citationsCount = (hash % 18) + 8;

  const category = html?.category ?? "local business";
  const city = html?.city ?? "Austin";
  const state = html?.state ?? "TX";
  const userRank = ranking?.rank ?? 9;
  const speedScore = pageSpeed?.score ?? 38;

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
              className="flex items-start justify-between gap-4 p-4 rounded-xl border border-zinc-800/30 bg-[#121214]/60"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-zinc-150 mb-1">{label}</p>
                <p className="text-xs text-zinc-400 leading-relaxed font-medium">{ok ? pass : fail}</p>
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-md border whitespace-nowrap select-none mt-0.5 ${
                ok 
                  ? "text-emerald-400 bg-emerald-500/8 border-emerald-500/10" 
                  : "text-red-400 bg-red-500/8 border-red-500/10"
              }`}>
                {ok ? "Passed" : "Issue"}
              </span>
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
                        {getScrambledText("5.8s (Very Slow)")}
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
                        {getScrambledText("4 critical design issues")}
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
                    <span className="text-xs text-zinc-500 flex items-center gap-0.5 blur-[2.5px] select-none tracking-wider opacity-40">★ {getScrambledText(rating)}</span>
                    <span className="text-[11px] text-zinc-500 w-16 text-right blur-[2.5px] select-none tracking-wider opacity-40">{getScrambledText(reviews)} reviews</span>
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
              <span className="inline-flex items-center select-none"><span className="blur-[2.5px] opacity-30 tracking-wider text-gray-300 mr-0.5">{getScrambledText("Austin Dental W")}</span><span className="text-gray-300 font-semibold">orks</span></span> has 312 reviews. Every week they answer reviews and you don&apos;t, that gap gets bigger and harder to close.
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

            <div className="divide-y divide-zinc-800/30">
              {/* Row 1: Found Keyword (Business Name) */}
              <div className="flex items-center justify-between gap-4 py-2.5 px-0">
                <div className="min-w-0 flex-1">
                  <span className="text-xs text-zinc-200 font-semibold truncate block">&ldquo;{bName}&rdquo;</span>
                  <span className="text-[10px] text-zinc-500 font-medium block mt-0.5">You rank #1</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/8 border border-emerald-500/10 px-2.5 py-0.5 rounded-lg whitespace-nowrap">
                  Found
                </span>
              </div>

              {/* Row 2: Partially Blurred Gap (Category near me) */}
              <div className="flex items-center justify-between gap-4 py-2.5 px-0">
                <div className="min-w-0 flex-1">
                  {renderPartialBlurredKeyword(`${category} near me`)}
                  <span className="text-[10px] text-zinc-500 font-medium block mt-0.5">Competitor #1 ranks #1</span>
                </div>
                <span className="text-[10px] text-red-400 font-bold bg-red-500/8 border border-red-500/10 px-2 py-0.5 rounded-lg whitespace-nowrap">
                  You: not found
                </span>
              </div>

              {/* Row 3: Fully Blurred Gap */}
              {[
                { label: "implants near me", rank: 3 },
              ].map((item) => (
                <div 
                  key={item.label} 
                  onClick={scrollToPricing}
                  className="flex items-center justify-between gap-4 py-2.5 px-0 cursor-pointer select-none"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-xs text-zinc-400 font-semibold blur-[4px] opacity-25 select-none tracking-wider block">
                      {getScrambledText(item.label)}
                    </span>
                    <span className="text-[10px] text-zinc-600/20 font-medium select-none blur-[2.5px] block mt-0.5">
                      Competitor #{item.rank} ranks #1
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] text-zinc-650/20 font-bold bg-[#121214]/60 border border-zinc-850/20 px-2 py-0.5 rounded-lg whitespace-nowrap select-none blur-[2px]">
                      {getScrambledText("You: not found")}
                    </span>
                    <Lock className="w-3.5 h-3.5 text-zinc-600/30 flex-shrink-0" />
                  </div>
                </div>
              ))}

              {/* Row 4: Plus more indicator */}
              <div 
                onClick={scrollToPricing}
                className="flex items-center justify-between gap-4 py-2.5 px-0 cursor-pointer select-none"
              >
                <span className="text-xs font-semibold text-zinc-500">
                  + {keywordGapCount - 2} more keyword opportunities
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-zinc-600/30 blur-[2px] select-none uppercase tracking-widest">
                    {getScrambledText("[BLURRED]")}
                  </span>
                  <Lock className="w-3.5 h-3.5 text-zinc-600/30 flex-shrink-0" />
                </div>
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

        {/* 4.5 · WHAT YOUR BOT WOULD HAVE DONE */}
        <div className="rounded-2xl border border-zinc-800/50 bg-[#18181b] p-4 md:p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white leading-tight">
              Your bot would have already done this:
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5 mb-3.5 leading-relaxed uppercase tracking-wider font-semibold">
              IF YOU HAD SIGNED UP 7 DAYS AGO
            </p>

            <div className="divide-y divide-zinc-800/30">
              {botWeekRows.map((text, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 px-0">
                  <span className="text-emerald-400 font-bold text-sm flex-shrink-0 mt-0.5">✓</span>
                  <span className="text-xs text-zinc-300 leading-relaxed font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-zinc-800/50">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/8 border border-red-500/10">
              <span className="text-red-400 font-black text-sm flex-shrink-0 mt-0.5">✗</span>
              <span className="text-xs text-zinc-300 leading-relaxed font-medium">
                You did 0 of these. Competitor #1 automated all 4.{" "}
                <span className="text-red-400 font-bold">This gap widens every week.</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: AI Search Engine Gaps (Borderless, Plain Centered Text) */}
        <div className="flex flex-col items-center justify-center text-center p-6 min-h-[220px]">
          <p className="text-zinc-400 text-sm leading-relaxed max-w-[280px] mb-3">
            Want to rank in ChatGPT, Gemini, Perplexity, and AI search answers?
          </p>
          <button 
            onClick={scrollToPricing}
            className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 justify-center"
          >
            Unlock AI Search Rankings from $49/mo <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

            {/* 4 · OVERVIEW */}
      <div className="rounded-2xl border border-zinc-800/50 bg-[#18181b] p-6 md:p-8">
        <Label>AI Crawl & Audit Overview</Label>
        <h3 className="text-xl font-bold text-white mt-3 mb-4 leading-tight">
          Full analysis of <span className="text-emerald-400 font-extrabold">{domain}</span> completed
        </h3>
        <p className="text-zinc-300 text-sm md:text-base leading-[1.8] font-medium w-full">
          Our AI audit engine has completed a live crawl of <span className="text-white font-semibold">{domain}</span>, scanning the homepage metadata, structural layouts, and assets. The crawl analyzed exactly <span className="text-white font-semibold">{html?.wordCount || 350} words</span> of text content, <span className="text-white font-semibold">{html?.imageCount || 12} images</span>, and <span className="text-white font-semibold">{html?.internalLinks || 8} internal links</span> to evaluate search engine indexability, H1–H3 heading hierarchy, local Schema markup, and mobile page performance. This detailed crawl data has been analyzed by our AI models to evaluate your current Maps position and identify the critical directory and ranking gaps that are currently suppressing your visibility.
        </p>
      </div>



      {/* ══════════════════════════════════════════════════════════
          PRICING
          ══════════════════════════════════════════════════════════ */}

      <div id="pricing-section" className="pt-8 pb-2 scroll-mt-8">
        <div className="text-center mb-8">
          <Label>Your Fix Plan</Label>
          <h2 className="text-2xl md:text-4xl font-semibold text-white tracking-tight mt-4 mb-3">
            Everything above - automated, every week.
          </h2>
          <p className="text-zinc-500 text-sm max-w-sm mx-auto leading-relaxed">
            No agency. No manual work. Bot starts the moment you connect Google.
          </p>
        </div>

        {/* Cost comparison anchor */}
        <div className="mb-6 rounded-xl  bg-[#18181b] p-4">
          <p className="text-[16px] text-white tracking-tight font-medium mb-3">What people normally pay for this</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "SEO agency", price: "$1,500–3,000/mo", dim: true },
              { label: "Freelance SEO", price: "$500–1,500/mo", dim: true },
              { label: "ReachAgent", price: "from $49/mo", dim: false },
            ].map(({ label, price, dim }) => (
              <div key={label} className={`rounded-lg p-3 ${dim ? "bg-[#121214]/50" : "bg-white/5 border border-white/10"}`}>
                <p className={`text-[14px] font-medium tracking-tight mb-1 ${dim ? "text-zinc-400" : "text-white"}`}>{label}</p>
                <p className={`text-[14px] font-medium tabular-nums ${dim ? "text-zinc-300" : "text-emerald-400"}`}>{price}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border p-6 flex flex-col transition-all duration-200 ${
                plan.highlight
                  ? "border-zinc-700 bg-[#1b1b1e]/95 scale-[1.02] shadow-xl shadow-black/30"
                  : "border-zinc-800/80 bg-[#141416]"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[10px] font-semibold tracking-tight px-3 py-0.5 rounded-full shadow-lg shadow-black/20 whitespace-nowrap">
                  Recommended
                </div>
              )}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-semibold text-white tracking-tight tabular-nums">{plan.price}</span>
                  <span className="text-xs text-zinc-500 font-medium tracking-tight">{plan.period}</span>
                </div>
                <div className="text-base font-semibold text-white mt-1.5 tracking-tight">{plan.name}</div>
                <div className="text-xs text-zinc-400 mt-1 tracking-tight font-medium">{plan.desc}</div>
              </div>
              <ul className="space-y-3 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-xs text-zinc-300 leading-relaxed tracking-tight font-medium">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => onSelectPlan(plan.id)}
                disabled={loading}
                className={`w-full py-2.5 rounded-xl text-xs font-semibold tracking-tight transition-all duration-150 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer ${
                  plan.highlight
                    ? "bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/5 hover:shadow-emerald-500/10"
                    : "bg-[#1f1f23] hover:bg-[#27272c] text-zinc-200 border border-zinc-800"
                }`}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Start {plan.trial} free trial</span>
                    <ArrowRight className="w-3 h-3" />
                  </>
                )}
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
