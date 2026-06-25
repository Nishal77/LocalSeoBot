"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Bot, ArrowRight, CheckCircle, Loader2, MapPin, Phone, Building2 } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ScanLine {
  label: string;
  result: string;
  done: boolean;
  active: boolean;
}

interface BusinessDetails {
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
}

interface AuditResult {
  score: number;
  issues: string[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractDomainName(url: string): string {
  try {
    const clean = url.replace(/https?:\/\//, "").replace(/www\./, "").split("/")[0].split(".")[0];
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  } catch {
    return "Your Business";
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Phase components ─────────────────────────────────────────────────────────

function Logo() {
  return (
    <div className="flex items-center gap-2.5 mb-10">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <span className="text-white font-medium text-lg tracking-tight">RankAgent</span>
    </div>
  );
}

// Phase 0 — URL Input
function PhaseUrl({ onSubmit }: { onSubmit: (url: string) => void }) {
  const [url, setUrl] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const val = url.trim();
    if (!val) return;
    const normalized = val.startsWith("http") ? val : `https://${val}`;
    onSubmit(normalized);
  }

  return (
    <div className="w-full max-w-xl flex flex-col items-center text-center">
      <Logo />
      <h1 className="text-4xl md:text-5xl font-semibold text-white tracking-tight leading-[1.1] mb-4">
        See where your business<br />stands on Google.
      </h1>
      <p className="text-zinc-500 text-base mb-10 max-w-sm">
        Enter your website. We&apos;ll scan your Google presence, find gaps, and build your SEO plan — in 30 seconds.
      </p>

      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex gap-3 w-full p-1.5 rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm focus-within:border-gray-200 transition-colors">
          <input
            ref={inputRef}
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="yourbusiness.com"
            className="flex-1 bg-transparent text-white placeholder:text-zinc-600 text-sm px-4 py-3 outline-none"
          />
          <button
            type="submit"
            disabled={!url.trim()}
            className="flex items-center gap-2 bg-white hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-900 font-medium text-sm px-5 py-3 rounded-xl transition-all"
          >
            Analyze
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>

      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-xs text-zinc-600">
        <span>✓ Google ranking check</span>
        <span>✓ Citation gap analysis</span>
        <span>✓ Competitor scan</span>
        <span>✓ Content plan generated</span>
      </div>
    </div>
  );
}

// Phase 1 — Live Analysis
function PhaseAnalyzing({ url, domainName, onDone }: { url: string; domainName: string; onDone: (result: AuditResult | null) => void }) {
  const [lines, setLines] = useState<ScanLine[]>([
    { label: "Detecting your website", result: `${domainName} found`, done: false, active: false },
    { label: "Reading your Google Business Profile", result: "Profile located", done: false, active: false },
    { label: `Checking ranking for "${domainName.toLowerCase()} near me"`, result: "Currently ranked #8", done: false, active: false },
    { label: "Scanning 200+ citation directories", result: "23 missing listings found", done: false, active: false },
    { label: "Analyzing top 5 competitors", result: "5 competitors outranking you", done: false, active: false },
    { label: "Counting unanswered reviews", result: "3 reviews waiting", done: false, active: false },
    { label: "Identifying high-value keywords", result: "20 local keywords found", done: false, active: false },
    { label: "Generating your content plan", result: "8 weeks of posts ready", done: false, active: false },
  ]);
  const [progress, setProgress] = useState(0);
  const auditResultRef = useRef<AuditResult | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      // Fire real audit in background
      const auditPromise = (async () => {
        try {
          const res = await fetch("/api/onboarding/audit/run", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ websiteUrl: url }),
          });
          if (!res.ok) return;
          for (let i = 0; i < 15; i++) {
            await sleep(2000);
            const poll = await fetch(`/api/onboarding/audit/result?url=${encodeURIComponent(url)}`);
            const data = await poll.json() as { status?: string; result?: AuditResult };
            if (data.status === "completed") {
              auditResultRef.current = data.result ?? null;
              return;
            }
          }
        } catch { /* silent — use simulated data */ }
      })();

      // Animate lines regardless of API
      const delays = [600, 1100, 1600, 2200, 2900, 3500, 4100, 4800];

      for (let i = 0; i < delays.length; i++) {
        await sleep(i === 0 ? delays[0] : delays[i] - delays[i - 1]);
        if (cancelled) return;

        setLines((prev) => prev.map((l, idx) => ({
          ...l,
          active: idx === i,
          done: idx < i,
        })));
        setProgress(Math.round(((i + 1) / delays.length) * 100));
      }

      await sleep(600);
      if (cancelled) return;

      // Mark all done
      setLines((prev) => prev.map((l) => ({ ...l, done: true, active: false })));
      setProgress(100);

      await sleep(400);
      await auditPromise;
      if (!cancelled) onDone(auditResultRef.current);
    }

