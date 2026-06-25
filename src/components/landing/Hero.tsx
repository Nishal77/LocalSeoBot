import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative pt-12 overflow-hidden bg-transparent text-white">
      {/* Background radial gradient for subtle glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.05),transparent_70%)] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto text-center flex flex-col items-center px-6">

        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-zinc-300 mb-8 backdrop-blur-md">

          {/* Awesome Animated Ping Dot */}
          <span className="relative flex h-2.5 w-2.5">
            {/* Expanding outer ring */}
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            {/* Solid inner dot with a subtle glow */}
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500"></span>
          </span>
          <span>Running for 1,247 local businesses right now</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-medium tracking-tight mb-6 leading-[1.1] max-w-4xl">
          Your Google Listing. Running Itself.
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed mb-10">
          Connect your Google account once. Every week your AI agent writes posts, responds to reviews, and builds your presence on 200+ directories automatically. Just more customers finding you on Google.
        </p>

        {/* CTA Button */}
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/signup">
              <Button size="lg" className="h-12 px-6 bg-white hover:bg-white/80 text-black rounded-xl font-medium transition-all gap-2">
                Get more customers on Google
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" className="h-12 px-6 bg-white hover:bg-white/80 text-black rounded-xl font-medium transition-all gap-2">
                See it in action
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Used By Section */}
      <div className="w-full border-t border-b border-zinc-800 mt-8 mb-16 py-6 bg-transparent">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-zinc-400 text-sm font-medium tracking-wide">
          <span className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">Used By</span>
          <span className="text-zinc-800 select-none hidden sm:inline">|</span>
          <div className="flex items-center gap-1.5 text-white">
            <span>🦷</span>
            <span>Dentists</span>
          </div>
          <span className="text-zinc-800 select-none">&middot;</span>
          <div className="flex items-center gap-1.5 text-white">
            <span>🔧</span>
            <span>Plumbers</span>
          </div>
          <span className="text-zinc-800 select-none">&middot;</span>
          <div className="flex items-center gap-1.5 text-white">
            <span>❄️</span>
            <span>HVAC</span>
          </div>
          <span className="text-zinc-800 select-none">&middot;</span>
          <div className="flex items-center gap-1.5 text-white">
            <span>🍕</span>
            <span>Restaurants</span>
          </div>
          <span className="text-zinc-800 select-none">&middot;</span>
          <div className="flex items-center gap-1.5 text-white">
            <span>💇</span>
            <span>Salons</span>
          </div>
          <span className="text-zinc-800 select-none hidden sm:inline">|</span>
          <span className="text-zinc-400 font-semibold">across the US</span>
        </div>
      </div>

      {/* Works for every local business Section */}
      <div className="relative w-full mt-12">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-left px-6 text-white mb-8">
          Works for every local business
        </h2>

        <div className="w-full border-t border-b border-zinc-800">
          <div className="w-full grid grid-cols-2 md:grid-cols-5 text-center text-sm font-medium text-zinc-300">
            <div className="py-6 px-4 border-b border-zinc-800 flex flex-row items-center justify-center gap-2.5 group cursor-default hover:bg-white/[0.02] transition-colors duration-200">
              <span className="text-xl">🦷</span>
              <span className="font-medium tracking-wide text-zinc-300 group-hover:text-white transition-colors duration-200">Dentists</span>
            </div>
            <div className="py-6 px-4 border-l border-b border-zinc-800 flex flex-row items-center justify-center gap-2.5 group cursor-default hover:bg-white/[0.02] transition-colors duration-200">
              <span className="text-xl">🔧</span>
              <span className="font-medium tracking-wide text-zinc-300 group-hover:text-white transition-colors duration-200">Plumbers</span>
            </div>
            <div className="py-6 px-4 border-b md:border-l border-zinc-800 flex flex-row items-center justify-center gap-2.5 group cursor-default hover:bg-white/[0.02] transition-colors duration-200">
              <span className="text-xl">❄️</span>
              <span className="font-medium tracking-wide text-zinc-300 group-hover:text-white transition-colors duration-200">HVAC</span>
            </div>
            <div className="py-6 px-4 border-l border-b border-zinc-800 flex flex-row items-center justify-center gap-2.5 group cursor-default hover:bg-white/[0.02] transition-colors duration-200">
              <span className="text-xl">🍕</span>
              <span className="font-medium tracking-wide text-zinc-300 group-hover:text-white transition-colors duration-200">Restaurants</span>
            </div>
            <div className="py-6 px-4 border-b md:border-l border-zinc-800 flex flex-row items-center justify-center gap-2.5 group cursor-default hover:bg-white/[0.02] transition-colors duration-200">
              <span className="text-xl">💇</span>
              <span className="font-medium tracking-wide text-zinc-300 group-hover:text-white transition-colors duration-200">Salons</span>
            </div>
            <div className="py-6 px-4 border-l border-b md:border-l-0 md:border-b-0 border-zinc-800 flex flex-row items-center justify-center gap-2.5 group cursor-default hover:bg-white/[0.02] transition-colors duration-200">
              <span className="text-xl">🏋️</span>
              <span className="font-medium tracking-wide text-zinc-300 group-hover:text-white transition-colors duration-200">Gyms</span>
            </div>
            <div className="py-6 px-4 border-b md:border-l md:border-b-0 border-zinc-800 flex flex-row items-center justify-center gap-2.5 group cursor-default hover:bg-white/[0.02] transition-colors duration-200">
              <span className="text-xl">⚖️</span>
              <span className="font-medium tracking-wide text-zinc-300 group-hover:text-white transition-colors duration-200">Law Firms</span>
            </div>
            <div className="py-6 px-4 border-l border-b md:border-b-0 border-zinc-800 flex flex-row items-center justify-center gap-2.5 group cursor-default hover:bg-white/[0.02] transition-colors duration-200">
              <span className="text-xl">🏠</span>
              <span className="font-medium tracking-wide text-zinc-300 group-hover:text-white transition-colors duration-200">Realtors</span>
            </div>
            <div className="py-6 px-4 md:border-l border-zinc-800 flex flex-row items-center justify-center gap-2.5 group cursor-default hover:bg-white/[0.02] transition-colors duration-200">
              <span className="text-xl">🚗</span>
              <span className="font-medium tracking-wide text-zinc-300 group-hover:text-white transition-colors duration-200">Auto Repair</span>
            </div>
            <div className="py-6 px-4 border-l border-zinc-800 flex flex-row items-center justify-center gap-2.5 group cursor-default hover:bg-white/[0.02] transition-colors duration-200">
              <span className="text-xl">🧹</span>
              <span className="font-medium tracking-wide text-zinc-300 group-hover:text-white transition-colors duration-200">Cleaners</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}