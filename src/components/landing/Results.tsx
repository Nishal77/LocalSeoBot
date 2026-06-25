"use client";

interface TestimonialCardProps {
  initials: string;
  name: string;
  role: string;
  textBeforeHighlight: string;
  highlightedText: string;
  textAfterHighlight: string;
  readMore?: boolean;
}

function TestimonialCard({
  initials,
  name,
  role,
  textBeforeHighlight,
  highlightedText,
  textAfterHighlight,
  readMore
}: TestimonialCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-zinc-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Header (Avatar Initials + Name/Role) */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-10 h-10 rounded-full bg-zinc-950 flex items-center justify-center text-white text-[13px] font-bold select-none uppercase tracking-wide">
            {initials}
          </div>
          <div>
            <h4 className="text-zinc-900 font-bold text-sm md:text-[15px] leading-tight">{name}</h4>
            <p className="text-zinc-500 text-xs mt-0.5 leading-tight">{role}</p>
          </div>
        </div>

        {/* 5 Rating Stars */}
        <div className="flex items-center gap-0.5 mb-4">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className="w-4 h-4 fill-amber-400 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>

        {/* Testimonial text with highlighter element */}
        <p className="text-zinc-700 text-[14px] leading-relaxed text-left">
          {textBeforeHighlight}
          <span className="bg-[#fef08a]/80 text-zinc-950 font-medium px-1.5 py-0.5 rounded-sm mx-0.5 shadow-sm">
            {highlightedText}
          </span>
          {textAfterHighlight}
        </p>
      </div>

      {readMore && (
        <div className="text-[11px] text-zinc-400 font-semibold mt-4 hover:text-zinc-500 cursor-pointer select-none text-left">
          Read more
        </div>
      )}
    </div>
  );
}

export function Results() {
  const col1: TestimonialCardProps[] = [
    {
      initials: "PS",
      name: "Dr. Priya S.",
      role: "Family Dentist · Chicago",
      textBeforeHighlight: "I really like using LocalSEOBot. ",
      highlightedText: "We moved from rank #8 to rank #2 for \"dentist Chicago\" in just 6 weeks, which brought a massive +340% increase in new patients from Google.",
      textAfterHighlight: " Setup was incredibly simple and took less than 3 minutes."
    },
    {
      initials: "JR",
      name: "James R.",
      role: "HVAC Owner · Austin",
      textBeforeHighlight: "This bot helped me a lot. ",
      highlightedText: "Our calls from Google have doubled since all 12 unanswered reviews were cleared and replied to. We now maintain a solid 4.7 stars.",
      textAfterHighlight: " Our profile has never been more active and trusted."
    }
  ];

  const col2: TestimonialCardProps[] = [
    {
      initials: "RC",
      name: "Raymond Chan",
      role: "Chiropractic Owner · Phoenix",
      textBeforeHighlight: "This platform is really helpful! ",
      highlightedText: "The automated Google posts are well-made, easy to adjust, and saved me so much time. I don't need to write posts from scratch.",
      textAfterHighlight: " The Monday ranking reports are incredibly simple to read."
    },
    {
      initials: "AJ",
      name: "Anurag Joshi",
      role: "Local Web Agency · NYC",
      textBeforeHighlight: "I've been using LocalSEOBot for my local clients for a while now, and it has saved me so much development time. ",
      highlightedText: "The setup is easy to customize and works smoothly for all my client business profiles. It's a really helpful tool with well-designed automations.",
      textAfterHighlight: " Looking forward to managing more client profiles here.",
      readMore: true
    }
  ];

  const col3: TestimonialCardProps[] = [
    {
      initials: "ML",
      name: "Maria L.",
      role: "Salon Owner · Miami",
      textBeforeHighlight: "I have 3 locations and was spending 3 hours a week managing reviews manually. ",
      highlightedText: "Now it's zero hours. The bot manages all 3 locations automatically. I am saving $3,600/month compared to my previous agency.",
      textAfterHighlight: " No weekly calls or long contracts.",
      readMore: true
    },
    {
      initials: "SH",
      name: "Sarah H.",
      role: "Bakery Owner · Boston",
      textBeforeHighlight: "Customers have mentioned how much they appreciate our quick replies. ",
      highlightedText: "We average 0.4 stars higher since the bot replies to everything automatically within 2 hours. Our rating went from 4.2 to 4.6.",
      textAfterHighlight: " Highly recommend this for local shops."
    }
  ];

  const col4: TestimonialCardProps[] = [
    {
      initials: "DK",
      name: "David K.",
      role: "Landscape Architect · Seattle",
      textBeforeHighlight: "Our local leads have grown so much! ",
      highlightedText: "We average 15+ more inbound calls every single week now without paying a single dollar for Google Ads.",
      textAfterHighlight: " The bot handles everything."
    },
    {
      initials: "ER",
      name: "Elena R.",
      role: "Boutique Hotel Owner · Denver",
      textBeforeHighlight: "I was skeptical about automated review management. But the bot response quality is perfect, professional, and prompt. ",
      highlightedText: "Every single review receives an automated reply in 2 hours, keeping our customer rating at 4.8 stars.",
      textAfterHighlight: " Our booking inquiries from local search have doubled."
    }
  ];

  return (
    <section className="relative py-24 bg-[#09090b] text-white overflow-hidden border-t border-zinc-800">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.01),transparent_70%)] pointer-events-none" />

      {/* Header */}
      <div className="max-w-3xl mx-auto text-center px-6 mb-16 flex flex-col items-center">
        {/* Capsule Badge */}
        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-medium text-zinc-300 mb-6 tracking-wide backdrop-blur-md select-none">
          Testinomials
        </div>

        {/* Section Headline */}
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white leading-[1.15]">
          Local businesses, real results.
        </h2>
      </div>

      {/* Testimonials Masonry Wall Grid */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          
          {/* Column 1 */}
          <div className="flex flex-col gap-4">
            {col1.map((item, idx) => (
              <TestimonialCard 
                key={idx}
                initials={item.initials}
                name={item.name}
                role={item.role}
                textBeforeHighlight={item.textBeforeHighlight}
                highlightedText={item.highlightedText}
                textAfterHighlight={item.textAfterHighlight}
                readMore={item.readMore}
              />
            ))}
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-4">
            {col2.map((item, idx) => (
              <TestimonialCard 
                key={idx}
                initials={item.initials}
                name={item.name}
                role={item.role}
                textBeforeHighlight={item.textBeforeHighlight}
                highlightedText={item.highlightedText}
                textAfterHighlight={item.textAfterHighlight}
                readMore={item.readMore}
              />
            ))}
          </div>

          {/* Column 3 */}
          <div className="flex flex-col gap-4">
            {col3.map((item, idx) => (
              <TestimonialCard 
                key={idx}
                initials={item.initials}
                name={item.name}
                role={item.role}
                textBeforeHighlight={item.textBeforeHighlight}
                highlightedText={item.highlightedText}
                textAfterHighlight={item.textAfterHighlight}
                readMore={item.readMore}
              />
            ))}
          </div>

          {/* Column 4 */}
          <div className="flex flex-col gap-4">
            {col4.map((item, idx) => (
              <TestimonialCard 
                key={idx}
                initials={item.initials}
                name={item.name}
                role={item.role}
                textBeforeHighlight={item.textBeforeHighlight}
                highlightedText={item.highlightedText}
                textAfterHighlight={item.textAfterHighlight}
                readMore={item.readMore}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
