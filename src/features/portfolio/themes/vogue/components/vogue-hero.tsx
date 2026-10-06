import React from "react";
import type { PublicProfile } from "../../../types";

interface VogueHeroProps {
  profile: PublicProfile;
}

export function VogueHero({ profile }: VogueHeroProps) {
  return (
    <section
      data-testid="vogue-hero"
      className="relative flex flex-col justify-end pt-24 pb-14 sm:pt-36 sm:pb-20 border-b border-white/[0.1] overflow-hidden"
    >
      {/* Luxury champagne ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 -top-28 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(212,175,55,0.06),rgba(0,0,0,0))]"
        aria-hidden="true"
      />

      <div className="relative z-10 space-y-10">
        {/* Magazine Masthead Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs uppercase tracking-[0.25em] text-stone-400 border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <span className="text-amber-200/90 font-serif italic text-sm">Vol. XXVI</span>
            <span>{"//"}</span>
            <span>AUTEUR PORTFOLIO</span>
          </div>

          <div className="flex items-center gap-4 text-stone-400">
            {profile.location && <span>{profile.location}</span>}
            <span className="rounded bg-stone-800/80 px-2 py-0.5 text-[10px] text-amber-200 font-mono tracking-widest">
              PRO STUDIO
            </span>
          </div>
        </div>

        {/* Dramatic Editorial Serif Headline */}
        <div className="space-y-3">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-stone-500 block">
            PORTFOLIO OF DIRECTION
          </span>
          <h1
            data-testid="vogue-hero-headline"
            className="font-serif italic text-white leading-[0.88] tracking-tight select-none text-[clamp(3.5rem,11vw,9.5rem)]"
          >
            {profile.displayName}
          </h1>
        </div>

        {/* Headline Statement */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 pt-4">
          <p className="max-w-2xl font-sans text-lg sm:text-xl md:text-2xl font-light text-stone-300 tracking-tight leading-relaxed">
            {profile.headline}
          </p>

          <a
            href="#repertoire"
            className="group inline-flex items-center gap-2 self-start font-mono text-xs uppercase tracking-[0.2em] text-amber-200/80 hover:text-white transition-colors"
          >
            <span>DISCOVER WORKS</span>
            <span className="transition-transform duration-300 group-hover:translate-y-1">
              ↓
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
