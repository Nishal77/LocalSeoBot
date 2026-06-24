import Link from "next/link";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#09090b]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left Side: Astra Logo */}
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3-8 4 8 4 8-4-8-4z" />
            <path d="m4 12 8 4 8-4" />
          </svg>
          <span className="font-bold text-base text-white tracking-tight">RankAgent</span>
        </div>

        {/* Center Links: Pricing, Reviews, Comparison */}
        <div className="hidden md:flex items-center gap-8 text-[14px] font-medium text-zinc-400">
          <a href="#HowItWorks" className="hover:text-white transition-colors">How It Works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
          <a href="#comparison" className="hover:text-white transition-colors">Comparison</a>
        </div>

        {/* Right Side: Start for Free button with orange dot */}
        <div className="flex items-center gap-3">
          <Link href="/signup">
            <button className="flex items-center gap-2 border border-zinc-800 hover:border-zinc-700 bg-[#FFFFFF] hover:bg-zinc-800/80 text-black font-medium px-4 py-2.5 rounded-xl text-[13px] transition-all">
              Start for free
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
