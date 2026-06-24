import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="py-28 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-955/40 via-blue-955/40 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-violet-600/20 to-blue-600/20 rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-2xl mx-auto text-center">
        <div className="text-5xl mb-6">⚡</div>
        <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
          Your competitors are showing up<br />
          <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">on Google. Are you?</span>
        </h2>
        <p className="text-zinc-400 text-lg mb-10">
          Setup takes 5 minutes. Your AI agent starts working immediately.
        </p>
        <Link href="/signup">
          <Button size="lg" className="h-14 px-10 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-base font-bold rounded-xl border-0 shadow-[0_0_40px_rgba(124,58,237,0.5)]">
            Start free trial — 14 days free <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
        <p className="text-zinc-600 text-sm mt-4">No credit card · No agency · No manual work</p>
      </div>
    </section>
  );
}
