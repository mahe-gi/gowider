import React from "react";
import Link from "next/link";
import type { PublicPortfolioData } from "../../types";
import { StudioHero } from "./components/studio-hero";
import { StudioShowcase } from "./components/studio-showcase";
import { StudioAbout } from "./components/studio-about";
import { StudioFooter } from "./components/studio-footer";

interface StudioLayoutProps {
  portfolio: PublicPortfolioData;
}

export function StudioLayout({ portfolio }: StudioLayoutProps) {
  const { profile, projects, services, skills, socialLinks } = portfolio;

  return (
    <div
      data-testid="studio-theme-layout"
      className="relative min-h-screen bg-[#0C0C0C] text-white selection:bg-[#2997FF] selection:text-black"
    >
      {/* Grid-Aligned Technical Header */}
      <header
        data-testid="studio-header"
        className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#0C0C0C]/90 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4 sm:px-10 lg:px-16">
          {/* Studio Brand */}
          <Link
            href={`/${profile.username}`}
            className="flex items-center gap-3 font-display text-sm sm:text-base font-bold uppercase tracking-wider text-white hover:text-[#2997FF] transition-colors"
          >
            <span className="font-mono text-xs text-[#2997FF]">[STUDIO]</span>
            <span>{profile.displayName}</span>
          </Link>

          {/* Live Status Dot Indicator */}
          <div className="hidden md:flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-zinc-400">
            <span className="inline-block h-2 w-2 rounded-full bg-[#2997FF] animate-pulse" />
            <span className="text-zinc-300">
              {profile.availability || "STUDIO ONLINE"}
            </span>
          </div>

          {/* Navigation Anchors */}
          <nav className="flex items-center gap-6 sm:gap-8 font-mono text-xs uppercase tracking-widest text-zinc-400">
            <a
              href="#showcase"
              className="hover:text-[#2997FF] transition-colors"
            >
              SHOWCASE
            </a>
            <a
              href="#about"
              className="hover:text-[#2997FF] transition-colors"
            >
              CAPABILITIES
            </a>
            <a
              href="#contact"
              className="hover:text-[#2997FF] transition-colors"
            >
              TRANSMIT
            </a>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-[1600px] px-6 sm:px-10 lg:px-16">
        <StudioHero profile={profile} />
        <StudioShowcase projects={projects} username={profile.username} />
        <StudioAbout
          profile={profile}
          services={services}
          skills={skills}
        />
        <StudioFooter
          displayName={profile.displayName}
          username={profile.username}
          socialLinks={socialLinks}
        />
      </main>
    </div>
  );
}
