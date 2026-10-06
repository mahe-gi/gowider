import React from "react";
import type { PublicProfile } from "../../../types";

interface NoirHeroProps {
  profile: PublicProfile;
}

export function NoirHero({ profile }: NoirHeroProps) {
  return (
    <section
      data-testid="noir-hero"
      className="relative flex flex-col justify-end pt-24 pb-12 sm:pt-36 sm:pb-16 border-b border-white/[0.08] overflow-hidden"
    >
      {/* Darkroom anamorphic glow background */}
      <div
        className="pointer-events-none absolute inset-0 -top-32 bg-[radial-gradient(ellipse_90%_40%_at_50%_0%,rgba(217,119,6,0.08),rgba(0,0,0,0))]"
        aria-hidden="true"
      />

      {/* Subtle 2.39:1 aspect ratio guide lines */}
      <div className="absolute top-8 left-0 right-0 flex justify-between px-6 sm:px-12 text-[10px] font-mono text-amber-500/40 select-none tracking-widest pointer-events-none">
        <span>FRAME: 2.39:1 SCOPE</span>
        <span>OPTICS: ANAMORPHIC PRIME T1.5</span>
        <span className="hidden sm:inline">FPS: 24.000 // SHUTTER: 180°</span>
      </div>

      <div className="relative z-10 space-y-8 pt-8">
        {/* Production Slate Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs uppercase tracking-widest text-zinc-400">
          <div className="flex items-center gap-2.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
            <span className="text-amber-400/90 font-semibold">
              {profile.availability || "AVAILABLE FOR DIRECTORIAL COMMISSIONS"}
            </span>
          </div>

          <div className="flex items-center gap-4 text-zinc-500">
            {profile.location && (
              <div>
                <span>BASE: </span>
                <span className="text-zinc-300">{profile.location}</span>
              </div>
            )}
            <span className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-300 font-mono">
              PRO ARCHIVE
            </span>
          </div>
        </div>

        {/* Oversized Cinematic Display Headline */}
        <h1
          data-testid="noir-hero-headline"
          className="font-display font-black uppercase text-white leading-[0.88] tracking-[-0.04em] select-none text-[clamp(3.5rem,11vw,9.5rem)] text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-500"
        >
          {profile.displayName}
        </h1>

        {/* Headline / Statement */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-2">
          <p className="max-w-2xl font-sans text-lg sm:text-xl md:text-2xl font-light text-zinc-300 tracking-tight leading-relaxed">
            {profile.headline}
          </p>

          <a
            href="#repertoire"
            className="group inline-flex items-center gap-2 self-start font-mono text-xs uppercase tracking-widest text-amber-400/80 hover:text-amber-300 transition-colors"
          >
            <span>[ VIEW REPERTOIRE ]</span>
            <span className="transition-transform duration-300 group-hover:translate-y-1">
              ↓
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
