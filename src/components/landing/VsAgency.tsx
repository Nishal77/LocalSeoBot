export function VsAgency() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-block text-xs font-bold px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 mb-4 uppercase tracking-widest">vs. SEO agency</div>
          <h2 className="text-4xl font-black text-white mb-3">Same work. 94% less cost.</h2>
          <p className="text-zinc-500">Agencies do this manually with junior staff. We automated it.</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="grid grid-cols-3 text-sm border-b border-zinc-800 bg-white/[0.02]">
            <div className="px-6 py-4 text-zinc-500 font-semibold">What you get</div>
            <div className="px-6 py-4 text-center text-zinc-500 font-semibold border-l border-zinc-800">Local Agency</div>
            <div className="px-6 py-4 text-center font-bold text-transparent bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text border-l border-violet-500/20 bg-violet-500/5">RankAgent AI</div>
          </div>
          {[
            ["Weekly GBP posts", "Sometimes", "✅ Every Monday, AI-written"],
            ["Citation submissions", "One-time setup", "✅ Ongoing, 200+ verified"],
            ["Review responses", "❌ Extra charge", "✅ Within 2 hours, always"],
            ["Rank tracking", "Monthly PDF", "✅ Weekly, 20 keywords"],
            ["Works at 2am", "❌ Never", "✅ AI never sleeps"],
            ["You approve first", "❌ No control", "✅ Approval mode available"],
            ["Monthly cost", "$500 – $2,000", "$99/month"],
          ].map(([feat, agency, ours], i) => (
            <div key={String(feat)} className={`grid grid-cols-3 text-sm border-b border-zinc-800 last:border-0 ${i % 2 === 0 ? "" : "bg-white/[0.01]"}`}>
              <div className="px-6 py-4 text-zinc-300">{feat}</div>
              <div className="px-6 py-4 text-center text-zinc-500 border-l border-zinc-800">{agency}</div>
              <div className="px-6 py-4 text-center font-semibold text-white border-l border-violet-500/10 bg-violet-500/5">{ours}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
