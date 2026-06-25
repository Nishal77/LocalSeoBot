import { CalendarX, MessageSquareOff, Globe } from "lucide-react";

export function Problem() {
  return (
    <section className="relative py-24 bg-transparent text-white overflow-hidden">
      {/* Background soft gradient for subtle page glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.01),transparent_70%)] pointer-events-none" />

      {/* Centered Heading Container */}
      <div className="max-w-3xl mx-auto text-center px-6 mb-16 flex flex-col items-center">
        {/* Capsule Badge */}
        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-medium text-zinc-300 mb-6 tracking-wide backdrop-blur-md select-none">
        The real problem
        </div>

        {/* Section Headline */}
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white leading-[1.15]">
          While you&apos;re busy running your business, your Google listing is losing customers.
        </h2>
      </div>

      {/* 3-Column Grid spanning full-width of layout container */}
      <div className="w-full relative border-t border-b border-zinc-800">
        
        {/* Corner Plus Ticks at grid boundaries */}
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
        <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
        <div className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
        <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>

        {/* Desktop Divider Intersection Ticks */}
        <div className="hidden md:block absolute top-0 left-[33.333%] -translate-x-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
        <div className="hidden md:block absolute bottom-0 left-[33.333%] -translate-x-1/2 translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
        <div className="hidden md:block absolute top-0 left-[66.666%] -translate-x-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
        <div className="hidden md:block absolute bottom-0 left-[66.666%] -translate-x-1/2 translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>

        {/* Mobile Divider Intersection Ticks */}
        <div className="md:hidden absolute top-[33.333%] left-0 -translate-x-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
        <div className="md:hidden absolute top-[33.333%] right-0 translate-x-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
        <div className="md:hidden absolute top-[66.666%] left-0 -translate-x-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
        <div className="md:hidden absolute top-[66.666%] right-0 translate-x-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>

        <div className="grid grid-cols-1 md:grid-cols-3 w-full">
          
          {/* Card 1 */}
          <div className="p-8 md:p-12 border-b md:border-b-0 border-zinc-800 flex flex-col justify-between min-h-[380px] relative hover:bg-white/[0.01] transition-colors duration-300 group">
            <div className="text-zinc-500 group-hover:text-white transition-colors duration-300">
              <CalendarX className="w-8 h-8 stroke-[1.25]" />
            </div>
            <div className="mt-12">
              <h3 className="text-lg font-semibold text-white mb-3 leading-snug">
               Your Google profile goes quiet for weeks
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
               Google rewards businesses that post regularly. No activity = no visibility. Your competitor posts every Monday. You haven&apos;t posted for a long time.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-8 md:p-12 border-b md:border-b-0 md:border-l border-zinc-800 flex flex-col justify-between min-h-[380px] relative hover:bg-white/[0.01] transition-colors duration-300 group">
            <div className="text-zinc-500 group-hover:text-white transition-colors duration-300">
              <MessageSquareOff className="w-8 h-8 stroke-[1.25]" />
            </div>
            <div className="mt-12">
              <h3 className="text-lg font-semibold text-white mb-3 leading-snug">
               Reviews sitting unanswered for days
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                88% of customers read responses before calling. Every unanswered review — good or bad — costs you a booking. Google tracks how fast you respond.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-8 md:p-12 md:border-l border-zinc-800 flex flex-col justify-between min-h-[380px] relative hover:bg-white/[0.01] transition-colors duration-300 group">
            <div className="text-zinc-500 group-hover:text-white transition-colors duration-300">
              <Globe className="w-8 h-8 stroke-[1.25]" />
            </div>
            <div className="mt-12">
              <h3 className="text-lg font-semibold text-white mb-3 leading-snug">
                You&apos;re on 4 directories. Should be 200+.
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
               Apple Maps, Yelp, Bing Places, Yellow Pages — and 196 more. Google checks consistency across all of them. Wrong phone number on one = ranking penalty.
              </p>
            </div>
          </div>

        </div>

        {/* Horizontal Line */}
        <div className="w-full h-px bg-zinc-800" />

        {/* Tagline Content */}
        <div className="w-full py-8 px-6 text-center text-zinc-400 text-sm md:text-[15px] leading-relaxed">
          These aren&apos;t &quot;nice to haves.&quot; These are ranking factors. Your competitors have an agency doing this. <span className="text-white font-medium">Now you have a bot.</span>
        </div>
      </div>
    </section>
  );
}
