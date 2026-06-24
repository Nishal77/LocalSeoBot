import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export function Pricing() {
  return (
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block text-xs font-bold px-3 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 mb-4 uppercase tracking-widest">Pricing</div>
          <h2 className="text-4xl font-black text-white mb-3">One plan. Everything included.</h2>
          <p className="text-zinc-500">No agency fees. No contracts. Cancel anytime.</p>
        </div>

        <div className="relative">
          {/* Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-violet-600/30 to-blue-600/20 rounded-3xl blur-xl" />

          <div className="relative rounded-3xl border border-violet-500/30 bg-zinc-900 overflow-hidden">
            {/* Top gradient bar */}
            <div className="h-1 bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500" />

            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-sm text-zinc-400 mb-1 font-medium">RankAgent AI · Starter</div>
                  <div className="flex items-end gap-2">
                    <span className="text-6xl font-black text-white">$99</span>
                    <span className="text-zinc-400 mb-2 text-lg">/month</span>
                  </div>
                  <div className="text-zinc-500 text-sm">per location · billed monthly</div>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  14-day free trial
                </div>
              </div>

              <div className="space-y-3 mb-8">
                {[
                  "1 AI-written GBP post every week",
                  "200+ citation directory submissions",
                  "Review responses within 2 hours",
                  "20 keywords tracked weekly",
                  "Monday morning email report",
                  "Competitor monitoring (5 competitors)",
                  "Post + review approval mode",
                  "No contracts · Cancel anytime",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-3 w-3 text-emerald-400" />
                    </div>
                    <span className="text-zinc-300">{item}</span>
                  </div>
                ))}
              </div>

              <Link href="/signup" className="block">
                <Button size="lg" className="w-full h-14 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-base font-bold rounded-xl border-0 shadow-[0_0_30px_rgba(124,58,237,0.3)]">
                  Start free trial — no card needed
                </Button>
              </Link>
              <p className="text-center text-xs text-zinc-600 mt-3">14-day free trial · then $99/month · cancel any time</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
