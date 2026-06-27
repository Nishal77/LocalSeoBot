"use client";

import React from "react";
import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="relative bg-[#09090b] text-white overflow-hidden">
      {/* Container matching the grid width and side borders of FAQ */}
      <div className="max-w-6xl mx-auto border-x border-t border-zinc-800 bg-[#09090b] relative w-full overflow-hidden py-24 px-8 text-center flex flex-col justify-center items-center">

        {/* Plus ticks at corners */}
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
        <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
        <div className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
        <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>

        {/* Plus ticks at 1/3 and 2/3 coordinates (matching the grid splits) */}
        <div className="hidden md:block absolute bottom-0 left-[33.333%] -translate-x-1/2 translate-y-1/2 text-zinc-700 font-mono text-xs select-none pointer-events-none z-20">+</div>
        <div className="hidden md:block absolute top-0 left-[33.333%] -translate-x-1/2 -translate-y-1/2 text-zinc-700 font-mono text-xs select-none pointer-events-none z-20">+</div>
        <div className="hidden md:block absolute bottom-0 left-[66.666%] -translate-x-1/2 translate-y-1/2 text-zinc-700 font-mono text-xs select-none pointer-events-none z-20">+</div>
        <div className="hidden md:block absolute top-0 left-[66.666%] -translate-x-1/2 -translate-y-1/2 text-zinc-700 font-mono text-xs select-none pointer-events-none z-20">+</div>

        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none z-0 opacity-40"
          style={{ backgroundImage: "url('/images/image2.jpeg')" }}
        />

        {/* Noise Overlay (fractal noise texture) */}
        <div
          className="absolute inset-0 pointer-events-none z-10 opacity-[0.14] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}
        />

        {/* Content Block */}
        <div className="relative z-20 max-w-4xl mx-auto flex flex-col items-center">

          {/* Title */}
          <h2 className="text-3.5xl sm:text-4.5xl md:text-5xl font-medium tracking-tight text-white mb-6 leading-[1.15] max-w-4xl mx-auto select-none">
            Your competitors are ranking higher on Google. Today is a good day to fix that.
          </h2>
          {/* Subline */}
          <p className="text-zinc-400 text-sm md:text-[16px] mb-10 max-w-lg mx-auto leading-relaxed select-none">
            5-minute setup. Your agent starts immediately. First Monday report in your inbox this week.
          </p>

          {/* Pill CTA button (white background) */}
          <Link href="#hero-scanner">
            <button className="h-11 px-8 bg-white hover:bg-zinc-100 text-zinc-950 text-sm font-medium rounded-xl transition-all duration-200 shadow-[0_0_30px_rgba(255,255,255,0.12)]">
              Start for free
            </button>
          </Link>

        </div>

      </div>
    </section>
  );
}
