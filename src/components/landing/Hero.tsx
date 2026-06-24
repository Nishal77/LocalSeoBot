import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-12 pb-16 overflow-hidden bg-transparent text-white">
      {/* Background radial gradient for subtle glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.05),transparent_70%)] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto text-center flex flex-col items-center px-6">

        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-zinc-300 mb-8 backdrop-blur-md">
          {/* <Heart className="h-4 w-4 text-red-500 fill-red-500" /> */}
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          <span>Trusted by 2,400+ local businesses</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-medium tracking-tight mb-6 leading-[1.1] max-w-4xl">
         Your Google Listing. Running Itself.
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed mb-10">
          RankAgentAI handles your Google reviews, weekly posts, and 200+ business directories automatically. No agency. No effort. Just more customers finding you on Google.
        </p>

        {/* CTA Button */}
        <div className="mb-12">
          <Link href="/signup">
            <Button size="lg" className="h-12 px-6 bg-white hover:bg-white/80 text-black rounded-xl font-medium transition-all gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
             Start Free for 14 Days
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="w-full border-t border-b border-zinc-800 mt-8 mb-16">
        <div className="w-full grid grid-cols-2 md:grid-cols-4 text-center">
          <div className="py-8 px-4 border-b border-zinc-800 md:border-b-0">
            <div className="text-3xl md:text-4xl font-medium tracking-tight text-white mb-2">2,400+</div>
            <div className="text-zinc-400 text-sm leading-relaxed whitespace-nowrap mx-auto">Businesses running on autopilot</div>
          </div>
          <div className="py-8 px-4 border-l border-b border-zinc-800 md:border-b-0">
            <div className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-2">4.8 Million</div>
            <div className="text-zinc-400 text-sm leading-relaxed whitespace-nowrap mx-auto">Citations built across the web</div>
          </div>
          <div className="py-8 px-4 md:border-l border-zinc-800">
            <div className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-2">94%</div>
            <div className="text-zinc-400 text-sm leading-relaxed whitespace-nowrap mx-auto">Rank in Google&apos;s top 3 within 90 days</div>
          </div>
          <div className="py-8 px-4 border-l border-zinc-800">
            <div className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-2 flex items-center justify-center gap-1.5">
              <span className="text-yellow-500">★</span>4.9/5
            </div>
            <div className="text-zinc-400 text-sm leading-relaxed whitespace-nowrap mx-auto">Average rating improvement in 60 days</div>
          </div>
        </div>
      </div>

      {/* Works for every local business Section */}
      <div className="relative w-full mt-12 mb-16">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-left px-6 text-white mb-8">
          Works for every local business
        </h2>

        <div className="w-full border-t border-b border-zinc-800">
          {/* Row 1: 5 Options */}
          <div className="w-full grid grid-cols-2 md:grid-cols-5 text-center text-sm font-medium text-zinc-300 border-b border-zinc-800">
            <div className="py-6 px-4 border-b md:border-b-0 border-zinc-800 flex flex-row items-center justify-center gap-2.5 group cursor-default hover:bg-white/[0.02] transition-colors duration-200">
              <span className="text-xl">🦷</span>
              <span className="font-medium tracking-wide text-zinc-300 group-hover:text-white transition-colors duration-200">Dentists</span>
            </div>
            <div className="py-6 px-4 border-l border-b md:border-b-0 border-zinc-800 flex flex-row items-center justify-center gap-2.5 group cursor-default hover:bg-white/[0.02] transition-colors duration-200">
              <span className="text-xl">🔧</span>
              <span className="font-medium tracking-wide text-zinc-300 group-hover:text-white transition-colors duration-200">Plumbers</span>
            </div>
            <div className="py-6 px-4 border-b md:border-l md:border-b-0 border-zinc-800 flex flex-row items-center justify-center gap-2.5 group cursor-default hover:bg-white/[0.02] transition-colors duration-200">
              <span className="text-xl">❄️</span>
              <span className="font-medium tracking-wide text-zinc-300 group-hover:text-white transition-colors duration-200">HVAC</span>
            </div>
            <div className="py-6 px-4 border-l border-b md:border-b-0 border-zinc-800 flex flex-row items-center justify-center gap-2.5 group cursor-default hover:bg-white/[0.02] transition-colors duration-200">
              <span className="text-xl">🍕</span>
              <span className="font-medium tracking-wide text-zinc-300 group-hover:text-white transition-colors duration-200">Restaurants</span>
            </div>
            <div className="py-6 px-4 md:border-l border-zinc-800 flex flex-row items-center justify-center gap-2.5 group cursor-default hover:bg-white/[0.02] transition-colors duration-200">
              <span className="text-xl">💇</span>
              <span className="font-medium tracking-wide text-zinc-300 group-hover:text-white transition-colors duration-200">Salons</span>
            </div>
          </div>

          {/* Row 2: 4 Options */}
          <div className="w-full grid grid-cols-2 md:grid-cols-4 text-center text-sm font-medium text-zinc-300">
            <div className="py-6 px-4 border-b md:border-b-0 border-zinc-800 flex flex-row items-center justify-center gap-2.5 group cursor-default hover:bg-white/[0.02] transition-colors duration-200">
              <span className="text-xl">🏋️</span>
              <span className="font-medium tracking-wide text-zinc-300 group-hover:text-white transition-colors duration-200">Gyms</span>
            </div>
            <div className="py-6 px-4 border-l border-b md:border-b-0 border-zinc-800 flex flex-row items-center justify-center gap-2.5 group cursor-default hover:bg-white/[0.02] transition-colors duration-200">
              <span className="text-xl">⚖️</span>
              <span className="font-medium tracking-wide text-zinc-300 group-hover:text-white transition-colors duration-200">Law Firms</span>
            </div>
            <div className="py-6 px-4 md:border-l border-zinc-800 flex flex-row items-center justify-center gap-2.5 group cursor-default hover:bg-white/[0.02] transition-colors duration-200">
              <span className="text-xl">🏠</span>
              <span className="font-medium tracking-wide text-zinc-300 group-hover:text-white transition-colors duration-200">Realtors</span>
            </div>
            <div className="py-6 px-4 border-l border-zinc-800 flex flex-row items-center justify-center gap-2.5 group cursor-default hover:bg-white/[0.02] transition-colors duration-200">
              <span className="text-xl">🚗</span>
              <span className="font-medium tracking-wide text-zinc-300 group-hover:text-white transition-colors duration-200">Auto Repair</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}