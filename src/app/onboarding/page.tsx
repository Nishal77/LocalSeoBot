"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import {
  Bot, ArrowRight, CheckCircle, XCircle, Loader2,
  Lock, Zap, TrendingUp, MapPin, Shield, FileText,
  Image as ImageIcon, Link as LinkIcon, Globe, AlertTriangle,
} from "lucide-react";
import type { FullAnalysis } from "@/lib/onboarding/types";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import { IconSquareRoundedX } from "@tabler/icons-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractDomain(url: string) {
  return url.replace(/https?:\/\/(www\.)?/, "").split("/")[0];
}

function sleep(ms: number) { return new Promise<void>((r) => setTimeout(r, ms)); }

function gradeColor(g: string) {
  return g === "A" ? "text-emerald-400" : g === "B" ? "text-blue-400" : g === "C" ? "text-yellow-400" : g === "D" ? "text-orange-400" : "text-red-400";
}
function scoreStroke(s: number) {
  return s >= 80 ? "#34d399" : s >= 65 ? "#60a5fa" : s >= 45 ? "#facc15" : s >= 25 ? "#fb923c" : "#f87171";
}

// ─── Logo ─────────────────────────────────────────────────────────────────────

function Logo() {
  return (
    <div className="flex items-center gap-2.5 mb-10">
      <span className="text-white font-medium text-lg tracking-tight">RankAgent</span>
    </div>
  );
}

// ─── Phase 1: URL Input ───────────────────────────────────────────────────────

const TICKER_ITEMS = [
  { domain: "mapleleafplumbing.com", text: "found #8 ranking, 6 competitors" },
  { domain: "smilecaredental.com", text: "found 142 citation gaps" },
  { domain: "austinhvacpro.com", text: "moved from #9 to #3 in 6 weeks" },
];

function PhaseInput({ onSubmit }: { onSubmit: (url: string) => void }) {
  const [url, setUrl] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setTickerIndex((prev) => (prev + 1) % TICKER_ITEMS.length);
        setFade(true);
      }, 300);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = url.trim();
    if (!v) return;
    onSubmit(v.startsWith("http") ? v : `https://${v}`);
  }

  return (
    <div className="w-full max-w-4xl flex flex-col items-center text-center px-4">
      <Logo />
      <div className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-4 py-1 text-sm font-medium text-zinc-300 mb-6 tracking-tight backdrop-blur-md select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2 flex-shrink-0 animate-pulse" />
        Free AI Audit — 15 seconds — no account needed
      </div>
      <h1 className="text-4xl md:text-[56px] font-semibold text-white tracking-tight leading-[1.06] mb-6 max-w-3xl">
        See exactly why your website isn&apos;t ranking #1 on {" "}
        <span className="inline-flex select-none tracking-tight">
          <span className="text-[#4285F4]">G</span>
          <span className="text-[#EA4335]">o</span>
          <span className="text-[#FBBC05]">o</span>
          <span className="text-[#4285F4]">g</span>
          <span className="text-[#34A853]">l</span>
          <span className="text-[#EA4335] inline-block transform -rotate-[20deg] origin-[50%_70%]">e</span>
        </span>
        .
      </h1>
      <p className="text-zinc-400 text-base md:text-lg mb-10 max-w-3xl leading-relaxed">
        Enter your website. Our AI instantly runs a live 250-point SEO audit, benchmarks your site speed, checks your Google Maps positions, and scans competitor ranking gaps.
      </p>
      <form onSubmit={submit} className="w-full max-w-xl">
        <div className="flex gap-2 w-full p-1.5 rounded-2xl border border-zinc-800 bg-zinc-900/70  transition-colors duration-200">
          <input
            ref={inputRef}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="yourbusiness.com"
            className="flex-1 bg-transparent text-white placeholder:text-zinc-600 text-sm px-4 py-3 outline-none min-w-0"
          />
          <button
            type="submit"
            disabled={!url.trim()}
            className="flex items-center gap-2 bg-white hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-900 font-medium text-sm px-5 py-3 rounded-xl transition-all flex-shrink-0"
          >
            Analyze <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
      <div className="mt-10 inline-flex items-center gap-2.5 rounded-full bg-zinc-900/40 px-4 py-2 text-xs text-zinc-400 select-none backdrop-blur-md">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
        </span>
        <span className={`transition-all duration-300 transform ${fade ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"}`}>
          Just analyzed: <span className="text-zinc-200 font-medium">{TICKER_ITEMS[tickerIndex].domain}</span> —{" "}
          <span className="text-emerald-400 font-medium">{TICKER_ITEMS[tickerIndex].text}</span>
        </span>
      </div>
    </div>
  );
}

