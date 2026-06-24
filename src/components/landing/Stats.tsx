interface StatsProps {
  stats: {
    businessCount: number;
    citationsLive: number;
    reviewsResponded: number;
    postsPublished: number;
  } | null;
}

export function Stats({ stats }: StatsProps) {
  if (!stats || stats.businessCount <= 0) return null;

  return (
    <section className="py-8 border-y border-zinc-800 bg-white/[0.01]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: stats.businessCount.toLocaleString() + "+", label: "Businesses on autopilot" },
            { value: stats.citationsLive.toLocaleString() + "+", label: "Citations live" },
            { value: stats.reviewsResponded.toLocaleString() + "+", label: "Reviews responded" },
            { value: stats.postsPublished.toLocaleString() + "+", label: "GBP posts published" },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-2xl font-black text-white">{value}</div>
              <div className="text-zinc-500 text-xs mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
