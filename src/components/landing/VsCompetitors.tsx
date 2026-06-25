
export function VsCompetitors() {
  const headers = [
    "What you get",
    "LocalSEOBot",
    "SEO Agency",
    "Yext",
    "BrightLocal",
    "Doing It Yourself"
  ];

  const rows = [
    {
      label: "Price",
      ours: "$99/mo",
      agency: "$800–2,000/mo",
      yext: "$199/mo",
      bright: "$39/mo",
      diy: "Free (but your time)"
    },
    {
      label: "Actually does the work",
      ours: "✓ Fully automated",
      agency: "✓ Humans do it",
      yext: "✕ Just listings",
      bright: "✕ Just reports",
      diy: "✕ You do everything"
    },
    {
      label: "Google posts written",
      ours: "✓ Weekly",
      agency: "✓ (costs extra)",
      yext: "✕ No",
      bright: "✕ No",
      diy: "You write them"
    },
    {
      label: "Review responses",
      ours: "✓ Within 2 hours",
      agency: "✓ (slow)",
      yext: "✕ No",
      bright: "✕ No",
      diy: "You reply manually"
    },
    {
      label: "Citation building",
      ours: "✓ 200+ directories",
      agency: "✓ (expensive)",
      yext: "✓ 100+",
      bright: "✓ Yes",
      diy: "Hours of manual work"
    },
    {
      label: "Keyword tracking",
      ours: "✓ Weekly",
      agency: "✓ Yes",
      yext: "✕ No",
      bright: "✓ Yes",
      diy: "Manual"
    },
    {
      label: "Monday report",
      ours: "✓ Automatic",
      agency: "✓ (monthly)",
      yext: "✕ No",
      bright: "✓ Yes",
      diy: "You track yourself"
    },
    {
      label: "Setup time",
      ours: "3 minutes",
      agency: "2-week onboarding",
      yext: "1 hour",
      bright: "30 mins",
      diy: "Ongoing"
    },
    {
      label: "Ongoing effort",
      ours: "Zero",
      agency: "Weekly calls",
      yext: "Moderate",
      bright: "You manage it",
      diy: "Hours/week"
    }
  ];

  const renderValue = (val: string, isOurs: boolean) => {
    const hasCheck = val.startsWith("✓");
    const hasCross = val.startsWith("✕");
    const cleanVal = val.replace("✓", "").replace("✕", "").trim();

    if (isOurs) {
      if (hasCheck) {
        return (
          <span className="flex items-center justify-center gap-1.5 font-medium text-emerald-400">
            <span className="text-emerald-500 font-semibold select-none">✓</span>
            <span className="font-semibold">{cleanVal}</span>
          </span>
        );
      }
      return <span className="font-semibold text-white">{val}</span>;
    }

    // Muted styles for other columns
    if (hasCheck) {
      return (
        <span className="flex items-center justify-center gap-1.5 font-medium text-zinc-300">
          <span className="text-emerald-500 select-none">✓</span>
          <span>{cleanVal}</span>
        </span>
      );
    }
    if (hasCross) {
      return (
        <span className="flex items-center justify-center gap-1.5 font-medium text-zinc-500">
          <span className="text-red-500 select-none">✕</span>
          <span>{cleanVal}</span>
        </span>
      );
    }
    return <span className="font-medium text-zinc-400">{val}</span>;
  };

  return (
    <section className="relative py-24 bg-transparent text-white overflow-hidden border-t border-zinc-800">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.01),transparent_70%)] pointer-events-none" />

      {/* Header */}
      <div className="max-w-3xl mx-auto text-center px-6 mb-16 flex flex-col items-center">
        {/* Capsule Badge */}
        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-medium text-zinc-300 mb-6 tracking-wide backdrop-blur-md select-none">
        vs. the alternatives
        </div>

        {/* Section Headline */}
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white leading-[1.15]">
         Same work. 94% less cost.
        </h2>

        {/* Section Subheadline */}
        <p className="text-zinc-400 text-sm md:text-base mt-4 max-w-2xl mx-auto leading-relaxed">
          Agencies do this manually with junior staff. Every other tool makes you do it yourself. We automated it.
        </p>
      </div>

      {/* Bordered Box wrapper matching page structure */}
      <div className="max-w-6xl mx-auto border-x border-zinc-800 bg-[#09090b] relative">
        <div className="w-full relative border-t border-b border-zinc-800">
          
          {/* Corner Plus Ticks */}
          <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
          <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
          <div className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
          <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>

          {/* Table Container with Horizontal Scroll support on Mobile */}
          <div className="w-full overflow-x-auto scrollbar-thin">
            <div className="min-w-[850px] w-full text-sm">
              
              {/* Table Header */}
              <div className="grid grid-cols-6 border-b border-zinc-800 bg-black">
                {headers.map((h, idx) => {
                  const isOurs = idx === 1;
                  return (
                    <div 
                      key={idx} 
                      className={`px-6 py-5 text-center font-medium border-r border-zinc-800 last:border-r-0 flex items-center justify-center ${
                        idx === 0 ? "text-left justify-start text-zinc-400" : ""
                      } ${
                        isOurs ? "text-[#3b82f6] font-semibold" : "text-zinc-300"
                      }`}
                    >
                      {h}
                    </div>
                  );
                })}
              </div>

              {/* Table Rows */}
              {rows.map((row, rowIdx) => (
                <div 
                  key={rowIdx} 
                  className="grid grid-cols-6 border-b border-zinc-800 last:border-b-0 bg-[#09090b]"
                >
                  {/* Label */}
                  <div className="px-6 py-4 text-left font-medium text-white border-r border-zinc-800 flex items-center">
                    {row.label}
                  </div>

                  {/* LocalSEOBot */}
                  <div className="px-6 py-4 text-center border-r border-zinc-800 flex items-center justify-center bg-black/20">
                    {renderValue(row.ours, true)}
                  </div>

                  {/* SEO Agency */}
                  <div className="px-6 py-4 text-center border-r border-zinc-800 flex items-center justify-center">
                    {renderValue(row.agency, false)}
                  </div>

                  {/* Yext */}
                  <div className="px-6 py-4 text-center border-r border-zinc-800 flex items-center justify-center">
                    {renderValue(row.yext, false)}
                  </div>

                  {/* BrightLocal */}
                  <div className="px-6 py-4 text-center border-r border-zinc-800 flex items-center justify-center">
                    {renderValue(row.bright, false)}
                  </div>

                  {/* Doing It Yourself */}
                  <div className="px-6 py-4 text-center flex items-center justify-center">
                    {renderValue(row.diy, false)}
                  </div>
                </div>
              ))}

            </div>
          </div>

        </div>
      </div>

      {/* Callout Box */}
      <div className="max-w-4xl mx-auto px-6 mt-16">
        <div className="rounded-xl border border-zinc-800 bg-white/[0.01] p-6 text-center select-none relative overflow-hidden group hover:border-zinc-700/80 transition-colors duration-300">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.01),transparent_70%)] pointer-events-none" />
          <p className="text-zinc-300 text-sm md:text-base leading-relaxed font-medium">
            &ldquo;The math is simple: agencies charge $500–$2,000/month for the same 3 tasks. <span className="text-white font-semibold">RankAgent does it for $99, runs 24/7,</span> and sends you proof every Monday.&rdquo;
          </p>
        </div>
      </div>
    </section>
  );
}