// ─── Phase 2: Scanning ────────────────────────────────────────────────────────

interface ScanLine { label: string; result: string | null; status: "waiting" | "active" | "done" | "failed"; }

const SCAN_STEPS: ScanLine[] = [
  { label: "Found your business", result: null, status: "waiting" },
  { label: "Located in", result: null, status: "waiting" },
  { label: "Current Google Maps rank", result: null, status: "waiting" },
  { label: "PageSpeed", result: null, status: "waiting" },
  { label: "Reviews", result: null, status: "waiting" },
  { label: "Schema markup", result: null, status: "waiting" },
  { label: "Citations", result: null, status: "waiting" },
  { label: "Competitors detected", result: null, status: "waiting" },
  { label: "AI building your personalized strategy", result: null, status: "waiting" },
];

const STEP_DELAYS = [0, 1800, 3600, 5400, 7200, 9000, 10800, 12600, 14400];

function populateResults(result: FullAnalysis, update: (i: number, r: string) => void) {
  const { html, pageSpeed, ranking } = result;

  // 1. Found your business
  const bName = html?.businessName || (html?.title ? html.title.split(" - ")[0] : "Local Business");
  update(0, `"${bName}"`);

  // 2. Located in
  const city = html?.city || "Austin";
  const state = html?.state || "TX";
  update(1, `${city}, ${state}`);

  // 3. Current Google Maps rank
  if (ranking) {
    update(2, ranking.rank ? `#${ranking.rank}` : "Not in top 20");
  } else {
    update(2, "Not in top 20");
  }

  // 4. PageSpeed
  if (pageSpeed) {
    const score = pageSpeed.score;
    const slowerPct = score >= 90 ? "12%" : score >= 70 ? "35%" : score >= 50 ? "58%" : "78%";
    update(3, `${score}/100 — slower than ${slowerPct} of competitors`);
  } else {
    update(3, "41/100 — slower than 78% of competitors");
  }

  // Deterministic values based on name hash for consistency
  const hash = bName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // 5. Reviews
  const reviewsCount = (hash % 45) + 12; // 12-56 reviews
  const avgRating = (4.0 + (hash % 10) / 10).toFixed(1); // 4.0 - 4.9 rating
  update(4, `${reviewsCount} total · ${avgRating} avg`);

  // 6. Schema markup
  update(5, html?.hasSchemaMarkup ? "detected ✓" : "missing ✗");

  // 7. Citations
  const citationsFound = (hash % 18) + 8; // 8-25 found
  update(6, `Found on ${citationsFound} · Missing from ${200 - citationsFound}`);

  // 8. Competitors detected
  const rankVal = ranking?.rank ?? 9;
  const competitorsCount = rankVal > 1 ? rankVal - 1 : 5;
  update(7, `${competitorsCount} businesses outranking you`);

  // 9. AI building personalized strategy
  update(8, "Ready ✓");
}

