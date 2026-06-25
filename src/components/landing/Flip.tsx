import { X, Check } from "lucide-react";

export function Flip() {
  const withoutItems = [
    "Reviews going unanswered",
    "No Google posts for months",
    "Missing from most directories",
    "No idea where you rank",
    "Paying agency $1,200/month"
  ];

  const withItems = [
    "Every review replied to within 2 hours",
    "Fresh post every single week",
    "Listed on 200+ sites automatically",
    "Weekly ranking report every Monday",
    "$99/month, bot does more"
  ];

  return (
    <section className="relative py-24 bg-transparent text-white overflow-hidden border-t border-zinc-800">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.01),transparent_70%)] pointer-events-none" />

      {/* Header */}
      <div className="max-w-3xl mx-auto text-center px-6 mb-16 flex flex-col items-center">
        {/* Capsule Badge */}
        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-medium text-zinc-300 mb-6 tracking-wide backdrop-blur-md select-none">
          Here&apos;s what changes
        </div>

        {/* Section Headline */}
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white leading-[1.15]">
          Connect once. The bot handles everything. Forever.
        </h2>
      </div>

      {/* Grid Comparison */}
      <div className="w-full relative border-t border-b border-zinc-800">
        
        {/* Plus Guide Ticks */}
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
        <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
        <div className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
        <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>

        {/* Desktop Center Divider Plus Ticks */}
        <div className="hidden md:block absolute top-0 left-[50%] -translate-x-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
        <div className="hidden md:block absolute bottom-0 left-[50%] -translate-x-1/2 translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>

        <div className="grid grid-cols-1 md:grid-cols-2 w-full">
          
          {/* WITHOUT Column */}
          <div className="p-8 md:p-16 flex flex-col gap-8 relative bg-red-500/[0.005] hover:bg-red-500/[0.01] transition-colors duration-300">
            <h3 className="text-zinc-500 font-semibold text-lg tracking-wider uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              WITHOUT LocalSEOBot
            </h3>
            <div className="flex flex-col gap-6">
              {withoutItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 group">
                  <div className="w-6 h-6 rounded-full border border-red-500/20 bg-red-500/5 text-red-500 flex items-center justify-center flex-shrink-0">
                    <X className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span className="text-zinc-400 text-base font-medium group-hover:text-zinc-300 transition-colors duration-200">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* WITH Column */}
          <div className="p-8 md:p-16 border-t md:border-t-0 md:border-l border-zinc-800 flex flex-col gap-8 relative bg-[radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.02),transparent_70%)] hover:bg-green-500/[0.01] transition-colors duration-300">
            <h3 className="text-green-400 font-semibold text-lg tracking-wider uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              WITH LocalSEOBot
            </h3>
            <div className="flex flex-col gap-6">
              {withItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 group">
                  <div className="w-6 h-6 rounded-full border border-green-500/20 bg-green-500/5 text-green-400 flex items-center justify-center flex-shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.1)]">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span className="text-white text-base font-semibold tracking-wide group-hover:text-green-300 transition-colors duration-200">
                    {item}
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
