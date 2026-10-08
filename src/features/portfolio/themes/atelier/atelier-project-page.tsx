import React from "react";
import Link from "next/link";
import type { PublicProjectDetail } from "../../types";
import {
  YouTubePlayer,
  DrivePlayer,
  InstagramCard,
  TypographicPoster,
  tryParseMediaUrl,
} from "@/features/media";
import { CinemaCursor } from "../../shared/cursor";

export function AtelierProjectPage({
  project,
  profile,
  settings,
  navigation,
}: PublicProjectDetail) {
  const parsed = tryParseMediaUrl(project.sourceUrl);

  const renderMediaStage = () => {
    if (project.sourceType === "youtube" && parsed?.id) {
      return (
        <YouTubePlayer
          videoId={parsed.id}
          title={project.title}
          posterUrl={project.thumbnailUrl || undefined}
          fallbackIndex="01"
          category={project.category}
          client={project.client}
          year={project.year}
          className="w-full aspect-video"
        />
      );
    }

    if (project.sourceType === "google_drive") {
      return (
        <DrivePlayer
          url={project.sourceUrl}
          fileId={parsed?.id}
          canonicalUrl={parsed?.canonicalUrl}
          title={project.title}
          posterUrl={project.thumbnailUrl || undefined}
          index="01"
          category={project.category}
          client={project.client}
          year={project.year}
          autoLoadOnIntersect={false}
          className="w-full aspect-video"
        />
      );
    }

    if (project.sourceType === "instagram") {
      return (
        <div className="flex justify-center bg-black/60 py-8 border border-[#292524]/40">
          <InstagramCard
            url={project.sourceUrl}
            canonicalUrl={parsed?.canonicalUrl}
            title={project.title}
          />
        </div>
      );
    }

    return (
      <TypographicPoster
        index="01"
        title={project.title}
        category={project.category}
        client={project.client}
        year={project.year}
        aspectRatio="16/9"
        className="w-full"
      />
    );
  };

  return (
    <div
      data-testid="atelier-project-page"
      className="relative min-h-screen bg-[#0C0B0A] text-[#E7E5E4] selection:bg-[#E7E5E4] selection:text-[#0C0B0A]"
    >
      <CinemaCursor />

      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-[#292524]/80 bg-[#0C0B0A]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1700px] items-center justify-between px-6 py-4 sm:px-10 lg:px-16">
          <Link
            href={`/${profile.username}`}
            className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#A8A29E] hover:text-[#F5F5F4] transition-colors"
          >
            <span>← BACK TO WORK</span>
          </Link>

          <Link
            href={`/${profile.username}`}
            className="font-serif text-base text-[#F5F5F4] tracking-tight hover:text-[#D6D3CD] transition-colors"
          >
            {profile.displayName}
          </Link>
        </div>
      </header>

      {/* Main Breakdown Stage */}
      <div className="mx-auto max-w-[1700px] px-6 sm:px-10 lg:px-16 py-12 sm:py-20">
        <main className="space-y-16">
          {/* Work Heading */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-[#A8A29E]">
              <span className="text-[#D6D3CD] font-medium">{project.category}</span>
              {project.year && <span>{"//"} {project.year}</span>}
              {project.client && <span>{"//"} CLIENT: {project.client}</span>}
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal text-[#F5F5F4] tracking-[-0.02em] leading-tight">
              {project.title}
            </h1>
          </div>

          {/* Media Player Framing */}
          <div className="overflow-hidden border border-[#292524] bg-[#141210] p-2 sm:p-5 shadow-2xl">
            <div className="w-full overflow-hidden bg-black">
              {renderMediaStage()}
            </div>
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-6 border-t border-[#292524]/60">
            <div className="lg:col-span-8 space-y-6">
              <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-[#A8A29E]">
                ABOUT THIS PROJECT
              </h2>
              <div className="font-serif text-lg sm:text-xl text-[#D6D3CD] leading-relaxed italic">
                {project.description || "No description provided."}
              </div>
            </div>

            <div className="lg:col-span-4 space-y-8 font-mono text-xs">
              <div className="border border-[#292524] bg-[#141210] p-6 space-y-6">
                <h3 className="uppercase tracking-[0.2em] text-[#A8A29E] border-b border-[#292524] pb-2">
                  PROJECT DETAILS
                </h3>

                <div className="space-y-3">
                  <div>
                    <span className="text-[#78716C] block uppercase tracking-wider text-[10px]">CATEGORY</span>
                    <span className="text-[#F5F5F4]">{project.category}</span>
                  </div>

                  {project.client && (
                    <div>
                      <span className="text-[#78716C] block uppercase tracking-wider text-[10px]">CLIENT</span>
                      <span className="text-[#F5F5F4]">{project.client}</span>
                    </div>
                  )}

                  {project.year && (
                    <div>
                      <span className="text-[#78716C] block uppercase tracking-wider text-[10px]">YEAR</span>
                      <span className="text-[#F5F5F4]">{project.year}</span>
                    </div>
                  )}

                  {project.tools.length > 0 && (
                    <div>
                      <span className="text-[#78716C] block uppercase tracking-wider text-[10px] mb-1.5">TOOLS USED</span>
                      <div className="flex flex-wrap gap-1.5">
                        {project.tools.map((tool) => (
                          <span
                            key={tool}
                            className="border border-[#292524] bg-[#1C1917] px-2 py-0.5 text-[10px] text-[#D6D3CD]"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sequential Bridge (Prev / Next Works) */}
          <div
            data-testid="project-navigation-bridge"
            className="border-t border-[#292524]/60 pt-12 flex flex-col sm:flex-row items-center justify-between gap-6"
          >
            {navigation.prev ? (
              <Link
                href={`/${profile.username}/work/${navigation.prev.slug}`}
                className="group flex flex-col items-start font-mono text-xs uppercase tracking-widest text-[#A8A29E] hover:text-[#F5F5F4] transition"
              >
                <span className="text-[10px] text-[#78716C] group-hover:text-[#D6D3CD]">← PREVIOUS EXHIBITION</span>
                <span className="font-serif text-lg text-[#F5F5F4] mt-1 group-hover:underline">
                  {navigation.prev.title}
                </span>
              </Link>
            ) : (
              <div />
            )}

            {navigation.next ? (
              <Link
                href={`/${profile.username}/work/${navigation.next.slug}`}
                className="group flex flex-col items-end font-mono text-xs uppercase tracking-widest text-[#A8A29E] hover:text-[#F5F5F4] transition"
              >
                <span className="text-[10px] text-[#78716C] group-hover:text-[#D6D3CD]">NEXT EXHIBITION →</span>
                <span className="font-serif text-lg text-[#F5F5F4] mt-1 group-hover:underline">
                  {navigation.next.title}
                </span>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </main>
      </div>

      {/* Footer Sub-bar */}
      <footer className="border-t border-[#292524]/40 py-8 px-6 sm:px-10 lg:px-16 text-center">
        {!settings?.hideBranding ? (
          <Link
            href="/"
            className="font-mono text-xs tracking-wider text-[#78716C] hover:text-[#A8A29E] transition"
          >
            POWERED BY GOWIDER <span className="text-[#D6D3CD]">[PRO]</span>
          </Link>
        ) : (
          <span />
        )}
      </footer>
    </div>
  );
}
