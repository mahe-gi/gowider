import React from "react";
import type { PublicProfile } from "../../../types";

interface CinemaHeroProps {
  profile: PublicProfile;
}

export function CinemaHero({ profile }: CinemaHeroProps) {
  return (
    <section
      data-testid="cinema-hero"
      className="relative flex flex-col justify-end pt-24 pb-12 sm:pt-32 sm:pb-16 border-b border-white/[0.08]"
    >
      {/* Background ambient lighting */}
      <div
        className="pointer-events-none absolute inset-0 -top-24 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))]"
        aria-hidden="true"
      />

      <div className="relative z-10 space-y-8">
        {/* Headline Label / Sub-bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs uppercase tracking-widest text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{profile.availability || "Available for Select Commissions"}</span>
          </div>
          {profile.location && (
            <div className="text-zinc-500">
              <span>LOCATION: </span>
              <span className="text-zinc-300">{profile.location}</span>
            </div>
          )}
        </div>

        {/* Oversized Syne Display Title */}
        <h1
          data-testid="cinema-hero-headline"
          className="font-display font-extrabold uppercase text-white leading-[0.88] tracking-[-0.04em] select-none text-[clamp(3.5rem,10vw,9rem)]"
        >
          {profile.displayName}
        </h1>

        {/* Headline / Role & Tagline */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-2">
          <p className="max-w-2xl font-sans text-lg sm:text-xl md:text-2xl font-light text-zinc-300 tracking-tight leading-relaxed">
            {profile.headline}
          </p>

          <a
            href="#work"
            className="group inline-flex items-center gap-2 self-start font-mono text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
          >
            <span>SELECTED WORKS</span>
            <span className="transition-transform duration-300 group-hover:translate-y-1">
              ↓
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
