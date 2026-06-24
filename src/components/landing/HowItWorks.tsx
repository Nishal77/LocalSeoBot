export function HowItWorks() {
  return (
    <section id="HowItWorks" className="py-24 px-6 bg-[#09090b] border-b border-zinc-800/80">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <div className="inline-block text-xs font-bold px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 mb-4 uppercase tracking-widest">3 steps</div>
          <h2 className="text-4xl font-semibold text-white mb-3 tracking-tight">Setup once. Runs forever.</h2>
          <p className="text-zinc-400 text-sm">From signup to AI agent running in under 5 minutes.</p>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            {[
              {
                n: "1",
                title: "1. Connect your Google account",
              },
              {
                n: "2",
                title: "2. Bot audits your listing and gets to work immediately",
              },
              {
                n: "3",
                title: "3. Customers find you. You do nothing.",
              },
            ].map(({ n, title }) => (
              <div key={n} className="flex flex-col items-center text-center p-4 relative">
                
                {/* Premium Cloud Graphic */}
                <div className="relative w-32 h-32 flex items-center justify-center mb-8 flex-shrink-0">
                  {/* Outer soft organic cloud blob */}
                  <div className="absolute inset-0 bg-blue-500/[0.03] rounded-[60%_40%_30%_70%_/_60%_30%_70%_40%] blur-[4px] animate-[spin_30s_linear_infinite]" />
                  {/* Mid organic cloud blob rotating other way */}
                  <div className="absolute w-24 h-24 bg-blue-500/[0.08] rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%] blur-[2px] animate-[spin_20s_linear_infinite_reverse]" />
                  {/* Inner cloud core with soft blue glow */}
                  <div className="absolute w-16 h-16 bg-blue-500/10 rounded-full blur-[8px]" />
                  
                  {/* Centered Step Number */}
                  <span className="relative font-bold text-3xl text-blue-400 tracking-tight select-none">
                    0{n}
                  </span>
                </div>
                
                <h3 className="font-semibold text-white text-lg mb-3 tracking-tight">{title}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
