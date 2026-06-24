import { Shield, Clock, TrendingUp } from "lucide-react";

export function TrustSignals() {
  return (
    <section className="py-16 px-6 bg-white/[0.02] border-y border-zinc-800">
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Shield,
              color: "text-violet-400",
              bg: "bg-violet-500/10 border-violet-500/20",
              title: "You're always in control",
              desc: "Turn on approval mode. Every post and review response lands in your inbox before going live. Nothing publishes without your say.",
            },
            {
              icon: Clock,
              color: "text-emerald-400",
              bg: "bg-emerald-500/10 border-emerald-500/20",
              title: "Reviews in under 2 hours",
              desc: "Google rewards fast responders. Most owners take days. Your bot responds while you're with a customer at 11pm.",
            },
            {
              icon: TrendingUp,
              color: "text-blue-400",
              bg: "bg-blue-500/10 border-blue-500/20",
              title: "Results in 30 days or less",
              desc: "Most businesses see ranking movement within 4 weeks. Citations build authority. Posts keep your profile fresh. Reviews build trust.",
            },
          ].map(({ icon: Icon, color, bg, title, desc }) => (
            <div key={title} className={`p-6 rounded-2xl border ${bg} bg-gradient-to-b from-white/[0.03] to-transparent`}>
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4 border`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <h3 className="font-bold text-white mb-2">{title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
