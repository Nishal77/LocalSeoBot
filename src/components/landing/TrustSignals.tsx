"use client";

import React from "react";
import { Lock, Zap, Coins } from "lucide-react";

export function TrustSignals() {
  const cards = [
    {
      icon: Lock,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      emoji: "🔒",
      title: "Approve before anything goes live",
      desc: "Turn on approval mode. Every post and review response lands in your email before publishing. Nothing goes live without your OK. 94% of users disable this after week 1 — but knowing you can turns skeptics into buyers."
    },
    {
      icon: Zap,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      emoji: "⚡",
      title: "Responds before your competitor even sees it",
      desc: "Google rewards businesses that respond within hours. Most owners respond in days. Your agent responds in under 2 hours — including 1am on a Sunday. That's a ranking signal your competitor is missing."
    },
    {
      icon: Coins,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      emoji: "💰",
      title: "30-day money-back guarantee",
      desc: "If you don't see your profile active, citations submitted, and reviews responded to in 30 days, full refund. No questions. We're confident enough to back it."
    }
  ];

  return (
    <section className="relative py-24 bg-transparent text-white overflow-hidden border-t border-zinc-800">
      {/* Soft background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.02),transparent_70%)] pointer-events-none" />

      {/* Header */}
      <div className="max-w-3xl mx-auto text-center px-6 mb-16 flex flex-col items-center">
        {/* Capsule Badge */}
        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-medium text-zinc-300 mb-6 tracking-wide backdrop-blur-md select-none">
          Trust Signals
        </div>

        {/* Section Headline */}
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white leading-[1.15]">
          You&apos;re always in control.
        </h2>
      </div>

      {/* Grid wrapper */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="border border-zinc-800 bg-[#09090b]/80 backdrop-blur-sm relative rounded-xl overflow-hidden">
          
          {/* Corner plus ticks */}
          <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
          <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
          <div className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
          <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>

          {/* 3 columns grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
            {cards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div 
                  key={idx} 
                  className="p-8 md:p-10 flex flex-col justify-between group hover:bg-white/[0.01] transition-all duration-300 relative h-full"
                >
                  {/* Plus ticks at divider points on desktop */}
                  {idx > 0 && (
                    <div className="hidden md:block absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-zinc-700 font-mono text-sm select-none pointer-events-none z-20">+</div>
                  )}
                  {idx > 0 && (
                    <div className="hidden md:block absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 text-zinc-700 font-mono text-sm select-none pointer-events-none z-20">+</div>
                  )}
                  
                  <div>
                    {/* Header Row */}
                    <div className="flex items-center space-x-3 mb-6">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${card.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-zinc-500 select-none text-sm font-mono uppercase tracking-wider">
                        Signal 0{idx + 1}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold tracking-tight text-white mb-4 flex items-center gap-2">
                      <span className="select-none">{card.emoji}</span>
                      <span>{card.title}</span>
                    </h3>

                    {/* Description */}
                    <p className="text-zinc-300 text-sm leading-relaxed font-medium">
                      {card.desc}
                    </p>
                  </div>

                  {/* Accent bottom spacer indicator */}
                  <div className="w-12 h-[2px] bg-zinc-850 mt-8 rounded group-hover:w-full transition-all duration-500 ease-out" />
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
