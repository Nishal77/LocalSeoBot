"use client";

import React from "react";
import { Calendar, Compass, Sparkles } from "lucide-react";

export function WhatToExpect() {
  const milestones = [
    {
      time: "Week 1",
      icon: Calendar,
      iconColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      content: [
        "First GBP post published to your Google listing. Every existing review gets a response drafted (pending your approval or auto-posted). First 20 citation directories submitted.",
        "You get your first Monday email — showing exactly what ran."
      ]
    },
    {
      time: "Day 30",
      icon: Compass,
      iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      content: [
        "80–100 citations live. Local keyword rankings start moving. Your review response rate: 100%, average time under 2 hours. Google starts seeing your profile as \"active and engaged.\""
      ]
    },
    {
      time: "Day 90",
      icon: Sparkles,
      iconColor: "text-violet-400 bg-violet-500/10 border-violet-500/20",
      content: [
        "150+ citations verified. Average ranking improvement: 3–6 positions for target keywords. Your Google profile has more fresh content than any competitor in your area. Most users are in their top 3 by now."
      ]
    }
  ];

  const stats = [
    { value: "1,247", label: "businesses on autopilot" },
    { value: "4.8M+", label: "citations live" },
    { value: "97%", label: "see ranking movement by day 60" },
    { value: "$1,400/mo", label: "average agency cost replaced" }
  ];

  return (
    <section className="relative py-24 bg-transparent text-white overflow-hidden border-t border-zinc-800">
      {/* Background soft glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.02),transparent_70%)] pointer-events-none" />

      {/* Header */}
      <div className="max-w-3xl mx-auto text-center px-6 mb-16 flex flex-col items-center">
        {/* Capsule Badge */}
        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-medium text-zinc-300 mb-6 tracking-wide backdrop-blur-md select-none">
          What to expect
        </div>

        {/* Section Headline */}
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white leading-[1.15]">
          What happens after you connect.
        </h2>
      </div>

      {/* Contiguous Grid Container */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="border border-zinc-800 bg-[#09090b]/80 backdrop-blur-sm relative rounded-xl overflow-hidden">
          
          {/* Corner plus ticks */}
          <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
          <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
          <div className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
          <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>

          {/* 3 Columns Grid for Milestones */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
            {milestones.map((m, idx) => {
              const Icon = m.icon;
              return (
                <div key={idx} className="p-8 md:p-10 flex flex-col justify-between group hover:bg-white/[0.01] transition-colors duration-300 relative h-full">
                  {/* Plus ticks at divider points on desktop */}
                  {idx > 0 && (
                    <div className="hidden md:block absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-zinc-700 font-mono text-sm select-none pointer-events-none z-20">+</div>
                  )}
                  {idx > 0 && (
                    <div className="hidden md:block absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 text-zinc-700 font-mono text-sm select-none pointer-events-none z-20">+</div>
                  )}
                  
                  <div>
                    {/* Time & Icon header row */}
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-2xl font-bold tracking-tight text-white">
                        {m.time}
                      </span>
                      <div className={`p-2 rounded-lg border ${m.iconColor}`}>
                        <Icon className="w-5 h-5 animate-pulse" />
                      </div>
                    </div>

                    {/* Milestone Details */}
                    <div className="space-y-4">
                      {m.content.map((paragraph, pIdx) => (
                        <p 
                          key={pIdx} 
                          className={`text-sm leading-relaxed ${
                            pIdx === 0 ? "text-zinc-300 font-medium" : "text-zinc-400 font-normal"
                          }`}
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Connecting track accent */}
                  <div className="w-full h-[2px] bg-zinc-850 mt-8 relative overflow-hidden rounded">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-650 to-transparent group-hover:animate-shimmer" style={{ backgroundSize: "200% 100%" }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats Bar Row */}
          <div className="border-t border-zinc-800">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800 bg-[#09090b]">
              {stats.map((stat, idx) => (
                <div key={idx} className="p-6 flex flex-col justify-center items-center text-center hover:bg-white/[0.01] transition-colors duration-300 relative">
                  {/* Plus ticks at divider points on desktop */}
                  {idx > 0 && (
                    <div className="hidden lg:block absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-zinc-700 font-mono text-sm select-none pointer-events-none z-20">+</div>
                  )}
                  {idx > 0 && (
                    <div className="hidden lg:block absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 text-zinc-700 font-mono text-sm select-none pointer-events-none z-20">+</div>
                  )}
                  <span className="text-2xl font-bold tracking-tight text-white mb-1 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                    {stat.value}
                  </span>
                  <span className="text-xs text-zinc-400 tracking-wide font-medium">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
