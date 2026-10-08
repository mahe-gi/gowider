import React from "react";
import Link from "next/link";
import type { PublicPortfolioData } from "../../types";
import { CyberHero } from "./components/cyber-hero";
import { CyberShowcase } from "./components/cyber-showcase";
import { CyberAbout } from "./components/cyber-about";
import { CyberFooter } from "./components/cyber-footer";
import { CinemaCursor } from "../../shared/cursor";

interface CyberLayoutProps {
  portfolio: PublicPortfolioData;
}

export function CyberLayout({ portfolio }: CyberLayoutProps) {
  const { profile, projects, services, skills, socialLinks, settings } = portfolio;

  return (
    <div
      data-testid="cyber-theme-layout"
      className="relative min-h-screen bg-[#030712] text-zinc-100 selection:bg-[#00FF88] selection:text-black"
    >
      <CinemaCursor />

      {/* Cyber HUD Terminal Header */}
      <header
        data-testid="cyber-header"
        className="sticky top-0 z-40 w-full border-b border-emerald-500/20 bg-[#030712]/90 backdrop-blur-md font-mono"
      >
        <div className="mx-auto flex max-w-[1700px] items-center justify-between px-6 py-4 sm:px-10 lg:px-16">
          {/* Node Monogram / Title */}
          <Link
            href={`/${profile.username}`}
            className="flex items-center gap-3 text-base font-bold uppercase tracking-wider text-white hover:text-[#00FF88] transition-colors"
          >
            <span className="text-xs text-[#00FF88]">[CYBER // HUD]</span>
            <span>{profile.displayName}</span>
          </Link>

          {/* Status Indicator */}
          <div className="hidden md:flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-400">
            <span className="inline-block h-2 w-2 rounded-none bg-[#00FF88] animate-pulse" />
            <span>{profile.availability || "AVAILABLE FOR WORK"}</span>
          </div>

          {/* Navigation Links + CTA Button */}
          <nav className="flex items-center gap-6 sm:gap-8 text-xs uppercase tracking-widest text-zinc-400">
            <a href="#telemetry" className="hover:text-[#00FF88] transition-colors">
              WORK
            </a>
            <a href="#pipeline" className="hover:text-[#00FF88] transition-colors">
              ABOUT
            </a>
            <a href="#contact" className="hover:text-[#00FF88] transition-colors">
              CONTACT
            </a>
            {settings?.cta?.enabled && (
              <a
                href={settings.cta.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00FF88] text-black font-bold tracking-wider hover:bg-[#33ff9f] transition"
              >
                <span>{settings.cta.label}</span>
                <span>↗</span>
              </a>
            )}
          </nav>
        </div>
      </header>

      {/* Main Telemetry Container */}
      <main className="mx-auto max-w-[1700px] px-6 sm:px-10 lg:px-16">
        <CyberHero
          profile={profile}
          spotlightProject={settings?.spotlightProject}
          cta={settings?.cta}
        />
        <CyberShowcase projects={projects} username={profile.username} />
        <CyberAbout
          profile={profile}
          services={services}
          skills={skills}
        />
        <CyberFooter
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
