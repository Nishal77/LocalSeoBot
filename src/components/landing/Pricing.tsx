"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Layers,
  MessageSquare,
  Target,
  Mail,
  Eye,
  Settings,
  UserCheck,
  Code,
  Zap,
  Check
} from "lucide-react";

export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "Starter",
      priceMonthly: "$49",
      priceAnnual: "$49",
      desc: "For businesses just getting started with local SEO.",
      cta: "Start with Starter",
      features: [
        { icon: TrendingUp, text: "1 GBP post/week (AI)" },
        { icon: MessageSquare, text: "All reviews responded to (AI)" },
        { icon: Layers, text: "Top 50 citation directories" },
        { icon: Target, text: "10 keywords tracked weekly" },
        { icon: Mail, text: "Monday email report" },
        { icon: Zap, text: "7-day free trial" },
      ],
    },
    {
      name: "Pro",
      priceMonthly: "$99",
      priceAnnual: "$79",
      desc: "For businesses serious about ranking #1 locally.",
      cta: "Start with Pro",
      features: [
        { icon: Check, text: "Everything in Starter" },
        { icon: Layers, text: "200+ citation directories (ongoing)" },
        { icon: Target, text: "20 keywords tracked weekly" },
        { icon: Eye, text: "Competitor monitoring (5 competitors)" },
        { icon: Settings, text: "Post + review approval mode" },
        { icon: MessageSquare, text: "Review request campaigns via SMS" },
        { icon: Zap, text: "14-day free trial" },
      ],
    },
    {
      name: "Growth",
      priceMonthly: "$199",
      priceAnnual: "$159",
      desc: "For multi-location brands & marketing agencies.",
      cta: "Start with Growth",
      features: [
        { icon: Check, text: "Everything in Pro × 3 locations" },
        { icon: Layers, text: "Unlimited keywords per location" },
        { icon: Settings, text: "10 competitors monitored per location" },
        { icon: UserCheck, text: "PDF reports (white-label ready)" },
        { icon: Mail, text: "Priority email support" },
        { icon: MessageSquare, text: "Review campaigns (SMS & Email)" },
        { icon: Code, text: "Custom avoid-topics per location" },
        { icon: Zap, text: "14-day free trial" },
      ],
    },
  ];

  return (
    <section id="pricing" className="relative py-24 bg-[#09090b] text-white overflow-hidden border-t border-zinc-800">
      {/* Blueprint grid background */}
      <div className="absolute inset-0 h-[450px] bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-40 z-0" />

      {/* Header */}
      <div className="max-w-3xl mx-auto text-center px-6 mb-16 flex flex-col items-center">
        {/* Capsule Badge */}
        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-medium text-zinc-300 mb-6 tracking-wide backdrop-blur-md select-none">
          Pricing
        </div>

        {/* Section Headline */}
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white leading-[1.15]">
          One plan. Everything included.
        </h2>
      </div>

      {/* Pricing Container Grid */}
      <div className="max-w-6xl mx-auto px-6 relative mb-16 z-10">
        <div className="relative border border-zinc-800 bg-black/40 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-800 overflow-hidden">

          {/* CAD Grid Intersection Ticks */}
          {/* Outer corners */}
          <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-zinc-600/80 font-mono text-sm select-none pointer-events-none z-20">+</div>
          <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 text-zinc-600/80 font-mono text-sm select-none pointer-events-none z-20">+</div>
          <div className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 text-zinc-600/80 font-mono text-sm select-none pointer-events-none z-20">+</div>
          <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 text-zinc-600/80 font-mono text-sm select-none pointer-events-none z-20">+</div>

          {/* Internal column ticks */}
          <div className="hidden md:block absolute top-0 left-[33.333%] -translate-x-1/2 -translate-y-1/2 text-zinc-600/80 font-mono text-sm select-none pointer-events-none z-20">+</div>
          <div className="hidden md:block absolute bottom-0 left-[33.333%] -translate-x-1/2 translate-y-1/2 text-zinc-600/80 font-mono text-sm select-none pointer-events-none z-20">+</div>
          <div className="hidden md:block absolute top-0 left-[66.666%] -translate-x-1/2 -translate-y-1/2 text-zinc-600/80 font-mono text-sm select-none pointer-events-none z-20">+</div>
          <div className="hidden md:block absolute bottom-0 left-[66.666%] -translate-x-1/2 translate-y-1/2 text-zinc-600/80 font-mono text-sm select-none pointer-events-none z-20">+</div>

          {plans.map((plan) => (
            <div
              key={plan.name}
              className="relative flex flex-col justify-between p-8 md:p-10 min-h-[520px] overflow-hidden"
            >
              {plan.name === "Pro" && (
                <>
                  {/* Background Image with low opacity */}
                  <div
                    className="absolute inset-0 bg-cover bg-center pointer-events-none z-0 opacity-[0.25]"
                    style={{ backgroundImage: "url('/images/image3.jpeg')" }}
                  />
                  {/* Noise Overlay (fractal noise texture) */}
                  <div
                    className="absolute inset-0 pointer-events-none z-0 opacity-[0.14] mix-blend-overlay"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                    }}
                  />
                </>
              )}

              <div className="relative z-10">
                {/* Plan Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold text-white leading-none">{plan.name}</h3>
                    {plan.name === "Pro" && (
                      <span className="bg-white text-zinc-950 text-[9px] font-medium px-1.5 py-0.5 rounded tracking-tight select-none">
                        POPULAR
                      </span>
                    )}
                  </div>
                  {plan.name !== "Starter" && (
                    <div className="flex items-center gap-1.5 select-none">
                      <button
                        onClick={() => setIsAnnual(!isAnnual)}
                        className={`w-7 h-4.5 rounded-full p-0.5 transition-colors duration-200 border border-zinc-700/60 ${isAnnual ? "bg-white" : "bg-zinc-800"
                          }`}
                      >
                        <div
                          className={`w-3 h-3 rounded-full transition-all duration-200 ${isAnnual ? "translate-x-3 bg-zinc-950" : "translate-x-0 bg-zinc-500"
                            }`}
                        />
                      </button>
                      <span className="text-[10px] font-medium tracking-wider text-white/40">ANNUAL</span>
                    </div>
                  )}
                </div>

                <p className="text-white/60 text-xs mt-2 font-medium">{plan.desc}</p>

                {/* Price block */}
                <div className="flex items-baseline gap-1.5 mt-8 mb-10">
                  <span className="text-5xl font-semibold tracking-tight text-white leading-none">
                    {isAnnual ? plan.priceAnnual : plan.priceMonthly}
                  </span>
                  <span className="text-white/70 text-xs font-normal">
                    per month
                  </span>
                </div>

                {/* Features list */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feat, fIdx) => {
                    const IconComponent = feat.icon;
                    return (
                      <div key={fIdx} className="flex items-start gap-3">
                        <IconComponent className="w-4 h-4 text-white/60 mt-0.5 flex-shrink-0" />
                        <span className="text-white/60 font-medium text-[13px] leading-relaxed tracking-tight">
                          {feat.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Button */}
              <div className="relative mt-auto z-10 pt-4">
                <Link
                  href="/signup"
                  className={`block w-full text-center py-3.5 rounded-xl text-sm font-semibold tracking-tight transition-all duration-300 ${plan.name === "Pro"
                      ? "bg-white text-zinc-950 hover:bg-zinc-100 shadow-[0_0_30px_rgba(255,255,255,0.12)]"
                      : "bg-[#18181b] border border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                    }`}
                >
                  {plan.cta}
                </Link>
              </div>

            </div>
          ))}

        </div>
      </div>

      {/* Pricing Callout Footer */}
      <div className="relative max-w-4xl mx-auto px-6 text-center select-none z-10">
        <div className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 rounded-full border border-zinc-800 bg-[#09090b]/80 px-6 py-3 text-xs md:text-sm font-medium text-zinc-400 shadow-sm backdrop-blur-md">
          <span>💳</span>
          <span>14-day free trial</span>
          <span className="text-zinc-700">&middot;</span>
          <span>No credit card required to start</span>
          <span className="text-zinc-700">&middot;</span>
          <span>Cancel anytime</span>
          <span className="text-zinc-700">&middot;</span>
          <span>No contracts</span>
        </div>
      </div>
    </section>
  );
}
