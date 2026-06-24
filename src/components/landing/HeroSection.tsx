import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative pt-28 pb-20 px-6 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.12),transparent_65%)] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto">
        {/* Live badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-400 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            AI agent running for 1,200+ businesses right now
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-center text-5xl md:text-7xl font-black tracking-tight mb-6 leading-[1.08]">
          <span className="text-white">Local SEO on</span>
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            complete autopilot.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-center text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10">
          Connect your Google Business Profile once. Your AI agent posts weekly,
          responds to every review, builds citations, and tracks rankings — forever.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href="/signup">
            <Button
              size="lg"
              className="h-12 px-8 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-base font-bold rounded-xl border-0 shadow-[0_0_30px_rgba(124,58,237,0.4)]"
            >
              Start 14-day free trial <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <a href="#how">
            <Button
              size="lg"
              variant="ghost"
              className="h-12 px-8 text-zinc-400 hover:text-white hover:bg-white/5 text-base rounded-xl border border-white/10"
            >
              See how it works
            </Button>
          </a>
        </div>

        {/* Dashboard mockup */}
        <div className="relative">
          <div className="absolute inset-x-10 bottom-0 h-24 bg-gradient-to-r from-violet-600/20 via-blue-600/20 to-cyan-600/20 blur-2xl" />
          <div className="relative rounded-2xl border border-white/10 bg-zinc-900/80 backdrop-blur-sm overflow-hidden shadow-2xl">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/10 bg-white/[0.03]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-xs text-zinc-600 font-mono">rankagent.run/dashboard</span>
              </div>
            </div>

            <div className="flex">
              {/* Sidebar */}
              <div className="hidden md:flex w-52 flex-col border-r border-white/10 bg-black/20 p-4 gap-1">
                {[
                  { label: "Overview", active: true },
                  { label: "GBP Posts" },
                  { label: "Citations" },
                  { label: "Reviews" },
                  { label: "Rankings" },
                  { label: "Reports" },
                ].map(({ label, active }) => (
                  <div
                    key={label}
                    className={`px-3 py-2 rounded-lg text-sm font-medium cursor-default ${
                      active
                        ? "bg-violet-500/15 text-violet-300 border border-violet-500/20"
                        : "text-zinc-500"
                    }`}
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* Main panel */}
              <div className="flex-1 p-6">
                {/* Stat cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {[
                    { label: "Citations live", value: "67 / 200", delta: "+12 this week", color: "text-blue-400" },
                    { label: "Total reviews", value: "142", delta: "4.8 avg", color: "text-yellow-400" },
                    { label: "Avg keyword rank", value: "#4.2", delta: "up from #6.1", color: "text-emerald-400" },
                    { label: "Bot status", value: "Active", delta: "Running 34 days", color: "text-violet-400" },
                  ].map(({ label, value, delta, color }) => (
                    <div key={label} className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
                      <div className="text-xs text-zinc-500 mb-1">{label}</div>
                      <div className={`text-base font-bold ${color}`}>{value}</div>
                      <div className="text-[11px] text-zinc-600 mt-0.5">{delta}</div>
                    </div>
                  ))}
                </div>

                {/* Activity feed */}
                <div className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">Live activity</span>
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                      </span>
                      Live
                    </span>
                  </div>
                  <div className="divide-y divide-white/5">
                    {[
                      { time: "2 min ago", icon: "OK", text: "Review responded — Sarah M. (5 stars)", sub: "So glad you had a great experience..." },
                      { time: "6h ago",    icon: "POST", text: "GBP post published — Spring special offer", sub: "Spring is the perfect time for a checkup..." },
                      { time: "9h ago",    icon: "DIR", text: "Citation submitted — Yelp", sub: "Status: submitted, pending verification" },
                      { time: "Mon 8am",   icon: "RPT", text: "Weekly report sent to your inbox", sub: "3 rankings improved, 2 new reviews" },
                    ].map(({ time, icon, text, sub }) => (
                      <div key={text} className="flex items-start gap-3 px-4 py-3">
                        <span className="text-[10px] font-bold text-zinc-600 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 mt-0.5 flex-shrink-0 w-10 text-center">{icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm text-zinc-200 truncate">{text}</span>
                            <span className="text-[11px] text-zinc-600 flex-shrink-0">{time}</span>
                          </div>
                          <div className="text-xs text-zinc-600 truncate mt-0.5">{sub}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
