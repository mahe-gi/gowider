import React from "react";
import Link from "next/link";
import type { PublicPortfolioData } from "../../types";
import { EditorialHero } from "./components/editorial-hero";
import { EditorialIndex } from "./components/editorial-index";
import { EditorialAbout } from "./components/editorial-about";
import { EditorialFooter } from "./components/editorial-footer";

interface EditorialLayoutProps {
  portfolio: PublicPortfolioData;
}

export function EditorialLayout({ portfolio }: EditorialLayoutProps) {
  const { profile, projects, services, skills, socialLinks, settings } = portfolio;

  return (
    <div
      data-testid="editorial-theme-layout"
      className="relative min-h-screen bg-[#080808] text-white selection:bg-[#FF3B30] selection:text-white"
    >
      {/* Editorial Typographic Header */}
      <header
        data-testid="editorial-header"
        className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#080808]/90 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-4 sm:px-10 lg:px-12">
          {/* Creator Brand / Monogram & Name */}
          <Link
            href={`/${profile.username}`}
            className="flex items-center gap-3 group"
          >
            <span className="font-serif italic text-lg sm:text-xl font-normal text-white group-hover:text-[#FF3B30] transition-colors">
              {profile.displayName}
            </span>
            <span className="hidden sm:inline font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
              / ARCHIVE
            </span>
          </Link>

          {/* Status Badge */}
          <div className="hidden md:flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-zinc-400">
            <span className="inline-block h-2 w-2 rounded-full bg-[#FF3B30] animate-pulse" />
            <span className="text-zinc-300">
              {profile.availability || "Available for Work"}
            </span>
          </div>

          {/* Navigation Anchors */}
          <nav className="flex items-center gap-6 sm:gap-8 font-mono text-xs uppercase tracking-widest text-zinc-400">
            <a
              href="#index"
              className="hover:text-[#FF3B30] transition-colors"
            >
              INDEX
            </a>
            <a
              href="#about"
              className="hover:text-[#FF3B30] transition-colors"
            >
              ABOUT
            </a>
            <a
              href="#contact"
              className="hover:text-[#FF3B30] transition-colors"
            >
              CONTACT
            </a>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-12">
        <EditorialHero profile={profile} />
        <EditorialIndex projects={projects} username={profile.username} />
        <EditorialAbout
          profile={profile}
          services={services}
          skills={skills}
        />
        <EditorialFooter
          displayName={profile.displayName}
          username={profile.username}
          socialLinks={socialLinks}
          hideBranding={settings?.hideBranding}
        />
      </main>
    </div>
  );
}
