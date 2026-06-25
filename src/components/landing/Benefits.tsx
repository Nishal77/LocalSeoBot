export function Benefits() {
  const benefitList = [
    {
      emoji: "📝",
      title: "AI-Written Google Posts",
      subtitle: "Every Monday, automatically",
      desc: "150–250 word post written for your GBP each week. References your city, season, and services. Published without you lifting a finger."
    },
    {
      emoji: "💬",
      title: "Review Responses in Under 2 Hours",
      subtitle: "Every review. Every time.",
      desc: "5-star? Warm and grateful. 1-star? Calm, professional, never defensive. Sounds like the owner wrote it — not a template."
    },
    {
      emoji: "📋",
      title: "200+ Directory Submissions",
      subtitle: "Daily, ongoing",
      desc: "Yelp, Apple Maps, Bing Places, Foursquare, Yellow Pages and 197 more. Submitted, tracked, and verified for NAP consistency."
    },
    {
      emoji: "📈",
      title: "Local Keyword Tracking",
      subtitle: "Every Monday before your report",
      desc: "20 keywords tracked weekly. See exactly which positions moved, who you beat, and who's still ahead."
    },
    {
      emoji: "📊",
      title: "Monday Morning Report",
      subtitle: "8am, every Monday",
      desc: "Posts published, reviews responded to, citations added, rankings moved. Everything your agent did — in one email."
    },
    {
      emoji: "🔍",
      title: "Competitor Monitoring",
      subtitle: "Weekly alerts",
      desc: "We watch your top 5 local competitors. Review spikes, new posts, ranking shifts. Get alerted before it affects you."
    }
  ];

  return (
    <section className="relative py-24 bg-transparent text-white overflow-hidden">
      {/* Background soft glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.01),transparent_70%)] pointer-events-none" />

      {/* Centered Heading Container */}
      <div className="max-w-4xl mx-auto text-center px-6 mb-16 flex flex-col items-center">
        {/* Capsule Badge */}
        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-medium text-zinc-300 mb-6 tracking-wide backdrop-blur-md select-none">
          What your agent does
        </div>

        {/* Section Headline */}
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white leading-[1.15]">
          Everything a $1,500/mo SEO agency does. Automated. For $99.

        </h2>
      </div>

      {/* Bordered grid container matching page structure */}
      <div className="max-w-6xl mx-auto border-x border-zinc-800 bg-[#09090b] relative">
        <div className="w-full relative border-t border-b border-zinc-800">

          {/* Plus Guide Ticks at Grid Corners */}
          <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
          <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
          <div className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
          <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>

          {/* Desktop Vertical Divider Ticks (top & bottom) */}
          <div className="hidden md:block absolute top-0 left-[33.333%] -translate-x-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
          <div className="hidden md:block absolute bottom-0 left-[33.333%] -translate-x-1/2 translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
          <div className="hidden md:block absolute top-0 left-[66.666%] -translate-x-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
          <div className="hidden md:block absolute bottom-0 left-[66.666%] -translate-x-1/2 translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>

          {/* Desktop Middle Horizontal Divider Line Ticks */}
          <div className="hidden md:block absolute top-[50%] left-0 -translate-x-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
          <div className="hidden md:block absolute top-[50%] left-[33.333%] -translate-x-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
          <div className="hidden md:block absolute top-[50%] left-[66.666%] -translate-x-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
          <div className="hidden md:block absolute top-[50%] right-0 translate-x-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>

          {/* Mobile Divider Intersection Ticks (based on 6 stacked cards) */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="md:hidden absolute left-0 -translate-x-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20" style={{ top: `${(i + 1) * 16.666}%` }}>+</div>
          ))}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="md:hidden absolute right-0 translate-x-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20" style={{ top: `${(i + 1) * 16.666}%` }}>+</div>
          ))}

          <div className="grid grid-cols-1 md:grid-cols-3 w-full">
            {benefitList.map((item, idx) => {
              // Custom responsive border classes for perfect layout alignment
              let borderClass = "";
              if (idx === 0) borderClass = "border-b border-zinc-800";
              else if (idx === 1) borderClass = "border-b md:border-l border-zinc-800";
              else if (idx === 2) borderClass = "border-b md:border-l border-zinc-800";
              else if (idx === 3) borderClass = "border-b md:border-b-0 border-zinc-800";
              else if (idx === 4) borderClass = "border-b md:border-b-0 md:border-l border-zinc-800";
              else if (idx === 5) borderClass = "md:border-l border-zinc-800";

              return (
                <div
                  key={idx}
                  className={`p-8 ${borderClass} flex flex-col gap-5 relative hover:bg-white/[0.01] transition-colors duration-300 group`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-xl select-none group-hover:scale-105 group-hover:bg-white/[0.06] group-hover:border-white/20 transition-all duration-300">
                    {item.emoji}
                  </div>

                  <div>
                    <p className="text-xs font-medium text-zinc-500 mb-1">{item.subtitle}</p>
                    <h3 className="text-base font-semibold text-white mb-2 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
