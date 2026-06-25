"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqItems: FAQItem[] = [
    {
      question: "Will AI posts sound fake or robotic?",
      answer: "No. The AI reads your business type, city, and tone setting, then writes like a real local owner would. It avoids buzzwords, uses local references, and sounds nothing like a template. 95% of users never edit a single post."
    },
    {
      question: "What about really bad 1-star reviews?",
      answer: "The AI classifies the review as negative, writes a calm response that acknowledges the issue without being defensive, and invites the customer to resolve it privately. It never argues, never over-apologizes, never offers discounts publicly. You can always edit it first if you want."
    },
    {
      question: "Is this against Google's rules?",
      answer: "No. We use Google's official Business Profile API — the same channel Google offers to all businesses. Posts and responses go through official, approved endpoints. Same as any legitimate scheduling tool."
    },
    {
      question: "How is this different from just paying an agency?",
      answer: "Agencies charge $500–$2,000/month and work business hours. We charge $99, run 24/7/365, and send you a Monday email proving exactly what ran — with links to every post and response. Most agencies won't give you that level of transparency."
    },
    {
      question: "What if I want to pause or cancel?",
      answer: "Cancel anytime from Settings → Billing. One click. No fees, no contracts, no angry emails from your account manager. Your Google account stays yours."
    },
    {
      question: "I'm not technical. Is setup complicated?",
      answer: "It's email + password + one Google login click. 5 minutes total. The bot runs from there. You don't need to touch a dashboard. The Monday email has everything."
    }
  ];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="relative bg-[#09090b] text-white overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.01),transparent_70%)] pointer-events-none" />

      {/* Main Grid Wrapper */}
      <div className="max-w-6xl mx-auto border-x border-t border-zinc-800 bg-[#09090b] relative">
        
        {/* Plus Guide Ticks at corners */}
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
        <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
        <div className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
        <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>

        <div className="grid grid-cols-1 md:grid-cols-5 w-full">
          
          {/* Left Column: Title (2/5 Width) */}
          <div className="col-span-1 md:col-span-2 p-8 md:p-12 md:border-r border-b md:border-b-0 border-zinc-800 flex flex-col items-start justify-start relative select-none">
            {/* Capsule Badge FAQs */}
            <div className="inline-flex items-center rounded-full border border-zinc-800 bg-[#121214] px-3 py-1 text-[11px] font-medium text-zinc-400 mb-6">
              FAQs
            </div>
            
            {/* Split Header */}
            <h2 className="text-4xl md:text-5xl lg:text-[40px] font-medium tracking-tight text-white leading-[1.1] md:leading-[1.15]">
              Questions we get every day
            </h2>
          </div>

          {/* Right Column: Accordions (3/5 Width) */}
          <div className="col-span-1 md:col-span-3 flex flex-col justify-start">
            {faqItems.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div 
                  key={idx}
                  className={`border-b border-zinc-800/80 last:border-b-0 transition-colors duration-200 ${
                    isOpen ? "bg-[#121214]/65" : "hover:bg-[#121214]/30 bg-transparent"
                  }`}
                >
                  <button
                    onClick={() => handleToggle(idx)}
                    className="w-full px-8 py-6 text-left flex items-center justify-between gap-6 font-medium text-white hover:text-zinc-200 select-none group"
                  >
                    <span className="text-base md:text-lg lg:text-[19px] tracking-tight font-medium transition-colors duration-200 text-white group-hover:text-white">
                      {item.question}
                    </span>
                    <ChevronDown 
                      className={`w-4.5 h-4.5 text-zinc-500 transition-all duration-300 flex-shrink-0 stroke-[1.5] ${
                        isOpen ? "rotate-180 text-white" : ""
                      }`}
                    />
                  </button>

                  <div 
                    className={`transition-all duration-300 ease-in-out ${
                      isOpen ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
                    } overflow-hidden`}
                  >
                    <div className="px-8 pb-6 text-[15px] text-zinc-400/90 leading-relaxed max-w-[90%]">
                      {item.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Plus guide tick at the bottom left grid divider intersection */}
        <div className="hidden md:block absolute bottom-0 left-[40%] -translate-x-1/2 translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
        <div className="hidden md:block absolute top-0 left-[40%] -translate-x-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
      </div>

      {/* Bottom glowing gradient divider accent matching the image footer */}
      <div className="max-w-6xl mx-auto h-[1px] bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-yellow-500/20 w-full" />
    </section>
  );
}
