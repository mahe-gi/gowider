"use client";

import React, { useState, useEffect } from "react";

type ThemeType = "cinema" | "editorial" | "studio" | "noir" | "vogue";

interface ThemeDetails {
  name: string;
  badge: string;
  tagline: string;
  accent: string;
  description: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  accentColor: string;
  sampleTitle: string;
  sampleMeta: string;
  sampleRole: string;
  isPro?: boolean;
}

const THEMES: Record<ThemeType, ThemeDetails> = {
  cinema: {
    name: "Cinema",
    badge: "MONOCHROME PURITY",
    tagline: "OLED Pitch-Black • Dramatic Media Scale",
    accent: "#E5E5E5",
    description: "Designed for high-end commercial directors, narrative editors, and colorists who want deep blacks and museum-grade negative space.",
    bgColor: "bg-black",
    borderColor: "border-white/[0.15]",
    textColor: "text-white",
    accentColor: "text-zinc-300",
    sampleTitle: "PROJECT // CHRONOS 4K",
    sampleMeta: "01 / COMMERCIAL SHOWREEL",
    sampleRole: "DIRECTOR & LEAD EDITOR",
  },
  editorial: {
    name: "Editorial",
    badge: "SWISS TYPOGRAPHY",
    tagline: "Asymmetric Layout • Vermillion Accent (#FF3B30)",
    accent: "#FF3B30",
    description: "Crafted for documentary filmmakers and visual journalists. High-contrast headlines and editorial pacing inspired by printed monographs.",
    bgColor: "bg-[#080808]",
    borderColor: "border-red-900/40",
    textColor: "text-white",
    accentColor: "text-[#FF3B30]",
    sampleTitle: "DOCUMENTARY: ECHOES OF THE VALLEY",
    sampleMeta: "01 // INVESTIGATIVE PIECE",
    sampleRole: "DOCUMENTARY FILMMAKER & COLORIST",
  },
  studio: {
    name: "Studio",
    badge: "MODULAR TECHNICAL GRID",
    tagline: "Dense Metadata • Electric Cyan (#2997FF)",
    accent: "#2997FF",
    description: "Built for motion designers, 3D artists, and VFX supervisors. Dense technical metadata chips, camera packages, and tabular timecodes.",
    bgColor: "bg-[#07090E]",
    borderColor: "border-blue-900/40",
    textColor: "text-white",
    accentColor: "text-[#2997FF]",
    sampleTitle: "CYBERPUNK CONCERT VISUALS & VFX",
    sampleMeta: "[STU-2026 // TIME: 03:42:12]",
    sampleRole: "3D MOTION & COMPOSITING LEAD",
  },
  noir: {
    name: "Noir",
    badge: "PRO • 2.39:1 ANAMORPHIC SCOPE",
    tagline: "Amber Darkroom • Optical Lens Data",
    accent: "#F59E0B",
    description: "Engineered for auteur directors, indie cinematographers, and colorists. True 2.39:1 scope frames, camera lens package chips, and atmospheric amber darkroom glow.",
    bgColor: "bg-[#050505]",
    borderColor: "border-amber-500/30",
    textColor: "text-white",
    accentColor: "text-amber-400",
    sampleTitle: "DIRECTORIAL SCOPE // PANAVISION C-SERIES",
    sampleMeta: "2.39:1 // 35MM ANAMORPHIC",
    sampleRole: "DIRECTOR OF PHOTOGRAPHY",
    isPro: true,
  },
  vogue: {
    name: "Vogue",
    badge: "PRO • HIGH-FASHION EDITORIAL",
    tagline: "Champagne Platinum • Asymmetric Lookbook",
    accent: "#EFE3C3",
    description: "Designed for fashion filmmakers, luxury campaigns, and editorial stylists. Dramatic oversized serif italics, champagne platinum accents, and asymmetric runway magazine pacing.",
    bgColor: "bg-[#070707]",
    borderColor: "border-[#EFE3C3]/30",
    textColor: "text-white",
    accentColor: "text-[#EFE3C3]",
    sampleTitle: "MAISON DE L'OMBRE // WINTER CAMPAIGN",
    sampleMeta: "HAUTE COUTURE // LOOKBOOK 26",
    sampleRole: "FASHION FILMMAKER & CREATIVE DIRECTOR",
    isPro: true,
  },
};

const THEME_BACKGROUNDS: Record<ThemeType, string> = {
  cinema:
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80",
  editorial:
    "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80",
  studio:
    "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80",
  noir:
    "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1200&q=80",
  vogue:
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
};

