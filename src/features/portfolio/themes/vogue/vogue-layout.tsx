import React from "react";
import Link from "next/link";
import type { PublicPortfolioData } from "../../types";
import { VogueHero } from "./components/vogue-hero";
import { VogueShowcase } from "./components/vogue-showcase";
import { VogueAbout } from "./components/vogue-about";
import { VogueFooter } from "./components/vogue-footer";

interface VogueLayoutProps {
  portfolio: PublicPortfolioData;
}

export function VogueLayout({ portfolio }: VogueLayoutProps) {
  const { profile, projects, services, skills, socialLinks, settings } = portfolio;

  return (
    <div
      data-testid="vogue-theme-layout"
      className="relative min-h-screen bg-[#070707] text-[#FAFAFA] selection:bg-[#EFE3C3] selection:text-black font-sans"
    >
      {/* Header */}
      <header
        data-testid="vogue-header"
        className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#070707]/90 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-4 sm:px-10 lg:px-16">
          <Link
            href={`/${profile.username}`}
            className="font-serif italic text-base sm:text-lg font-normal text-white hover:text-amber-200 transition-colors"
          >
            {profile.displayName}
          </Link>

          <div className="hidden md:flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-stone-400">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-200 animate-pulse" />
            <span>{profile.availability || "AVAILABLE FOR WORK"}</span>
          </div>

          <nav className="flex items-center gap-6 sm:gap-8 font-mono text-xs uppercase tracking-widest text-stone-400">
            <a href="#repertoire" className="hover:text-amber-200 transition-colors">
              WORK
            </a>
            <a href="#profile" className="hover:text-amber-200 transition-colors">
              ABOUT
            </a>
            <a href="#contact" className="hover:text-amber-200 transition-colors">
              CONTACT
            </a>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-[1500px] px-6 sm:px-10 lg:px-16">
        <VogueHero profile={profile} />
        <VogueShowcase projects={projects} username={profile.username} />
        <VogueAbout
          profile={profile}
          services={services}
          skills={skills}
        />
        <VogueFooter
          displayName={profile.displayName}
          username={profile.username}
          socialLinks={socialLinks}
          hideBranding={settings?.hideBranding}
        />
      </main>
    </div>
  );
}
