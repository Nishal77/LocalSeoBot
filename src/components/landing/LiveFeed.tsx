"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, FileText, MapPin, BarChart3, FolderPlus } from "lucide-react";

const FEED_ITEMS = [
  {
    icon: CheckCircle,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    emoji: "✅",
    business: "Dental clinic, Austin TX",
    action: "5-star review responded",
    time: "4 min ago"
  },
  {
    icon: FileText,
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    emoji: "📝",
    business: "HVAC company, Denver CO",
    action: "GBP post published: \"Beat the summer heat...\"",
    time: "22 min ago"
  },
  {
    icon: MapPin,
    color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    emoji: "📁",
    business: "Plumber, Dallas TX",
    action: "Citation submitted to Apple Maps",
    time: "41 min ago"
  },
  {
    icon: CheckCircle,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    emoji: "✅",
    business: "Restaurant, Miami FL",
    action: "1-star review handled professionally",
    time: "1h ago"
  },
  {
    icon: BarChart3,
    color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    emoji: "📊",
    business: "Salon, Phoenix AZ",
    action: "Monday report sent: 3 rankings improved",
    time: "6h ago"
  },
  {
    icon: FolderPlus,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    emoji: "📁",
    business: "Chiropractor, Seattle WA",
    action: "Submitted to Yelp, Foursquare, Yellow Pages",
    time: "2h ago"
  },
  {
    icon: CheckCircle,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    emoji: "✅",
    business: "Law firm, Chicago IL",
    action: "Review responded: \"Thank you for trusting us...\"",
    time: "3h ago"
  }
];

export function LiveFeed() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Rotate items every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % FEED_ITEMS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // To build a smooth infinite scroll, we double the items array
  const displayItems = [...FEED_ITEMS, ...FEED_ITEMS];

  return (
    <section className="relative py-24 bg-transparent text-white overflow-hidden border-t border-zinc-800">
      {/* Soft background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.015),transparent_70%)] pointer-events-none" />

      {/* Header */}
      <div className="max-w-3xl mx-auto text-center px-6 mb-16 flex flex-col items-center">
        {/* Capsule Badge */}
        <div className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1 text-xs font-medium text-emerald-400 mb-6 tracking-wide backdrop-blur-md select-none">
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Live right now
        </div>

        {/* Section Headline */}
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white leading-[1.15] mb-4">
          Your agent would be doing this.
        </h2>

        {/* Subline */}
        <p className="text-zinc-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          Here&apos;s what RankAgent is doing right now across businesses like yours.
        </p>
      </div>

      {/* Ticker Box with Max Width */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border border-zinc-800 bg-[#09090b]/90 relative rounded-xl overflow-hidden shadow-[0_0_50px_-12px_rgba(16,185,129,0.03)] backdrop-blur-md">
          
          {/* Plus ticks at corners */}
          <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
          <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
          <div className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>
          <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 text-zinc-600 font-mono text-sm select-none pointer-events-none z-20">+</div>

          {/* Terminal-like Header bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 bg-white/[0.01]">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
            </div>
            <div className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase select-none">
              activity_feed_monitor
            </div>
            <div className="text-[10px] font-mono text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/10 select-none">
              LIVE_STREAMING
            </div>
          </div>

          {/* Sliding container with bottom/top fade mask */}
          <div 
            className="p-6 relative h-[256px] overflow-hidden" 
            style={{
              maskImage: "linear-gradient(to bottom, transparent, white 20%, white 80%, transparent)",
              WebkitMaskImage: "linear-gradient(to bottom, transparent, white 20%, white 80%, transparent)"
            }}
          >
            <div 
              className="transition-transform duration-700 ease-in-out flex flex-col gap-4"
              style={{ transform: `translateY(-${currentIndex * 76}px)` }}
            >
              {displayItems.map((item, idx) => {
                const Icon = item.icon;
                const isFocused = idx % FEED_ITEMS.length === currentIndex;
                
                return (
                  <div 
                    key={idx}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-500 h-[60px] ${
                      isFocused 
                        ? "bg-white/[0.02] border-zinc-700/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)] scale-[1.01] opacity-100" 
                        : "bg-transparent border-transparent opacity-30 scale-100"
                    }`}
                  >
                    <div className="flex items-center space-x-4 min-w-0">
                      {/* Emoji Icon badge */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border flex-shrink-0 ${item.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      
                      {/* Text */}
                      <div className="min-w-0 leading-tight">
                        <span className="text-zinc-150 font-semibold text-sm mr-2 truncate block sm:inline">
                          {item.emoji} {item.business}
                        </span>
                        <span className="text-zinc-400 text-xs sm:text-sm font-medium">
                          &mdash;&nbsp;&nbsp;{item.action}
                        </span>
                      </div>
                    </div>

                    {/* Time */}
                    <div className="text-xs text-zinc-500 font-mono flex-shrink-0 ml-4">
                      {item.time}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Caption Below Feed */}
      <div className="max-w-3xl mx-auto text-center px-6 mt-8">
        <p className="text-zinc-400 text-sm italic font-medium">
          None of these business owners did anything. The bot ran while they were with customers.
        </p>
      </div>
    </section>
  );
}
