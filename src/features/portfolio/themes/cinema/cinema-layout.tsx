import React from "react";
import Link from "next/link";
import type { PublicPortfolioData } from "../../types";
import { CinemaHero } from "./components/cinema-hero";
import { CinemaShowreel } from "./components/cinema-showreel";
import { CinemaWork } from "./components/cinema-work";
import { CinemaTools } from "./components/cinema-tools";
import { CinemaAbout } from "./components/cinema-about";
import { CinemaFooter } from "./components/cinema-footer";
import { CinemaCursor } from "../../shared/cursor";
import { resolveDisplayTools } from "../../shared/tools";

interface CinemaLayoutProps {
  portfolio: PublicPortfolioData;
}

export function CinemaLayout({ portfolio }: CinemaLayoutProps) {
  const { profile, projects, services, skills, socialLinks, settings } = portfolio;
  const displayTools = resolveDisplayTools(skills, projects);

  return (
    <div
      data-testid="cinema-theme-layout"
      className="relative min-h-screen bg-[#000000] text-white selection:bg-white selection:text-black"
    >
      <CinemaCursor />

      {/* Minimal Header */}
      <header
        data-testid="cinema-header"
        className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-black/80 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-[1800px] items-center justify-between px-6 py-4 sm:px-10 lg:px-16">
          {/* Creator Brand / Name */}
          <Link
            href={`/${profile.username}`}
            className="font-display text-base font-bold uppercase tracking-wider text-white hover:text-zinc-300 transition-colors"
          >
            {profile.displayName}
          </Link>

          {/* Status Dot */}
          <div className="hidden md:flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-zinc-400">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{profile.availability || "Available for Work"}</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-6 sm:gap-8 font-mono text-xs uppercase tracking-widest text-zinc-400">
            <a href="#work" className="hover:text-white transition-colors">
              WORK
            </a>
            {displayTools.length > 0 && (
              <a href="#tools" className="hover:text-white transition-colors">
                TOOLS
              </a>
            )}
            <a href="#about" className="hover:text-white transition-colors">
              ABOUT
            </a>
            <a href="#contact" className="hover:text-white transition-colors">
              CONTACT
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content Sections within Widescreen Container */}
      <main className="mx-auto max-w-[1800px] px-6 sm:px-10 lg:px-16">
        <CinemaHero profile={profile} />
        <CinemaShowreel projects={projects} />
        <CinemaWork projects={projects} username={profile.username} />
        {displayTools.length > 0 && <CinemaTools tools={displayTools} />}
        <CinemaAbout
          profile={profile}
          services={services}
          skills={skills}
        />
        <CinemaFooter
          displayName={profile.displayName}
          username={profile.username}
          socialLinks={socialLinks}
          hideBranding={settings?.hideBranding}
        />
      </main>
    </div>
  );
}
