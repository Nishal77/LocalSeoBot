import { Star } from "lucide-react";

export function Testimonials() {
  return (
    <section className="py-16 px-6 bg-white/[0.02] border-y border-zinc-800">
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              quote: "I was paying $1,200/month to an agency. Now I pay $99. The bot posts to my Google profile every week and my calls have gone up 40%.",
              author: "Dr. James M.",
              role: "Dentist · Austin, TX",
              stars: 5,
            },
            {
              quote: "Setup was genuinely 5 minutes. The bot responded to a bad review I got at 1am better than I would have. I was shocked.",
              author: "Maria S.",
              role: "HVAC Owner · Phoenix, AZ",
              stars: 5,
            },
            {
              quote: "Moved from #11 to #4 for 'plumber near me' in 6 weeks. I don't know exactly what the bot is doing but it's working.",
              author: "Kevin T.",
              role: "Plumber · Dallas, TX",
              stars: 5,
            },
          ].map(({ quote, author, role, stars }) => (
            <div key={author} className="rounded-2xl border border-zinc-800 bg-white/[0.02] p-6">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: stars }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed mb-5">&ldquo;{quote}&rdquo;</p>
              <div>
                <div className="font-semibold text-white text-sm">{author}</div>
                <div className="text-zinc-500 text-xs">{role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
