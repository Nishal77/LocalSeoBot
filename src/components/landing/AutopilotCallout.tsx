"use client";

import Link from "next/link";

export function AutopilotCallout() {
  return (
    <section className="relative py-24 bg-transparent text-white overflow-hidden border-t border-zinc-800">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.02),transparent_70%)] pointer-events-none" />

      {/* CAD ticks at top corners */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
      <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>

      <div className="max-w-4xl mx-auto text-center px-6 flex flex-col items-center">
        {/* Large H2 */}
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] mb-6">
          What if all three ran automatically — forever?
        </h2>

        {/* Muted subline */}
        <p className="text-zinc-400 text-sm md:text-base lg:text-lg leading-relaxed max-w-2xl mb-8">
          No agency. No dashboard. No reminders. You connect your Google account once, and your AI agent handles everything from that moment on. Every week. At 2am if needed.
        </p>

        {/* One line CTA */}
        <div className="text-sm md:text-base font-semibold text-zinc-400">
          That&apos;s RankAgent AI.{" "}
          <Link href="/signup" className="text-white hover:text-white/80 underline decoration-zinc-600 hover:decoration-white underline-offset-4 transition-all inline-flex items-center gap-1">
            Start free &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
