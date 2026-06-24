import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800 bg-[#09090b]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">RankAgent</span>
          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-gradient-to-r from-violet-500 to-blue-500 text-white tracking-widest uppercase">AI</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how" className="hover:text-white transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/5 text-sm">Sign in</Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-sm font-semibold px-5 h-9 rounded-lg border-0">
              Start free trial
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
