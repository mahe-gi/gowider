import React from "react";
import Link from "next/link";
import type { PublicPortfolioData } from "../../types";
import { AtelierHero } from "./components/atelier-hero";
import { AtelierShowcase } from "./components/atelier-showcase";
import { AtelierAbout } from "./components/atelier-about";
import { AtelierFooter } from "./components/atelier-footer";
import { CinemaCursor } from "../../shared/cursor";

interface AtelierLayoutProps {
  portfolio: PublicPortfolioData;
}

export function AtelierLayout({ portfolio }: AtelierLayoutProps) {
  const { profile, projects, services, skills, socialLinks, settings } = portfolio;

  return (
    <div
      data-testid="atelier-theme-layout"
      className="relative min-h-screen bg-[#0C0B0A] text-[#E7E5E4] selection:bg-[#E7E5E4] selection:text-[#0C0B0A]"
    >
      <CinemaCursor />

      {/* Travertine Archival Header */}
      <header
        data-testid="atelier-header"
        className="sticky top-0 z-40 w-full border-b border-[#292524]/80 bg-[#0C0B0A]/90 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-[1700px] items-center justify-between px-6 py-4 sm:px-10 lg:px-16">
          {/* Artist Monogram / Name */}
          <Link
            href={`/${profile.username}`}
            className="flex items-center gap-3 font-serif text-lg tracking-tight text-[#F5F5F4] hover:text-[#D6D3CD] transition-colors"
          >
            <span className="font-mono text-xs text-[#A8A29E] tracking-widest">[ATELIER]</span>
            <span className="font-medium">{profile.displayName}</span>
          </Link>

          {/* Exhibition Status Indicator */}
          <div className="hidden md:flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#A8A29E]">
            <span className="inline-block h-2 w-2 rounded-none bg-[#D6D3CD]" />
            <span>{profile.availability || "ATELIER ACTIVE"}</span>
          </div>

          {/* Navigation Links + CTA Button */}
          <nav className="flex items-center gap-6 sm:gap-8 font-mono text-xs uppercase tracking-widest text-[#A8A29E]">
            <a href="#exhibitions" className="hover:text-[#F5F5F4] transition-colors">
              WORKS
            </a>
            <a href="#practice" className="hover:text-[#F5F5F4] transition-colors">
              STATEMENT
            </a>
            <a href="#contact" className="hover:text-[#F5F5F4] transition-colors">
              INQUIRE
            </a>
            {settings?.cta?.enabled && (
              <a
                href={settings.cta.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E7E5E4] text-[#0C0A09] font-semibold tracking-wider hover:bg-[#F5F5F4] transition"
              >
                <span>{settings.cta.label}</span>
                <span>↗</span>
              </a>
            )}
          </nav>
        </div>
      </header>

      {/* Main Exhibition Container */}
      <main className="mx-auto max-w-[1700px] px-6 sm:px-10 lg:px-16">
        <AtelierHero
          profile={profile}
          spotlightProject={settings?.spotlightProject}
          cta={settings?.cta}
        />
        <AtelierShowcase projects={projects} username={profile.username} />
        <AtelierAbout
          profile={profile}
          services={services}
          skills={skills}
        />
        <AtelierFooter
          displayName={profile.displayName}
          username={profile.username}
          socialLinks={socialLinks}
          hideBranding={settings?.hideBranding}
          cta={settings?.cta}
        />
      </main>
    </div>
  );
}
