import Link from "next/link";
import { Bot } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 py-10 px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
            <Bot className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-bold text-white">RankAgent</span>
          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-gradient-to-r from-violet-500 to-blue-500 text-white tracking-widest uppercase">AI</span>
          <span className="text-zinc-600 text-sm ml-1">© {new Date().getFullYear()}</span>
        </div>
        <div className="flex gap-6 text-sm text-zinc-600">
          <Link href="/login" className="hover:text-zinc-300 transition-colors">Sign in</Link>
          <Link href="/signup" className="hover:text-zinc-300 transition-colors">Get started</Link>
          <a href="#features" className="hover:text-zinc-300 transition-colors">Features</a>
          <a href="#pricing" className="hover:text-zinc-300 transition-colors">Pricing</a>
        </div>
      </div>
    </footer>
  );
}