export function ThemeSwitcher() {
  const [activeTheme, setActiveTheme] = useState<ThemeType>("cinema");
  const current = THEMES[activeTheme];

  // Preload all 3 theme images immediately on mount for 0ms tab switching
  useEffect(() => {
    Object.values(THEME_BACKGROUNDS).forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }, []);

  return (
    <section id="themes" className="py-24 border-t border-white/[0.08] relative">
      {/* Link preloads for 0ms instant tab transitions */}
      {(Object.keys(THEME_BACKGROUNDS) as ThemeType[]).map((themeKey) => (
        <link
          key={themeKey}
          rel="preload"
          as="image"
          href={THEME_BACKGROUNDS[themeKey]}
        />
      ))}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 block mb-2">
              04 // SIGNATURE AESTHETICS
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
              ONE WORKFLOW. FIVE SIGNATURE LOOKS.
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-sans text-zinc-400 max-w-sm">
            Switch your portfolio aesthetic with a single click in your dashboard. Includes Pro-exclusive directorial and luxury magazine layouts.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-2 border-b border-white/[0.1] pb-4 mb-8">
          {(["cinema", "editorial", "studio", "noir", "vogue"] as ThemeType[]).map((themeKey) => {
            const isSelected = activeTheme === themeKey;
            const themeItem = THEMES[themeKey];
            return (
              <button
                key={themeKey}
                onClick={() => setActiveTheme(themeKey)}
                className={`px-5 py-3 font-mono text-xs uppercase tracking-[0.18em] transition-all flex items-center gap-2.5 ${
                  isSelected
                    ? "bg-white text-black font-bold"
                    : "bg-[#111] text-zinc-400 border border-white/[0.08] hover:text-white hover:border-white/20"
                }`}
              >
                <span>{themeItem.name}</span>
                {themeItem.isPro && (
                  <span
                    className={`text-[9px] px-1 py-0.5 rounded font-mono font-bold tracking-wider ${
                      isSelected
                        ? "bg-black text-amber-300"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    PRO
                  </span>
                )}
                {isSelected && (
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: themeItem.accent === "#E5E5E5" ? "#000" : themeItem.accent }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Dynamic Mockup Viewport Reskinned by Tab */}
        <div
          className={`border transition-all duration-500 p-6 sm:p-10 ${current.bgColor} ${current.borderColor}`}
        >
          {/* Theme Meta Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/[0.08] gap-4 mb-8">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400 block mb-1">
                ACTIVE THEME PROFILE
              </span>
              <div className="flex items-center gap-3">
                <h3 className="font-display text-2xl font-bold uppercase text-white">
                  {current.name} Aesthetic
                </h3>
                <span
                  className="font-mono text-[10px] px-2 py-0.5 uppercase tracking-wider border font-bold"
                  style={{
                    color: current.accent,
                    borderColor: `${current.accent}40`,
                    backgroundColor: `${current.accent}15`,
                  }}
                >
                  {current.badge}
                </span>
              </div>
            </div>
            <p className="font-mono text-xs text-zinc-400 max-w-xs sm:text-right">
              {current.tagline}
            </p>
          </div>

          {/* Reskinned Portfolio Mock Item */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Media Poster with Theme Styling */}
            <div className="lg:col-span-7 relative aspect-video overflow-hidden border border-white/[0.1] bg-black group">
              {/* Static Poster Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                style={{
                  backgroundImage: `url('${THEME_BACKGROUNDS[activeTheme]}')`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Theme-specific Badges */}
              <div className="absolute top-4 left-4 z-10 font-mono text-[10px] px-2 py-1 bg-black/80 border border-white/20 uppercase tracking-widest text-white">
                {current.sampleMeta}
              </div>

              <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between text-xs font-mono text-white/90">
                <span className="truncate">{current.sampleTitle}</span>
                <span style={{ color: current.accent }}>[ VIEW WORK ]</span>
              </div>
            </div>

            {/* Right: Typography & Meta presentation */}
            <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-6">
              <div>
                <span
                  className="font-mono text-xs uppercase tracking-widest block mb-2"
                  style={{ color: current.accent }}
                >
                  {"// SPECIFICATION"}
                </span>
                <h4 className="font-display text-xl sm:text-2xl font-bold uppercase text-white mb-3">
                  {current.sampleTitle}
                </h4>
                <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
                  {current.description}
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/[0.08] font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500 uppercase">Creator Role:</span>
                  <span className="text-white uppercase">{current.sampleRole}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 uppercase">Accent Token:</span>
                  <span className="font-bold" style={{ color: current.accent }}>
                    {current.accent}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 uppercase">Typography:</span>
                  <span className="text-white">Syne + Plus Jakarta Sans + Geist Mono</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
