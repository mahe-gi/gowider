import React from "react";
import type { PublicProfile } from "../../../types";

interface StudioHeroProps {
  profile: PublicProfile;
}

export function StudioHero({ profile }: StudioHeroProps) {
  return (
    <section
      data-testid="studio-hero"
      className="relative pt-20 pb-16 sm:pt-28 sm:pb-20 border-b border-white/[0.08]"
    >
      {/* Background Subtle Technical Grid / Ambient Cyan Glow */}
      <div
        className="pointer-events-none absolute inset-0 -top-24 bg-[radial-gradient(ellipse_70%_40%_at_50%_-10%,rgba(41,151,255,0.07),rgba(0,0,0,0))]"
        aria-hidden="true"
      />

      <div className="relative z-10 space-y-10">
        {/* Technical Sub-bar / Telemetry */}
        <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs uppercase tracking-widest text-zinc-400">
          <div className="flex items-center gap-2.5">
            <span className="inline-block h-2 w-2 rounded-full bg-[#2997FF] animate-pulse" />
            <span className="text-zinc-200">
              {profile.availability || "STUDIO ACTIVE // AVAILABLE FOR BOOKING"}
            </span>
          </div>

          <div className="flex items-center gap-6 font-mono text-[11px] text-zinc-500">
            {profile.location && (
              <div>
                <span>COORDINATES: </span>
                <span className="text-zinc-300">{profile.location}</span>
              </div>
            )}
            <span className="hidden sm:inline text-zinc-700">|</span>
            <span className="hidden sm:inline text-[#2997FF]/80">
              SPEC: 4K UHD / DCI COLOR
            </span>
          </div>
        </div>

        {/* Studio Technical Title in 12-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8 space-y-3">
            <div className="font-mono text-xs uppercase tracking-[0.25em] text-[#2997FF] flex items-center gap-2">
              <span>[ STUDIO IDENTITY ]</span>
            </div>
            <h1
              data-testid="studio-hero-headline"
              className="font-display font-extrabold uppercase text-white leading-[0.88] tracking-[-0.04em] select-none text-[clamp(3rem,8.5vw,7.5rem)]"
            >
              {profile.displayName}
            </h1>
          </div>

          {/* Technical Index Metric (4 cols) */}
          <div className="lg:col-span-4 border-l border-white/[0.08] pl-6 space-y-2 font-mono text-xs text-zinc-400">
            <div className="text-[#2997FF] font-semibold">PRACTICE DOMAIN:</div>
            <p className="font-sans text-sm text-zinc-300 leading-snug">
              {profile.headline}
            </p>
          </div>
        </div>

        {/* Bottom Bar: Action & Anchor */}
        <div className="pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-4 font-mono text-xs uppercase tracking-wider text-zinc-400">
          <span className="text-zinc-500 text-[11px]">
            POST-PRODUCTION // MOTION DESIGN // DIRECTION
          </span>

          <a
            href="#showcase"
            className="group inline-flex items-center gap-2 text-zinc-300 hover:text-[#2997FF] transition-colors"
          >
            <span>EXPLORE SHOWCASE</span>
            <span className="transition-transform duration-300 group-hover:translate-y-1 text-[#2997FF]">
              ↓
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
