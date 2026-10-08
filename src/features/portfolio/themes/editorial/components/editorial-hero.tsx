import React from "react";
import type { PublicProfile } from "../../../types";

interface EditorialHeroProps {
  profile: PublicProfile;
}

export function EditorialHero({ profile }: EditorialHeroProps) {
  return (
    <section
      data-testid="editorial-hero"
      className="relative pt-20 pb-16 sm:pt-28 sm:pb-24 border-b border-white/[0.08]"
    >
      {/* Subtle vermillion ambient glow at top */}
      <div
        className="pointer-events-none absolute inset-0 -top-24 bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,rgba(255,59,48,0.06),rgba(0,0,0,0))]"
        aria-hidden="true"
      />

      <div className="relative z-10 space-y-10">
        {/* Meta Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs uppercase tracking-widest text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-[#FF3B30] animate-pulse" />
            <span className="text-zinc-300">
              {profile.availability || "Available for Work"}
            </span>
          </div>

          <div className="flex items-center gap-6 text-zinc-500">
            {profile.location && (
              <div>
                <span>LOCATION: </span>
                <span className="text-zinc-300">{profile.location}</span>
              </div>
            )}
            <span className="hidden sm:inline font-mono text-zinc-700">{"//"}</span>
            <span className="hidden sm:inline text-zinc-400 font-mono">
              EDITION {new Date().getFullYear()}
            </span>
          </div>
        </div>

        {/* Dramatic Editorial Headline */}
        <div className="space-y-4">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#FF3B30] block">
            PORTFOLIO
          </span>
          <h1
            data-testid="editorial-hero-headline"
            className="font-serif italic font-normal text-white leading-[0.88] tracking-[-0.03em] select-none text-[clamp(3rem,9vw,8rem)]"
          >
            {profile.displayName}
          </h1>
        </div>

        {/* Contrast Sans Headline & Sub-meta */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 pt-4 border-t border-white/[0.06]">
          <p className="max-w-2xl font-sans text-xl sm:text-2xl md:text-3xl font-light text-zinc-200 tracking-tight leading-relaxed">
            {profile.headline}
          </p>

          <a
            href="#index"
            className="group inline-flex items-center gap-2.5 self-start font-mono text-xs uppercase tracking-widest text-zinc-400 hover:text-[#FF3B30] transition-colors"
          >
            <span>VIEW WORK</span>
            <span className="transition-transform duration-300 group-hover:translate-y-1 text-[#FF3B30]">
              ↓
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
