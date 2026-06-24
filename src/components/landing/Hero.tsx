import { Button } from "@/components/ui/button";
import { Heart, Search, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-24 pb-16 px-6 overflow-hidden bg-[#09090b] min-h-screen text-white">
      {/* Background radial gradient for subtle glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.05),transparent_70%)] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto text-center flex flex-col items-center">

        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-zinc-300 mb-8 backdrop-blur-md">
          <Heart className="h-4 w-4 text-red-500 fill-red-500" />
          <span>AI agent running for 1,200+ businesses right now</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-medium tracking-tight mb-6 leading-[1.1] max-w-4xl">
          Your Google Listing. Running Itself.
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed mb-10">
          RankAgent handles your Google reviews, weekly posts and 200+ business directories automatically. No agency. No effort. Just more customers finding you on Google.
        </p>

        {/* CTA Button */}
        <div className="mb-12">
          <Button size="lg" className="h-12 px-6 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-medium transition-all gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            Start Free for 14 Day
          </Button>
        </div>

        {/* Trusted By Section */}
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center mb-16">
          <p className="text-sm text-zinc-500 mb-6">Trusted by people placed at ↓</p>

          {/* Logo Strip (Mockup representing the company cards) */}
          <div className="flex flex-wrap justify-center gap-4 opacity-70">
            {/* L&T Mock */}
            <div className="h-12 w-32 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center">
              <span className="text-blue-500 font-bold text-xl">L&T</span>
            </div>
            {/* Tech Mahindra Mock */}
            <div className="h-12 w-40 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center">
              <span className="text-red-500 font-bold tracking-tighter">TECH <br /> mahindra</span>
            </div>
            {/* Flipkart Mock */}
            <div className="h-12 w-32 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center gap-2">
              <div className="w-6 h-6 bg-yellow-400 rounded-sm"></div>
              <span className="text-white font-semibold">Flipkart</span>
            </div>
            {/* Nvidia Mock */}
            <div className="h-12 w-32 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center gap-2">
              <div className="w-6 h-6 bg-green-500 rounded-tl-lg rounded-br-lg"></div>
              <span className="text-white font-bold">NVIDIA</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── DASHBOARD UI MOCKUP ── */}
      <div className="relative max-w-5xl mx-auto mt-4">
        <div className="rounded-2xl border border-white/10 bg-[#0f0f11] overflow-hidden shadow-2xl flex flex-col md:flex-row h-[400px]">

          {/* Sidebar */}
          <div className="w-full md:w-64 border-r border-white/10 bg-[#131316] p-4 flex flex-col hidden md:flex">
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-8 px-2">
              <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
                <div className="w-3 h-3 bg-black rounded-sm" />
              </div>
              Astra
            </div>

            <div className="flex items-center justify-between text-zinc-400 text-sm px-2 mb-4 hover:text-white cursor-pointer">
              <span>Hiring</span>
              <ChevronDown className="h-4 w-4" />
            </div>

            <nav className="space-y-1">
              <div className="flex items-center justify-between px-2 py-2 bg-white/5 rounded-lg text-white text-sm cursor-pointer border border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border border-zinc-500 rounded-sm" />
                  All Jobs
                </div>
                <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded text-xs">new</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-2 text-zinc-400 text-sm hover:text-white hover:bg-white/5 rounded-lg cursor-pointer">
                <div className="w-4 h-4 border border-zinc-600 rounded-sm flex items-center justify-center" />
                Startup Jobs
              </div>
              <div className="flex items-center gap-2 px-2 py-2 text-zinc-400 text-sm hover:text-white hover:bg-white/5 rounded-lg cursor-pointer">
                <div className="w-4 h-4 border border-zinc-600 rounded-sm" />
                Company Jobs
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 flex flex-col bg-[#0f0f11]">
            <h2 className="text-lg font-medium text-white mb-1">Hiring Calendar</h2>
            <p className="text-sm text-zinc-500 mb-6">Track all job and internship openings on a calendar view.</p>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search internships..."
                className="w-full max-w-md bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/20"
              />
            </div>

            {/* Tags Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              <div className="px-3 py-1.5 bg-white text-black text-xs font-medium rounded-full cursor-pointer">All</div>
              {["AI / ML", "Backend Engineering", "Blockchain / Web3", "Business", "Data", "Data Science", "Design"].map(tag => (
                <div key={tag} className="px-3 py-1.5 bg-white/5 border border-white/10 text-zinc-300 text-xs rounded-full flex items-center gap-1.5 cursor-pointer hover:bg-white/10">
                  {tag} <span className="text-zinc-500 text-[10px] bg-white/10 px-1.5 rounded-full">2</span>
                </div>
              ))}
            </div>

            {/* Calendar Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mt-auto border-t border-white/10 pt-4">
              <div className="flex items-center gap-4 text-sm text-zinc-400">
                <button className="flex items-center gap-1 hover:text-white"><ChevronLeft className="h-4 w-4" /> Prev</button>
                <span className="text-white font-medium">May 2026</span>
                <button className="flex items-center gap-1 hover:text-white">Next <ChevronRight className="h-4 w-4" /></button>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Internships this month: 85
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <input type="checkbox" className="rounded border-zinc-700 bg-zinc-800" />
                  Match my resume
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}