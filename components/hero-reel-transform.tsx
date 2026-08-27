"use client";

import { useState } from "react";
import { Play, Sparkles, Volume2 } from "lucide-react";

export function HeroReelTransform() {
  const [activeCard, setActiveCard] = useState<"original" | "hi" | "ta" | "kn">("original");

  const cards = [
    {
      id: "hi" as const,
      lang: "Hindi",
      native: "हिन्दी",
      badge: "Hindi Version",
      gradient: "from-[#FF552E]/90 to-[#9A1B00]",
      offset: "-translate-x-16 sm:-translate-x-32 -rotate-6 scale-90 sm:scale-95",
      zIndex: "z-10",
      delay: "100ms",
    },
    {
      id: "original" as const,
      lang: "Original",
      native: "తెలుగు",
      badge: "Original Reel · Telugu",
      gradient: "from-[#1F1E1D] to-[#0A0A0A]",
      offset: "translate-x-0 rotate-0 scale-100",
      zIndex: "z-20",
      delay: "0ms",
    },
    {
      id: "ta" as const,
      lang: "Tamil",
      native: "தமிழ்",
      badge: "Tamil Version",
      gradient: "from-[#FF7A00]/90 to-[#B83E00]",
      offset: "translate-x-16 sm:translate-x-32 rotate-6 scale-90 sm:scale-95",
      zIndex: "z-10",
      delay: "200ms",
    },
  ];

  return (
    <div className="relative w-full max-w-lg mx-auto h-[440px] sm:h-[500px] flex items-center justify-center">
      {/* Decorative aura */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#FF441F]/10 to-transparent blur-3xl rounded-full pointer-events-none" />

      {/* Cards stack */}
      <div className="relative w-56 sm:w-64 h-[360px] sm:h-[420px] flex items-center justify-center">
        {cards.map((card) => {
          const isSelected = activeCard === card.id;

          return (
            <div
              key={card.id}
              onClick={() => setActiveCard(card.id)}
              className={`absolute inset-0 rounded-2xl p-4 flex flex-col justify-between cursor-pointer border shadow-2xl transition-all duration-500 ease-out ${
                card.offset
              } ${card.zIndex} ${
                isSelected
                  ? "ring-2 ring-[#FF441F] shadow-[0_20px_50px_rgba(255,68,31,0.25)] -translate-y-2 z-30"
                  : "hover:-translate-y-1 hover:brightness-105 opacity-90"
              } bg-gradient-to-b ${card.gradient} border-white/15 text-white`}
              style={{ transitionDelay: card.delay }}
            >
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 text-[11px] font-medium bg-black/40 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#FF552E]" />
                  <span>{card.badge}</span>
                </span>
                <span className="text-sm font-semibold opacity-90 font-serif italic">{card.native}</span>
              </div>

              {/* Center Play Graphic */}
              <div className="my-auto flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-mono text-white/70">Same voice · 00:42</p>
                  <p className="text-base font-semibold tracking-tight">{card.lang}</p>
                </div>
              </div>

              {/* Bottom Audio Waveform Simulation */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-white/60 font-mono">
                  <span className="flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-[#FF552E]" /> Voice Preserved
                  </span>
                  <span>1080p · 9:16</span>
                </div>
                <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden flex gap-0.5">
                  <div className="h-full bg-[#FF552E] w-3/5 rounded-full animate-pulse" />
                  <div className="h-full bg-white/40 flex-1 rounded-full" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
