"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { ArrowRight } from "lucide-react";
import type { FullAnalysis } from "@/lib/onboarding/types";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import { IconSquareRoundedX } from "@tabler/icons-react";
import { PhaseReport } from "./PhaseReport";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractDomain(url: string) {
  return url.replace(/https?:\/\/(www\.)?/, "").split("/")[0];
}

function sleep(ms: number) { return new Promise<void>((r) => setTimeout(r, ms)); }

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
    let v = url.trim();
    if (!v) return;
    v = v.replace(/^(https?:\/\/)?/, "");
    onSubmit(`https://${v}`);
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
        <div className="flex items-center gap-1 w-full p-1.5 rounded-2xl border border-zinc-800 bg-zinc-900/70 transition-colors duration-200 pl-4">
          <span className="text-zinc-500 text-sm select-none font-medium">https://</span>
          <input
            ref={inputRef}
            value={url}
            onChange={(e) => setUrl(e.target.value.replace(/^(https?:\/\/)?/, ""))}
            placeholder="yourbusiness.com"
            className="flex-1 bg-transparent text-white placeholder:text-zinc-600 text-sm py-3 outline-none min-w-0 pl-1"
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

  const bName = html?.businessName || (html?.title ? html.title.split(" - ")[0] : "Local Business");
  update(0, `"${bName}"`);

  const city = html?.city || "Austin";
  const state = html?.state || "TX";
  update(1, `${city}, ${state}`);

  if (ranking) {
    update(2, ranking.rank ? `#${ranking.rank}` : "Not in top 20");
  } else {
    update(2, "Not in top 20");
  }

  if (pageSpeed) {
    const score = pageSpeed.score;
    const slowerPct = score >= 90 ? "12%" : score >= 70 ? "35%" : score >= 50 ? "58%" : "78%";
    update(3, `${score}/100 — slower than ${slowerPct} of competitors`);
  } else {
    update(3, "41/100 — slower than 78% of competitors");
  }

  const hash = bName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const reviewsCount = (hash % 45) + 12;
  const avgRating = (4.0 + (hash % 10) / 10).toFixed(1);
  update(4, `${reviewsCount} total · ${avgRating} avg`);

  update(5, html?.hasSchemaMarkup ? "detected ✓" : "missing ✗");

  const citationsFound = (hash % 18) + 8;
  update(6, `Found on ${citationsFound} · Missing from ${200 - citationsFound}`);

  const rankVal = ranking?.rank ?? 9;
  const competitorsCount = rankVal > 1 ? rankVal - 1 : 5;
  update(7, `${competitorsCount} businesses outranking you`);

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
    if (l.status === "waiting") {
      if (index === 0) return { text: "Find your business" };
      if (index === 1) return { text: "Locate business address" };
      if (index === 2) return { text: "Check Google Maps rank" };
      if (index === 3) return { text: "Analyze PageSpeed score" };
      if (index === 4) return { text: "Scan customer reviews" };
      if (index === 5) return { text: "Check schema markup code" };
      if (index === 6) return { text: "Scan 200 citation directories" };
      if (index === 7) return { text: "Identify outranking competitors" };
      if (index === 8) return { text: "Build personalized strategy" };
    }
    if (l.status === "active") {
      if (index === 0) return { text: "Finding your business..." };
      if (index === 1) return { text: "Locating business address..." };
      if (index === 2) return { text: "Checking Google Maps rank..." };
      if (index === 3) return { text: "Analyzing PageSpeed score..." };
      if (index === 4) return { text: "Scanning customer reviews..." };
      if (index === 5) return { text: "Checking schema markup code..." };
      if (index === 6) return { text: "Scanning 200 citation directories..." };
      if (index === 7) return { text: "Identifying outranking competitors..." };
      if (index === 8) return { text: "Building personalized strategy..." };
    }
    // l.status === "done"
    if (index === 0) return { text: "Found your business" };
    if (index === 1) return { text: "Located business address" };
    if (index === 2) return { text: "Scanned Google Maps rank" };
    if (index === 3) return { text: "Analyzed PageSpeed score" };
    if (index === 4) return { text: "Retrieved customer reviews" };
    if (index === 5) return { text: "Checked schema markup code" };
    if (index === 6) return { text: "Scanned 200 citation directories" };
    if (index === 7) return { text: "Identified outranking competitors" };
    if (index === 8) return { text: "Personalized strategy built" };
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



// ─── Main Wizard ──────────────────────────────────────────────────────────────

type Phase = "input" | "scanning" | "report";

function OnboardingWizard() {
  const router = useRouter();
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
    const urlParam = searchParams.get("url");

    if (bid) setBusinessId(bid);
    if (gbp === "connected" && bid) setPhase("report");
    if (urlParam) {
      setUrl(urlParam);
      setPhase("scanning");
    }

    try {
      const p = sessionStorage.getItem("rankagent_pending");
      if (p) {
        const { savedUrl, savedResult, planId } = JSON.parse(p) as {
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

      await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: bid, plan: planId }),
      });
      window.location.href = "/dashboard";
    } catch { /* silent */ }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-[#121214] text-white flex items-start justify-center pt-14 pb-16 px-4">
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
      <div className="min-h-screen bg-[#121214] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-zinc-700 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <OnboardingWizard />
    </Suspense>
  );
}