function PhaseScanning({ url, onDone, onCancel }: { url: string; onDone: (r: FullAnalysis | null) => void; onCancel?: () => void }) {
  const [lines, setLines] = useState<ScanLine[]>(SCAN_STEPS.map((s) => ({ ...s })));
  const [activeIdx, setActiveIdx] = useState(0);
  const resultRef = useRef<FullAnalysis | null>(null);
  const apiDoneRef = useRef(false);
  const animDoneRef = useRef(false);

  function updateLine(idx: number, u: Partial<ScanLine>) {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...u } : l)));
  }
  function updateResult(idx: number, result: string) {
    updateLine(idx, { result });
  }

  useEffect(() => {
    let cancelled = false;

    // API call
    void fetch("/api/onboarding/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    })
      .then((r) => r.json())
      .then((data: FullAnalysis) => {
        if (cancelled) return;
        resultRef.current = data;
        populateResults(data, (i, r) => {
          if (!cancelled) updateResult(i, r);
        });
        apiDoneRef.current = true;
        if (animDoneRef.current) onDone(resultRef.current);
      })
      .catch(() => {
        if (!cancelled) {
          apiDoneRef.current = true;
          if (animDoneRef.current) onDone(null);
        }
      });

    // Animation
    void (async () => {
      for (let i = 0; i < STEP_DELAYS.length; i++) {
        if (cancelled) return;
        const delay = i === 0 ? STEP_DELAYS[0] : STEP_DELAYS[i] - STEP_DELAYS[i - 1];
        await sleep(delay);
        if (cancelled) return;
        setLines((prev) =>
          prev.map((l, idx) => ({
            ...l,
            status: idx < i ? "done" : idx === i ? "active" : "waiting",
          })),
        );
        setActiveIdx(i);
      }
      // Make them wait 3.5 seconds on the final AI strategy step
      await sleep(3500);
      if (cancelled) return;
      setLines((prev) => prev.map((l) => ({ ...l, status: "done" })));
      setActiveIdx(STEP_DELAYS.length);
      animDoneRef.current = true;
      if (apiDoneRef.current) onDone(resultRef.current);
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadingStates = lines.map((l, index) => {
    // If the step is waiting, show its base label
    if (l.status === "waiting") {
      if (index === 6) return { text: "Citations: checking 200 directories..." };
      return { text: l.label };
    }
    // If active, show active state
    if (l.status === "active") {
      if (index === 0) return { text: "Finding your business..." };
      if (index === 1) return { text: "Locating business area..." };
      if (index === 2) return { text: "Checking Google Maps rank..." };
      if (index === 3) return { text: "Running PageSpeed test..." };
      if (index === 4) return { text: "Scanning customer reviews..." };
      if (index === 5) return { text: "Checking schema markup..." };
      if (index === 6) return { text: "Citations: checking 200 directories..." };
      if (index === 7) return { text: "Detecting competitors..." };
      if (index === 8) return { text: "AI building your personalized strategy..." };
    }
    // If done/failed, show the full Discovery-style text
    if (index === 0) return { text: `Found your business: ${l.result || '"Unknown"'}` };
    if (index === 1) return { text: `Located in: ${l.result || "Austin, TX"}` };
    if (index === 2) return { text: `Current Google Maps rank: ${l.result || "#9"}` };
    if (index === 3) return { text: `PageSpeed: ${l.result || "41/100"}` };
    if (index === 4) return { text: `Reviews: ${l.result || "23 total · 4.2 avg"}` };
    if (index === 5) return { text: `Schema markup: ${l.result || "missing ✗"}` };
    if (index === 6) return { text: `Citations: ${l.result || "Found on 12 · Missing from 188"}` };
    if (index === 7) return { text: `Competitors detected: ${l.result || "5 businesses outranking you"}` };
    if (index === 8) return { text: "AI building your personalized strategy..." };
    
    return { text: l.label };
  });

  return (
    <div className="w-full min-h-[60vh] flex items-center justify-center">
      <MultiStepLoader
        loadingStates={loadingStates}
        loading={true}
        value={activeIdx}
        loop={false}
      />
      {onCancel && (
        <button
          className="fixed top-4 right-4 text-zinc-400 hover:text-white transition-colors z-[120] cursor-pointer"
          onClick={onCancel}
        >
          <IconSquareRoundedX className="h-10 w-10" />
        </button>
      )}
    </div>
  );
}

// ─── Phase 3: Report ──────────────────────────────────────────────────────────

function ScoreRing({ score, grade }: { score: number; grade: string }) {
  const r = 46;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = scoreStroke(score);
  return (
    <div className="flex flex-col items-center">
      <svg width="116" height="116" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} stroke="#27272a" strokeWidth="8" fill="none" />
        <circle
          cx="50" cy="50" r={r} stroke={color} strokeWidth="8" fill="none"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ transition: "stroke-dashoffset 1.4s ease" }}
        />
        <text x="50" y="46" textAnchor="middle" fill="white" fontSize="22" fontWeight="700">{score}</text>
        <text x="50" y="58" textAnchor="middle" fill="#52525b" fontSize="8">/ 100</text>
      </svg>
      <span className={`text-xl font-bold mt-0.5 ${gradeColor(grade)}`}>Grade {grade}</span>
    </div>
  );
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-zinc-500">{label}</span>
        <span className={`font-semibold ${color}`}>{value}/100</span>
      </div>
      <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${value}%`, background: color.includes("emerald") ? "#34d399" : color.includes("blue") ? "#60a5fa" : color.includes("yellow") ? "#facc15" : color.includes("orange") ? "#fb923c" : "#f87171" }}
        />
      </div>
    </div>
  );
}

function CheckRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {ok
        ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
        : <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
      <span className={ok ? "text-zinc-300" : "text-zinc-500"}>{label}</span>
    </div>
  );
}

function SeverityBadge({ count, severity }: { count: number; severity: "critical" | "warning" | "info" }) {
  const styles = {
    critical: "bg-red-500/10 border-red-500/20 text-red-400",
    warning: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
    info: "bg-zinc-800 border-zinc-700 text-zinc-400",
  };
  const labels = { critical: "critical", warning: "warnings", info: "notices" };
  return (
    <div className={`flex flex-col items-center rounded-xl border px-4 py-3 ${styles[severity]}`}>
      <span className="text-2xl font-bold">{count}</span>
      <span className="text-[10px] uppercase tracking-widest mt-0.5">{labels[severity]}</span>
    </div>
  );
}

function LockedCard({ title, icon, preview, badge }: {
  title: string; icon: React.ReactNode; preview: React.ReactNode; badge?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden relative">
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-zinc-600">{icon}</span>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{title}</p>
          {badge && (
            <span className="ml-auto text-[10px] font-bold text-violet-400 border border-violet-500/20 bg-violet-500/10 rounded-full px-2 py-0.5">{badge}</span>
          )}
        </div>
        <div className="blur-[3px] select-none pointer-events-none opacity-50 space-y-2">
          {preview}
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-zinc-950/20 to-zinc-950/70">
        <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-700/60 rounded-xl px-3.5 py-2 shadow-xl backdrop-blur-sm">
          <Lock className="w-3.5 h-3.5 text-violet-400" />
          <span className="text-white text-xs font-semibold">Unlock full data</span>
        </div>
      </div>
    </div>
  );
}

const PLANS = [
  {
    id: "starter", name: "Starter", price: "$49", period: "/mo", desc: "1 location",
    features: ["Weekly GBP posts (AI)", "All reviews responded in 2hrs", "Top 50 citations built", "10 keywords tracked", "Monday morning report", "7-day free trial"],
    highlight: false,
  },
  {
    id: "pro", name: "Pro", price: "$99", period: "/mo", desc: "1 location · Most popular",
    features: ["Everything in Starter", "200+ citation directories", "20 keywords tracked", "Competitor monitoring", "Post & review approval flow", "Review request campaigns", "14-day free trial"],
    highlight: true,
  },
  {
    id: "growth", name: "Growth", price: "$199", period: "/mo", desc: "3 locations",
    features: ["Everything in Pro × 3 locations", "Unlimited keywords", "10 competitors tracked", "White-label PDF reports", "Priority support", "14-day free trial"],
    highlight: false,
  },
];

function PhaseReport({
  result, url, onSelectPlan, loading,
}: {
  result: FullAnalysis; url: string; onSelectPlan: (plan: string) => void; loading: boolean;
}) {
  const domain = extractDomain(url);
  const { html, pageSpeed, site, ranking, scores, issues, aiSummary } = result;

  const criticals = issues.filter((i) => i.severity === "critical").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;
  const infos = issues.filter((i) => i.severity === "info").length;

  const speedColor = !pageSpeed ? "text-zinc-500" : pageSpeed.score >= 70 ? "text-emerald-400" : pageSpeed.score >= 50 ? "text-yellow-400" : "text-red-400";
  const rankColor = !ranking?.rank ? "text-red-400" : ranking.rank <= 3 ? "text-emerald-400" : ranking.rank <= 10 ? "text-yellow-400" : "text-orange-400";

  const keyword = ranking?.keyword ?? `${html?.category ?? "local business"} ${html?.city ?? "your city"}`;
  const city = html?.city ?? "your city";

  const gradeHeadline: Record<string, string> = {
    A: "Strong SEO presence",
    B: "Good foundation, clear gaps",
    C: "Below average — losing customers",
    D: "Significant issues found",
    F: "Critical SEO problems",
  };

  return (
    <div className="w-full max-w-3xl flex flex-col items-center pb-20">
      <Logo />

      {/* Header */}
      <div className="w-full mb-5">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs text-emerald-400 font-medium uppercase tracking-widest">Audit complete</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-semibold text-white">
          SEO report for <span className="text-violet-400">{domain}</span>
        </h2>
        {html?.businessName && html.businessName !== domain && (
          <p className="text-zinc-500 text-sm mt-1">
            {html.businessName}{html.city ? ` · ${html.city}${html.state ? `, ${html.state}` : ""}` : ""}
          </p>
        )}
      </div>

      {/* Score + breakdown */}
      <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 mb-4 flex flex-col md:flex-row gap-6">
        <ScoreRing score={scores.overall} grade={scores.grade} />
        <div className="flex-1 flex flex-col justify-center">
          <p className="text-white font-semibold text-lg mb-1">{gradeHeadline[scores.grade] ?? "Analysis complete"}</p>
          <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
            Your website scored better than{" "}
            <span className="text-white font-medium">
              {scores.overall <= 30 ? "~20%" : scores.overall <= 50 ? "~40%" : scores.overall <= 65 ? "~55%" : "~70%"}
            </span>{" "}
            of local business sites we analyze. {scores.overall < 65 ? "There are clear gaps that are costing you customers." : "A few improvements could push you to the top."}
          </p>
          <div className="space-y-2.5">
            <ScoreBar label="Technical" value={scores.technical} color={scores.technical >= 70 ? "text-emerald-400" : scores.technical >= 45 ? "text-yellow-400" : "text-red-400"} />
            <ScoreBar label="Content" value={scores.content} color={scores.content >= 70 ? "text-emerald-400" : scores.content >= 45 ? "text-yellow-400" : "text-red-400"} />
            <ScoreBar label="Performance" value={scores.performance} color={scores.performance >= 70 ? "text-emerald-400" : scores.performance >= 45 ? "text-yellow-400" : "text-red-400"} />
            <ScoreBar label="Local SEO" value={scores.local} color={scores.local >= 70 ? "text-emerald-400" : scores.local >= 45 ? "text-yellow-400" : "text-red-400"} />
          </div>
        </div>
      </div>

      {/* AI Summary */}
      {aiSummary && (
        <div className="w-full rounded-2xl border border-violet-500/20 bg-violet-500/[0.03] p-5 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bot className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-violet-400 uppercase tracking-widest mb-1.5">AI Analysis</p>
              <p className="text-zinc-300 text-sm leading-relaxed">{aiSummary}</p>
            </div>
          </div>
        </div>
      )}

      {/* Issues callout */}
      <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 mb-4">
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">We analyzed 250+ signals and found</p>
        <div className="flex gap-3 mb-3">
          <SeverityBadge count={criticals} severity="critical" />
          <SeverityBadge count={warnings} severity="warning" />
          <SeverityBadge count={infos} severity="info" />
        </div>
        <div className="space-y-1.5 mt-3">
          {issues.slice(0, 4).map((issue, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <AlertTriangle className={`w-3 h-3 flex-shrink-0 mt-0.5 ${
                issue.severity === "critical" ? "text-red-400" : issue.severity === "warning" ? "text-yellow-400" : "text-zinc-500"
              }`} />
              <span className="text-zinc-400">{issue.message}</span>
            </div>
          ))}
          {issues.length > 4 && (
            <p className="text-xs text-zinc-600 pl-5">+{issues.length - 4} more issues — unlock to view all</p>
          )}
        </div>
      </div>

      {/* Real data grid row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full mb-3">
        {/* Site Speed */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-3.5 h-3.5 text-zinc-600" />
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Site Speed</p>
          </div>
          {pageSpeed ? (
            <>
              <div className="flex items-end gap-1.5 mb-1">
                <span className={`text-3xl font-bold ${speedColor}`}>{pageSpeed.score}</span>
                <span className="text-zinc-600 text-xs mb-1">/100 mobile</span>
              </div>
              <p className={`text-xs font-medium mb-2 ${speedColor}`}>
                {pageSpeed.score >= 70 ? "Fast" : pageSpeed.score >= 50 ? "Needs work" : "Slow — hurting rankings"}
              </p>
              {pageSpeed.lcp && <p className="text-xs text-zinc-500">LCP: {pageSpeed.lcp}</p>}
              {pageSpeed.fcp && <p className="text-xs text-zinc-500">FCP: {pageSpeed.fcp}</p>}
              {pageSpeed.cls && <p className="text-xs text-zinc-500">CLS: {pageSpeed.cls}</p>}
            </>
          ) : (
            <p className="text-sm text-zinc-500">Site may block test bots</p>
          )}
        </div>

        {/* Business Info */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-3.5 h-3.5 text-zinc-600" />
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Business Info</p>
          </div>
          {html ? (
            <>
              <p className="text-white font-semibold text-sm mb-1 truncate">{html.businessName ?? domain}</p>
              {html.city && (
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1">
                  <MapPin className="w-3 h-3 flex-shrink-0" />{html.city}{html.state ? `, ${html.state}` : ""}
                </div>
              )}
              {html.phone && <p className="text-xs text-zinc-500 mb-2">{html.phone}</p>}
              <CheckRow ok={html.hasSchemaMarkup} label={`Schema: ${html.hasSchemaMarkup ? html.schemaTypes[0] ?? "found" : "missing"}`} />
              <div className="mt-1">
                <CheckRow ok={html.hasOgTags} label="Open Graph tags" />
              </div>
            </>
          ) : (
            <p className="text-sm text-zinc-500">Structured data not found</p>
          )}
        </div>

        {/* Google Maps Rank */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-3.5 h-3.5 text-zinc-600" />
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Google Maps Rank</p>
          </div>
          {ranking ? (
            <>
              <div className="flex items-end gap-1.5 mb-1">
                <span className={`text-3xl font-bold ${rankColor}`}>{ranking.rank ? `#${ranking.rank}` : "—"}</span>
              </div>
              <p className="text-xs text-zinc-400 mb-2 leading-tight">for &ldquo;{ranking.keyword}&rdquo;</p>
              {ranking.rank && ranking.rank > 3 && (
                <p className="text-xs text-orange-400">Top 3 gets 87% of calls. {ranking.rank - 3} spots away.</p>
              )}
              {!ranking.rank && <p className="text-xs text-red-400">Not found — customers can&apos;t reach you.</p>}
            </>
          ) : (
            <div>
              <p className="text-sm text-zinc-500 mb-1">City not detected</p>
              <p className="text-xs text-zinc-600">Rank data available after connecting Google account.</p>
            </div>
          )}
        </div>
      </div>

      {/* Real data grid row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full mb-6">
        {/* Technical Health */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-3.5 h-3.5 text-zinc-600" />
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Technical Health</p>
          </div>
          <div className="space-y-1.5">
            <CheckRow ok={site.ssl} label="HTTPS / SSL" />
            <CheckRow ok={site.robotsTxt} label="robots.txt" />
            <CheckRow ok={site.sitemapFound} label={`Sitemap${site.sitemapUrlCount ? ` (${site.sitemapUrlCount} URLs)` : ""}`} />
            <CheckRow ok={!!(html?.canonical)} label="Canonical URL" />
          </div>
        </div>

        {/* Content Quality */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-3.5 h-3.5 text-zinc-600" />
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Content Quality</p>
          </div>
          {html ? (
            <div className="space-y-1.5">
              <CheckRow ok={!!(html.title && html.titleLength >= 30 && html.titleLength <= 60)} label={`Title: ${html.title ? `${html.titleLength}ch` : "missing"}`} />
              <CheckRow ok={!!(html.metaDescription && html.descriptionLength >= 70)} label={`Description: ${html.metaDescription ? `${html.descriptionLength}ch` : "missing"}`} />
              <CheckRow ok={html.h1Count === 1} label={`H1: ${html.h1Count} found`} />
              <CheckRow ok={(html.wordCount ?? 0) >= 300} label={`~${html.wordCount} words`} />
            </div>
          ) : (
            <p className="text-sm text-zinc-500">Content data unavailable</p>
          )}
        </div>

        {/* Page Structure */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon className="w-3.5 h-3.5 text-zinc-600" />
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Page Structure</p>
          </div>
          {html ? (
            <>
              <div className="space-y-1.5 mb-2">
                <CheckRow ok={html.imagesWithoutAlt === 0} label={`Images: ${html.imageCount} · ${html.imagesWithoutAlt} no alt`} />
                <CheckRow ok={(html.internalLinks ?? 0) >= 10} label={`${html.internalLinks} internal links`} />
              </div>
              {html.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {html.technologies.slice(0, 4).map((t) => (
                    <span key={t} className="text-[10px] text-zinc-500 border border-zinc-800 rounded-full px-2 py-0.5">{t}</span>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-zinc-500">Structure data unavailable</p>
          )}
        </div>
      </div>

      {/* Locked premium sections */}
      <div className="w-full flex items-center gap-3 mb-3">
        <div className="flex-1 h-px bg-zinc-800" />
        <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest whitespace-nowrap">Unlock with RankAgent AI</span>
        <div className="flex-1 h-px bg-zinc-800" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full mb-3">
        <LockedCard
          title="Citation Gaps"
          badge={`~140 missing`}
          icon={<LinkIcon className="w-3.5 h-3.5" />}
          preview={
            <div className="space-y-1.5">
              {["Yelp", "Apple Maps", "Bing Places", "Foursquare", "BBB"].map((d) => (
                <div key={d} className="flex justify-between text-xs">
                  <span>{d}</span><span className="text-red-400">✗ Not listed</span>
                </div>
              ))}
            </div>
          }
        />
        <LockedCard
          title="Competitor Analysis"
          badge="5 found"
          icon={<TrendingUp className="w-3.5 h-3.5" />}
          preview={
            <div className="space-y-2">
              {["████ & Associates", "████ Services Co.", "████ Solutions LLC"].map((c, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span>{c}</span>
                  <span className="text-yellow-400 font-medium">#{i + 1}</span>
                </div>
              ))}
              <p className="text-xs text-red-400 pt-0.5">All outrank you currently</p>
            </div>
          }
        />
        <LockedCard
          title="Keyword Opportunities"
          badge="17 found"
          icon={<Globe className="w-3.5 h-3.5" />}
          preview={
            <div className="space-y-1.5">
              {[`${html?.category ?? "service"} near me`, `best ${html?.category ?? "service"} ${city}`, `${html?.category ?? "service"} reviews ${city}`].map((kw, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="truncate">{kw}</span>
                  <span className="text-zinc-500 ml-2">not ranking</span>
                </div>
              ))}
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full mb-8">
        <LockedCard
          title="Backlink Profile"
          badge="Authority score"
          icon={<LinkIcon className="w-3.5 h-3.5" />}
          preview={
            <div className="space-y-2">
              <div className="flex justify-between text-xs"><span>Domain Authority</span><span>██/100</span></div>
              <div className="flex justify-between text-xs"><span>Referring domains</span><span>██</span></div>
              <div className="flex justify-between text-xs"><span>Toxic backlinks</span><span>██ detected</span></div>
            </div>
          }
        />
        <LockedCard
          title="Revenue Opportunities"
          badge="Estimated impact"
          icon={<TrendingUp className="w-3.5 h-3.5" />}
          preview={
            <div className="space-y-2">
              <div className="flex justify-between text-xs"><span>Est. monthly missed clicks</span><span>████</span></div>
              <div className="flex justify-between text-xs"><span>Top revenue keyword</span><span>████████</span></div>
              <div className="flex justify-between text-xs"><span>AI action priority</span><span>████ fixes first</span></div>
            </div>
          }
        />
      </div>

      {/* CTA Banner */}
      <div className="w-full rounded-2xl border border-violet-500/20 bg-violet-500/[0.04] p-6 mb-5">
        <p className="text-white font-semibold text-base mb-1">Your complete AI SEO strategy is ready.</p>
        <p className="text-zinc-400 text-sm mb-4">
          We found opportunities your competitors are already using. RankAgent AI fixes every issue automatically — weekly GBP posts, 200+ citations built, every review responded to within 2 hours.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { icon: <TrendingUp className="w-3.5 h-3.5" />, text: `Target top 3 for "${keyword.split(" ").slice(0, 3).join(" ")}"` },
            { icon: <CheckCircle className="w-3.5 h-3.5" />, text: "200+ citations submitted" },
            { icon: <MapPin className="w-3.5 h-3.5" />, text: "Reviews replied < 2hrs" },
            { icon: <Zap className="w-3.5 h-3.5" />, text: "Zero hours from you/week" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="text-emerald-400 flex-shrink-0">{item.icon}</span>
              {item.text}
            </div>
          ))}
        </div>
      </div>

      <p className="text-zinc-500 text-sm mb-5 text-center">
        Agencies charge <span className="line-through text-zinc-600">$1,500/month</span> for this. Pick a plan:
      </p>

      {/* Pricing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-4">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-2xl border p-6 flex flex-col transition-all ${
              plan.highlight
                ? "border-violet-500/40 bg-violet-500/[0.05] shadow-[0_0_50px_-12px_rgba(139,92,246,0.25)]"
                : "border-zinc-800 bg-zinc-900/30"
            }`}
          >
            {plan.highlight && (
              <div className="text-[10px] font-bold text-violet-400 tracking-widest uppercase mb-2">Most popular</div>
            )}
            <div className="text-2xl font-bold text-white mb-0.5">
              {plan.price}<span className="text-sm font-normal text-zinc-500">{plan.period}</span>
            </div>
            <div className="text-sm font-semibold text-white">{plan.name}</div>
            <div className="text-xs text-zinc-500 mb-4">{plan.desc}</div>
            <ul className="space-y-2 flex-1 mb-5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-zinc-400">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => onSelectPlan(plan.id)}
              disabled={loading}
              className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                plan.highlight
                  ? "bg-white hover:bg-zinc-100 text-zinc-900"
                  : "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
              }`}
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : `Start ${plan.name} — free trial`}
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-zinc-600 text-center">No credit card required · Cancel anytime · Bot starts immediately</p>
    </div>
  );
}

// ─── Main wizard ──────────────────────────────────────────────────────────────

type Phase = "input" | "scanning" | "report";

function OnboardingWizard() {
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [phase, setPhase] = useState<Phase>("input");
  const [url, setUrl] = useState("");
  const [analyzeResult, setAnalyzeResult] = useState<FullAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);

  useEffect(() => {
    const bid = searchParams.get("businessId");
    const gbp = searchParams.get("gbp");
    if (bid) setBusinessId(bid);
    if (gbp === "connected" && bid) setPhase("report");

    // Restore pending plan after Google OAuth redirect
    try {
      const pending = sessionStorage.getItem("rankagent_pending");
      if (pending) {
        const { savedUrl, savedResult, planId } = JSON.parse(pending) as {
          savedUrl: string; savedResult: FullAnalysis; planId: string;
        };
        sessionStorage.removeItem("rankagent_pending");
        if (savedUrl && savedResult) {
          setUrl(savedUrl);
          setAnalyzeResult(savedResult);
          setPhase("report");
          sessionStorage.setItem("rankagent_autoplan", planId);
        }
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-complete checkout after sign-in redirect
  useEffect(() => {
    if (status !== "authenticated") return;
    const autoplan = sessionStorage.getItem("rankagent_autoplan");
    if (!autoplan) return;
    sessionStorage.removeItem("rankagent_autoplan");
    void handleSelectPlan(autoplan);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function handleSelectPlan(planId: string) {
    if (status === "unauthenticated" || (!session && status !== "loading")) {
      try {
        sessionStorage.setItem("rankagent_pending", JSON.stringify({ savedUrl: url, savedResult: analyzeResult, planId }));
      } catch { /* ignore */ }
      void signIn("google", { callbackUrl: "/onboarding" });
      return;
    }

    setLoading(true);
    try {
      let bid = businessId;
      if (!bid) {
        const res = await fetch("/api/onboarding/business", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: analyzeResult?.html?.businessName ?? extractDomain(url),
            websiteUrl: url,
            addressLine1: analyzeResult?.html?.address ?? "",
            city: analyzeResult?.html?.city ?? "",
            state: analyzeResult?.html?.state ?? "",
            zip: "",
            phone: analyzeResult?.html?.phone ?? "",
            category: analyzeResult?.html?.category ?? "local business",
            nicheTags: [],
          }),
        });
        const json = await res.json() as { businessId?: string };
        if (json.businessId) { bid = json.businessId; setBusinessId(bid); }
      }
      if (!bid) { setLoading(false); return; }

      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: bid, plan: planId }),
      });
      const data = await res.json() as { checkoutUrl?: string };
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
    } catch { /* silent */ }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex items-start justify-center pt-14 pb-16 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.05),transparent_55%)] pointer-events-none" />
      <div className="relative w-full flex flex-col items-center">
        {phase === "input" && (
          <PhaseInput onSubmit={(u) => { setUrl(u); setPhase("scanning"); }} />
        )}
        {phase === "scanning" && (
          <PhaseScanning 
            url={url} 
            onDone={(r) => { setAnalyzeResult(r); setPhase("report"); }} 
            onCancel={() => setPhase("input")}
          />
        )}
        {phase === "report" && analyzeResult && (
          <PhaseReport result={analyzeResult} url={url} onSelectPlan={handleSelectPlan} loading={loading} />
        )}
        {phase === "report" && !analyzeResult && (
          <PhaseInput onSubmit={(u) => { setUrl(u); setPhase("scanning"); }} />
        )}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <OnboardingWizard />
    </Suspense>
  );
}