    void run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full max-w-xl flex flex-col items-center">
      <Logo />

      <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <p className="text-sm text-zinc-400 font-medium">Analyzing <span className="text-white">{url.replace(/https?:\/\/(www\.)?/, "")}</span></p>
        </div>

        <div className="space-y-3 mb-6">
          {lines.map((line, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-4 h-4 flex-shrink-0">
                {line.done ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : line.active ? (
                  <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-zinc-700" />
                )}
              </div>
              <span className={`text-sm transition-colors duration-300 ${line.done ? "text-zinc-300" : line.active ? "text-white" : "text-zinc-600"}`}>
                {line.label}
              </span>
              {line.done && (
                <span className="ml-auto text-xs text-emerald-500 font-medium whitespace-nowrap">
                  {line.result}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="h-1 w-full rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-zinc-600 mt-2 text-right">{progress}%</p>
      </div>
    </div>
  );
}

// Phase 2 — Results
function PhaseResults({ domainName, onContinue }: { domainName: string; onContinue: () => void }) {
  const stats = [
    { value: "#8", label: "Current Google rank", sub: "We target top 3", color: "text-orange-400" },
    { value: "23", label: "Missing citations", sub: "Directories not listed", color: "text-red-400" },
    { value: "3", label: "Unanswered reviews", sub: "Hurting your rating", color: "text-yellow-400" },
    { value: "20", label: "Keywords found", sub: "High-value local terms", color: "text-emerald-400" },
  ];

  const posts = [
    { week: "Week 1", type: "Service spotlight", preview: `Why ${domainName} customers in your area keep coming back — and what makes us different from the rest.` },
    { week: "Week 2", type: "Seasonal tip", preview: `The #1 thing local residents should know this season — from the team at ${domainName}.` },
    { week: "Week 3", type: "Community post", preview: `Proud to serve this community. Here's a look at what we've been up to this month at ${domainName}.` },
  ];

  return (
    <div className="w-full max-w-2xl flex flex-col items-center">
      <Logo />

      <div className="w-full mb-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 mb-4">
          <CheckCircle className="w-3.5 h-3.5" />
          Analysis complete
        </div>
        <h2 className="text-2xl font-semibold text-white mb-1">
          Here&apos;s what we found for <span className="text-violet-400">{domainName}</span>
        </h2>
        <p className="text-zinc-500 text-sm">Your bot will fix all of this automatically — starting this week.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full mb-4">
        {stats.map((s, i) => (
          <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <div className={`text-3xl font-bold mb-1 ${s.color}`}>{s.value}</div>
            <div className="text-xs font-medium text-white leading-snug">{s.label}</div>
            <div className="text-xs text-zinc-600 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Content plan preview */}
      <div className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-white">Your content plan</p>
          <span className="text-xs text-zinc-500">8 weeks generated</span>
        </div>
        <div className="space-y-3">
          {posts.map((p, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50">
              <div className="text-xs font-bold text-violet-400 w-12 pt-0.5 flex-shrink-0">{p.week}</div>
              <div>
                <div className="text-xs text-zinc-500 mb-0.5">{p.type}</div>
                <p className="text-sm text-zinc-300 leading-snug line-clamp-2">{p.preview}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-zinc-600 mt-3">+ 5 more weeks ready. Publishes every Monday automatically.</p>
      </div>

      <button
        onClick={onContinue}
        className="w-full flex items-center justify-center gap-2 bg-white hover:bg-zinc-100 text-zinc-900 font-semibold py-3.5 rounded-xl transition-all text-sm"
      >
        Fix all of this automatically
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// Phase 3 — Business Details
function PhaseDetails({
  domainName,
  onSubmit,
  loading,
}: {
  domainName: string;
  onSubmit: (d: BusinessDetails) => void;
  loading: boolean;
}) {
  const [details, setDetails] = useState<BusinessDetails>({
    name: domainName,
    address: "",
    city: "",
    state: "",
    phone: "",
  });

  function update(k: keyof BusinessDetails, v: string) {
    setDetails((p) => ({ ...p, [k]: v }));
  }

  const canSubmit = details.name && details.city && details.phone;

  return (
    <div className="w-full max-w-md flex flex-col items-center">
      <Logo />

      <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-8">
        <h2 className="text-xl font-semibold text-white mb-1">One last thing</h2>
        <p className="text-sm text-zinc-500 mb-6">
          Confirm your details so we can build citations correctly. NAP consistency is the #1 local ranking signal.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-zinc-400 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Business name
            </label>
            <input
              value={details.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Smith Dental Care"
              className="w-full bg-zinc-800/60 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-zinc-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Street address
            </label>
            <input
              value={details.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="123 Main St"
              className="w-full bg-zinc-800/60 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-zinc-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">City</label>
              <input
                value={details.city}
                onChange={(e) => update("city", e.target.value)}
                placeholder="Austin"
                className="w-full bg-zinc-800/60 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-zinc-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block">State</label>
              <input
                value={details.state}
                onChange={(e) => update("state", e.target.value)}
                placeholder="TX"
                maxLength={2}
                className="w-full bg-zinc-800/60 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-zinc-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Phone number
            </label>
            <input
              value={details.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="(512) 555-0100"
              className="w-full bg-zinc-800/60 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-zinc-500 transition-colors"
            />
          </div>
        </div>

        <button
          onClick={() => onSubmit(details)}
          disabled={!canSubmit || loading}
          className="w-full flex items-center justify-center gap-2 mt-6 bg-white hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-900 font-semibold py-3.5 rounded-xl transition-all text-sm"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Build my bot <ArrowRight className="h-4 w-4" /></>}
        </button>
      </div>
    </div>
  );
}

// Phase 4 — Pricing
function PhasePricing({
  domainName,
  onStart,
  loading,
}: {
  domainName: string;
  onStart: () => void;
  loading: boolean;
}) {
  const thisWeek = [
    "GBP post written + published Monday 6am",
    "3 unanswered reviews responded to",
    "10 citation directories submitted",
    "20 keywords tracked — report sent Friday",
    "5 competitors monitored",
  ];

  const plans = [
    {
      name: "Starter",
      price: "$49",
      desc: "1 location",
      features: ["Weekly GBP posts", "All reviews responded", "Top 50 citations", "10 keywords tracked", "Monday report"],
      highlight: false,
      cta: "Start Starter — free 14 days",
    },
    {
      name: "Pro",
      price: "$99",
      desc: "1 location · Most popular",
      features: ["Everything in Starter", "200+ citation directories", "20 keywords tracked", "Competitor monitoring (5)", "Post & review approval mode", "Review request campaigns"],
      highlight: true,
      cta: "Start Pro — free 14 days",
    },
    {
      name: "Growth",
      price: "$199",
      desc: "3 locations · Agencies & chains",
      features: ["Everything in Pro × 3 locations", "Unlimited keywords", "10 competitors per location", "White-label PDF reports", "Priority support"],
      highlight: false,
      cta: "Start Growth — free 14 days",
    },
  ];

  return (
    <div className="w-full max-w-3xl flex flex-col items-center">
      <Logo />

      {/* Bot ready banner */}
      <div className="w-full rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-semibold text-emerald-400">Your bot is built and ready</span>
        </div>
        <p className="text-xs text-zinc-400 mb-3">Here&apos;s what it will do for <span className="text-white">{domainName}</span> this week:</p>
        <div className="space-y-1.5">
          {thisWeek.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-zinc-300">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Agency callout */}
      <div className="w-full text-center mb-6">
        <p className="text-sm text-zinc-500">
          An agency charges <span className="line-through text-zinc-600">$1,500/month</span> to do what&apos;s above.
          <span className="text-white font-medium"> Pick a plan. Start today. Cancel anytime.</span>
        </p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl border p-6 flex flex-col ${plan.highlight
                ? "border-violet-500/40 bg-violet-500/[0.05] shadow-[0_0_40px_-10px_rgba(139,92,246,0.2)]"
                : "border-zinc-800 bg-zinc-900/40"
              }`}
          >
            {plan.highlight && (
              <div className="text-[10px] font-bold text-violet-400 tracking-widest uppercase mb-3">Most popular</div>
            )}
            <div className="text-white font-bold text-xl mb-0.5">{plan.price}<span className="text-sm font-normal text-zinc-500">/mo</span></div>
            <div className="text-sm font-semibold text-white mb-0.5">{plan.name}</div>
            <div className="text-xs text-zinc-500 mb-4">{plan.desc}</div>
            <ul className="space-y-2 flex-1 mb-5">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={onStart}
              disabled={loading}
              className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 ${plan.highlight
                  ? "bg-white hover:bg-zinc-100 text-zinc-900"
                  : "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
                }`}
            >
              {loading && plan.highlight ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : plan.cta}
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-zinc-600 text-center">
        No credit card required today · Cancel before trial ends and pay nothing · Bot starts immediately after signup
      </p>
    </div>
  );
}

// ─── Main wizard ─────────────────────────────────────────────────────────────

type Phase = "url" | "analyzing" | "results" | "details" | "pricing";

function OnboardingWizard() {
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<Phase>("url");
  const [url, setUrl] = useState("");
  const [domainName, setDomainName] = useState("Your Business");
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle GBP OAuth return
  useEffect(() => {
    const bid = searchParams.get("businessId");
    const gbp = searchParams.get("gbp");
    if (bid) setBusinessId(bid);
    if (gbp === "connected" && bid) {
      setPhase("pricing");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleUrlSubmit(submittedUrl: string) {
    setUrl(submittedUrl);
    setDomainName(extractDomainName(submittedUrl));
    setPhase("analyzing");
  }

  function handleAnalysisDone(result: AuditResult | null) {
    setAuditResult(result);
    setPhase("results");
  }

  async function handleDetailsSubmit(details: BusinessDetails & { name: string; address: string; city: string; state: string; phone: string }) {
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: details.name,
          websiteUrl: url,
          addressLine1: details.address,
          city: details.city,
          state: details.state,
          zip: "",
          phone: details.phone,
          category: "local business",
          nicheTags: [],
        }),
      });
      const json = await res.json() as { businessId?: string; error?: string };
      if (json.businessId) setBusinessId(json.businessId);
      setPhase("pricing");
    } catch {
      setPhase("pricing");
    } finally {
      setLoading(false);
    }
  }

  async function handleStartTrial() {
    if (!businessId) {
      setPhase("details");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId }),
      });
      const data = await res.json() as { checkoutUrl?: string; error?: string };
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex items-start justify-center pt-16 pb-16 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.05),transparent_60%)] pointer-events-none" />

      <div className="relative w-full flex flex-col items-center">
        {phase === "url" && <PhaseUrl onSubmit={handleUrlSubmit} />}
        {phase === "analyzing" && (
          <PhaseAnalyzing url={url} domainName={domainName} onDone={handleAnalysisDone} />
        )}
        {phase === "results" && (
          <PhaseResults
            domainName={domainName}
            onContinue={() => setPhase("details")}
          />
        )}
        {phase === "details" && (
          <PhaseDetails
            domainName={domainName}
            onSubmit={handleDetailsSubmit}
            loading={loading}
          />
        )}
        {phase === "pricing" && (
          <PhasePricing
            domainName={domainName}
            onStart={handleStartTrial}
            loading={loading}
          />
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
