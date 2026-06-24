export function HowItWorks() {
  return (
    <section id="how" className="py-24 px-6 bg-white/[0.02] border-y border-zinc-800">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block text-xs font-bold px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 mb-4 uppercase tracking-widest">3 steps</div>
          <h2 className="text-4xl font-black text-white mb-3">Setup once. Runs forever.</h2>
          <p className="text-zinc-500">From signup to AI agent running in under 5 minutes.</p>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-7 top-8 bottom-8 w-px bg-gradient-to-b from-violet-500/50 via-blue-500/50 to-cyan-500/20 hidden md:block" />

          <div className="space-y-4">
            {[
              {
                n: "1",
                gradient: "from-violet-600 to-violet-700",
                glow: "shadow-[0_0_20px_rgba(124,58,237,0.4)]",
                title: "Connect your Google Business Profile",
                desc: "One OAuth click. 30 seconds. We get access to post on your behalf, reply to reviews, and read your profile.",
                time: "30 seconds",
              },
              {
                n: "2",
                gradient: "from-blue-600 to-blue-700",
                glow: "shadow-[0_0_20px_rgba(37,99,235,0.4)]",
                title: "See your instant SEO audit",
                desc: "We scan your profile completeness, check current rankings, and show exactly what's hurting your visibility. Takes 60 seconds.",
                time: "60 seconds",
              },
              {
                n: "3",
                gradient: "from-emerald-600 to-emerald-700",
                glow: "shadow-[0_0_20px_rgba(5,150,105,0.4)]",
                title: "AI agent starts immediately",
                desc: "Posts every Monday. Review responses within 2 hours. Citations daily. Monday report at 8am. You do nothing else.",
                time: "Forever",
              },
            ].map(({ n, gradient, glow, title, desc, time }) => (
              <div key={n} className="flex gap-6 p-6 rounded-2xl border border-zinc-800 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <div className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} ${glow} flex items-center justify-center font-black text-xl text-white`}>
                  {n}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="font-bold text-white text-lg">{title}</h3>
                    <span className="text-xs text-zinc-500 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">{time}</span>
                  </div>
                  <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
