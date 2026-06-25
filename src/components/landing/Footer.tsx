import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative bg-[#09090b] text-zinc-400 overflow-hidden">
      {/* Grid container aligning with the page borders */}
      <div className="max-w-6xl mx-auto border-x border-t border-b border-zinc-800 bg-[#09090b] pt-16 pb-12 px-8 md:px-12 relative">
        
        {/* Plus ticks at corners */}
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
        <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
        <div className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
        <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 w-full mb-12">
          
          {/* Left Column: Brand, Description, Social Links */}
          <div className="flex flex-col items-start justify-start select-none">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-5">
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-8 4 8 4 8-4-8-4z" />
                <path d="m4 12 8 4 8-4" />
              </svg>
              <span className="font-bold text-base text-white tracking-widest uppercase">RankAgent</span>
            </div>

            {/* Description */}
            <p className="text-zinc-500 text-sm max-w-sm mb-6 leading-relaxed">
              Rank, track, and optimize your local SEO presence across ChatGPT, Claude, Perplexity, Gemini, and more.
            </p>

            {/* Social Links Row */}
            <div className="flex items-center gap-3">
              {/* X / Twitter */}
              <a 
                href="https://x.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center w-8 h-8 rounded-full border border-zinc-800 bg-[#09090b] text-zinc-400 hover:text-white hover:border-zinc-700 transition-all duration-200"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>

              {/* Threads */}
              <a 
                href="https://threads.net" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center w-8 h-8 rounded-full border border-zinc-800 bg-[#09090b] text-zinc-400 hover:text-white hover:border-zinc-700 transition-all duration-200"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.518 2.083c-2.457 0-4.664.838-6.22 2.36-1.57 1.536-2.43 3.633-2.43 5.908 0 2.277.86 4.375 2.43 5.912 1.556 1.521 3.763 2.36 6.22 2.36 1.954 0 3.778-.549 5.275-1.59l.942 1.15c-1.835 1.254-4.103 1.94-6.528 1.94-3.053 0-5.803-1.077-7.747-3.036-1.952-1.968-3.028-4.636-3.028-7.514V10.28c0-2.879 1.076-5.547 3.028-7.516C6.715.805 9.465-.27 12.518-.27c3.087 0 5.86 1.1 7.8 3.097 1.91 1.96 2.96 4.606 2.96 7.453v1.895c0 1.5-.34 2.768-1.012 3.763-.642.951-1.614 1.487-2.89 1.487-1.16 0-2.12-.524-2.716-1.479-.575-.92-.866-2.185-.866-3.757v-1.884c0-2.277-.86-4.376-2.43-5.913-1.556-1.521-3.763-2.36-6.22-2.36-2.457 0-4.664.839-6.22 2.36-1.57 1.537-2.43 3.635-2.43 5.91 0 2.277.86 4.376 2.43 5.913 1.556 1.52 3.763 2.36 6.22 2.36 1.954 0 3.778-.55 5.275-1.59l.942 1.15c-1.835 1.255-4.103 1.94-6.528 1.94z"/>
                </svg>
              </a>

              {/* GitHub */}
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center w-8 h-8 rounded-full border border-zinc-800 bg-[#09090b] text-zinc-400 hover:text-white hover:border-zinc-700 transition-all duration-200"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.09.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right Columns: Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-12 md:col-span-2">
            {/* Product Column */}
            <div>
              <h3 className="text-[13px] font-semibold text-white uppercase tracking-wider mb-4 select-none">Product</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="#features" className="text-zinc-400 hover:text-white transition-colors duration-200">Overview</Link></li>
                <li><Link href="#pricing" className="text-zinc-400 hover:text-white transition-colors duration-200">Pricing</Link></li>
                <li><Link href="#updates" className="text-zinc-400 hover:text-white transition-colors duration-200">Updates</Link></li>
                <li><Link href="#waitlist" className="text-zinc-400 hover:text-white transition-colors duration-200">Waitlist</Link></li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3 className="text-[13px] font-semibold text-white uppercase tracking-wider mb-4 select-none">Company</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="#about" className="text-zinc-400 hover:text-white transition-colors duration-200">About</Link></li>
                <li><Link href="#careers" className="text-zinc-400 hover:text-white transition-colors duration-200">Careers</Link></li>
                <li><Link href="#blog" className="text-zinc-400 hover:text-white transition-colors duration-200">Blog</Link></li>
                <li><Link href="#contact" className="text-zinc-400 hover:text-white transition-colors duration-200">Contact</Link></li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h3 className="text-[13px] font-semibold text-white uppercase tracking-wider mb-4 select-none">Legal</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="/privacy" className="text-zinc-400 hover:text-white transition-colors duration-200">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-zinc-400 hover:text-white transition-colors duration-200">Terms of Service</Link></li>
                <li><Link href="/cookies" className="text-zinc-400 hover:text-white transition-colors duration-200">Cookie Policy</Link></li>
                <li><Link href="/refund" className="text-zinc-400 hover:text-white transition-colors duration-200">Refund Policy</Link></li>
              </ul>
            </div>
          </div>

        </div>

        {/* Divider line */}
        <div className="border-t border-zinc-800/80 my-8 w-full" />

        {/* Bottom Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 w-full select-none">
          <span>© {new Date().getFullYear()} RankAgent, Inc. All rights reserved.</span>
          <span className="hover:text-zinc-400 transition-colors cursor-default">
            Template by <span className="font-semibold text-zinc-400">Zain Malik</span>
          </span>
        </div>

      </div>
    </footer>
  );
}
