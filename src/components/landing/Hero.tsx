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

        {/* URL Input Form */}
        <div id="hero-scanner" className="mb-12 w-full max-w-lg mx-auto">
          <form action="/onboarding" method="GET" className="flex items-center gap-2 bg-[#0d0d0f]/85 border border-zinc-800 p-2 rounded-2xl focus-within:border-zinc-700/80 transition-all shadow-xl shadow-black/40">
            <input
              type="url"
              name="url"
              required
              placeholder="Enter your website URL (e.g. https://yourbusiness.com)"
              className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none min-w-0"
            />
            <button
              type="submit"
              className="h-11 px-6 bg-white hover:bg-zinc-100 text-zinc-950 font-semibold text-xs rounded-xl tracking-tight transition-colors whitespace-nowrap cursor-pointer"
            >
              Analyze Site
            </button>
          </form>
        </div>
      </div>


      {/* Works for every local business Section */}
      <div className="relative w-full mt-12 border-t border-b border-zinc-800 mt-8 mb-16 py-6 bg-transparent">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-left px-6 text-white mb-8">
         Used By
        </h2>

        <div className="w-full">
          <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 text-center text-sm font-medium text-zinc-300">
            {[
              { emoji: "🦷", name: "Dentists" },
              { emoji: "🔧", name: "Plumbers" },
              { emoji: "❄️", name: "HVAC" },
              { emoji: "🍕", name: "Restaurants" },
              { emoji: "💇", name: "Salons" },
              { emoji: "🏋️", name: "Gyms" },
              { emoji: "⚖️", name: "Law Firms" },
              { emoji: "🏠", name: "Realtors" },
              { emoji: "🚗", name: "Auto Repair" },
              { emoji: "🧹", name: "Cleaners" },
              { emoji: "🔑", name: "Locksmiths" },
              { emoji: "", name: "Across world" }
            ].map((biz, idx) => {
              // Dynamically build clean grid lines without outer borders for all screens
              let borderClasses = "border-zinc-800/80 ";
              
              // Mobile (2 columns)
              if (idx < 10) {
                borderClasses += "border-b ";
              }
              if (idx % 2 === 0) {
                borderClasses += "border-r ";
              }
              
              // Tablet (3 columns)
              if (idx < 9) {
                borderClasses += "md:border-b ";
              } else {
                borderClasses += "md:border-b-0 ";
              }
              if ((idx + 1) % 3 !== 0) {
                borderClasses += "md:border-r ";
              } else {
                borderClasses += "md:border-r-0 ";
              }
              
              // Desktop (6 columns)
              if (idx < 6) {
                borderClasses += "lg:border-b ";
              } else {
                borderClasses += "lg:border-b-0 ";
              }
              if ((idx + 1) % 6 !== 0) {
                borderClasses += "lg:border-r ";
              } else {
                borderClasses += "lg:border-r-0 ";
              }

              return (
                <div 
                  key={biz.name}
                  className={`py-6 px-4 flex flex-row items-center justify-center gap-2.5 group cursor-default hover:bg-white/[0.025] transition-colors duration-200 ${borderClasses}`}
                >
                  {biz.emoji && <span className="text-xl select-none">{biz.emoji}</span>}
                  {biz.name === "Across world" ? (
                    <span className="font-medium tracking-wide text-white/60">
                      {biz.name}
                    </span>
                  ) : (
                    <span className="font-medium tracking-wide text-zinc-350 group-hover:text-white transition-colors duration-200">
                      {biz.name}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}