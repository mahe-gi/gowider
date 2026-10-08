import React from "react";
import Link from "next/link";
import type { PublicPortfolioData } from "../../types";
import { NoirHero } from "./components/noir-hero";
import { NoirShowcase } from "./components/noir-showcase";
import { NoirAbout } from "./components/noir-about";
import { NoirFooter } from "./components/noir-footer";
import { CinemaCursor } from "../../shared/cursor";

interface NoirLayoutProps {
  portfolio: PublicPortfolioData;
}

export function NoirLayout({ portfolio }: NoirLayoutProps) {
  const { profile, projects, services, skills, socialLinks, settings } = portfolio;

  return (
    <div
      data-testid="noir-theme-layout"
      className="relative min-h-screen bg-[#050505] text-white selection:bg-amber-400 selection:text-black"
    >
      <CinemaCursor />

      {/* Top 2.39:1 Anamorphic Technical Header */}
      <header
        data-testid="noir-header"
        className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#050505]/90 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-[1800px] items-center justify-between px-6 py-4 sm:px-10 lg:px-16">
          {/* Creator Brand / Slate Header */}
          <Link
            href={`/${profile.username}`}
            className="flex items-center gap-3 font-display text-base font-bold uppercase tracking-wider text-white hover:text-amber-300 transition-colors"
          >
            <span className="font-mono text-xs text-amber-400 font-semibold">[2.39:1 NOIR]</span>
            <span>{profile.displayName}</span>
          </Link>

          {/* Status Dot */}
          <div className="hidden md:flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-zinc-400">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span>{profile.availability || "AVAILABLE FOR WORK"}</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-6 sm:gap-8 font-mono text-xs uppercase tracking-widest text-zinc-400">
            <a href="#repertoire" className="hover:text-amber-300 transition-colors">
              WORK
            </a>
            <a href="#practice" className="hover:text-amber-300 transition-colors">
              ABOUT
            </a>
            <a href="#contact" className="hover:text-amber-300 transition-colors">
              CONTACT
            </a>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-[1800px] px-6 sm:px-10 lg:px-16">
        <NoirHero profile={profile} />
        <NoirShowcase projects={projects} username={profile.username} />
        <NoirAbout
          profile={profile}
          services={services}
          skills={skills}
        />
        <NoirFooter
          displayName={profile.displayName}
          username={profile.username}
          socialLinks={socialLinks}
          hideBranding={settings?.hideBranding}
        />
      </main>
    </div>
  );
}
