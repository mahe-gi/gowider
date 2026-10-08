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

export function StudioProjectPage({
  project,
  profile,
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
        <div className="flex justify-center bg-black/40 py-8">
          <InstagramCard
            url={project.sourceUrl}
            canonicalUrl={parsed?.canonicalUrl}
            title={project.title}
            posterUrl={project.thumbnailUrl || undefined}
            index="01"
            category={project.category}
            client={project.client}
            year={project.year}
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
        className="w-full aspect-video"
      />
    );
  };

  return (
    <div
      data-testid="studio-project-page"
      className="min-h-screen bg-[#0C0C0C] text-white selection:bg-[#2997FF] selection:text-black"
    >
      {/* Studio Header with Telemetry Back Link */}
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#0C0C0C]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4 sm:px-10 lg:px-16">
          <Link
            href={`/${profile.username}`}
            className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-zinc-400 hover:text-[#2997FF] transition-colors"
          >
            <span className="transition-transform duration-200 group-hover:-translate-x-1 text-[#2997FF]">
              ←
            </span>
            <span>BACK TO WORK</span>
          </Link>

          <div className="flex items-center gap-3 font-mono text-xs text-zinc-400">
            <span className="text-[#2997FF]">[STUDIO]</span>
            <span className="font-semibold text-white uppercase">
              {profile.displayName}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-[1600px] px-6 sm:px-10 lg:px-16 py-12 sm:py-20 space-y-16 sm:space-y-20">
        {/* Project Header Info */}
        <div className="space-y-6 max-w-4xl">
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-wider text-zinc-400">
            <span className="px-2.5 py-1 border border-[#2997FF]/30 bg-[#2997FF]/10 text-[#2997FF] font-semibold">
              {project.category}
            </span>
            {project.year && (
              <span className="px-2 py-0.5 border border-white/10 bg-white/[0.02]">
                {project.year}
              </span>
            )}
            {project.client && (
              <span className="text-zinc-400">
                CLIENT: <span className="text-zinc-200">{project.client}</span>
              </span>
            )}
          </div>

          <h1 className="font-display font-extrabold uppercase text-white leading-[0.92] tracking-[-0.03em] text-[clamp(2.5rem,6vw,5.5rem)]">
            {project.title}
          </h1>
        </div>

        {/* Media Player Stage */}
        <div className="overflow-hidden bg-[#0A0A0A] border border-white/[0.12] shadow-2xl relative">
          <div className="absolute top-2 right-2 z-10 font-mono text-[9px] px-2 py-0.5 bg-black/80 text-[#2997FF] border border-[#2997FF]/30 uppercase">
            {project.category}
          </div>
          {renderMediaStage()}
        </div>

        {/* Narrative & Details Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 border-b border-white/[0.08] pb-16">
          {/* Narrative Breakdown (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-[#2997FF]">
              [ ABOUT THIS PROJECT ]
            </h2>
            <div className="font-sans text-base sm:text-lg text-zinc-300 leading-relaxed whitespace-pre-line space-y-4">
              {project.description ||
                "No description provided."}
            </div>
          </div>

          {/* Project Details & Tools Used (5 cols) */}
          <div className="lg:col-span-5 space-y-8 border-t lg:border-t-0 lg:border-l border-white/[0.08] pt-8 lg:pt-0 lg:pl-10">
            <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-400">
              [ PROJECT DETAILS ]
            </h2>

            <div className="space-y-4 font-mono text-xs">
              <div className="flex justify-between border-b border-white/[0.06] pb-2">
                <span className="text-zinc-500 uppercase">CATEGORY:</span>
                <span className="text-zinc-200 uppercase">{project.category}</span>
              </div>

              {project.client && (
                <div className="flex justify-between border-b border-white/[0.06] pb-2">
                  <span className="text-zinc-500 uppercase">CLIENT:</span>
                  <span className="text-zinc-200">{project.client}</span>
                </div>
              )}

              {project.year && (
                <div className="flex justify-between border-b border-white/[0.06] pb-2">
                  <span className="text-zinc-500 uppercase">YEAR:</span>
                  <span className="text-zinc-200">{project.year}</span>
                </div>
              )}

              <div className="flex justify-between border-b border-white/[0.06] pb-2">
                <span className="text-zinc-500 uppercase">SOURCE PROVIDER:</span>
                <span className="text-[#2997FF] uppercase">{project.sourceType.replace("_", " ")}</span>
              </div>

              {project.tools && project.tools.length > 0 && (
                <div className="pt-2 space-y-2">
                  <span className="text-zinc-500 uppercase block">
                    PRODUCTION TOOLS & PIPELINE:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {project.tools.map((tool) => (
                      <span
                        key={tool}
                        className="px-2.5 py-1 text-[11px] uppercase tracking-wider text-zinc-200 border border-[#2997FF]/20 bg-[#2997FF]/5"
                      >
                        <span className="text-[#2997FF] mr-1">▪</span>
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Previous / Next Project Navigation Bridge */}
        <nav
          data-testid="project-navigation-bridge"
          aria-label="Project Navigation"
          className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4 pb-12"
        >
          {navigation.prev ? (
            <Link
              href={`/${profile.username}/work/${navigation.prev.slug}`}
              className="group flex flex-col space-y-2 p-6 border border-white/[0.08] bg-[#0E0E0E] hover:border-[#2997FF]/50 transition-all"
            >
              <span className="font-mono text-xs uppercase tracking-widest text-zinc-500 flex items-center gap-1.5 group-hover:text-[#2997FF] transition-colors">
                <span className="transition-transform group-hover:-translate-x-1">
                  ←
                </span>
                <span>PREVIOUS REEL</span>
              </span>
              <span className="font-display text-lg sm:text-xl font-bold uppercase text-white group-hover:text-[#2997FF]">
                {navigation.prev.title}
              </span>
            </Link>
          ) : (
            <div className="hidden sm:block" />
          )}

          {navigation.next ? (
            <Link
              href={`/${profile.username}/work/${navigation.next.slug}`}
              className="group flex flex-col space-y-2 p-6 border border-white/[0.08] bg-[#0E0E0E] hover:border-[#2997FF]/50 transition-all text-right sm:items-end"
            >
              <span className="font-mono text-xs uppercase tracking-widest text-zinc-500 flex items-center gap-1.5 justify-end group-hover:text-[#2997FF] transition-colors">
                <span>NEXT REEL</span>
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </span>
              <span className="font-display text-lg sm:text-xl font-bold uppercase text-white group-hover:text-[#2997FF]">
                {navigation.next.title}
              </span>
            </Link>
          ) : (
            <div className="hidden sm:block" />
          )}
        </nav>
      </main>
    </div>
  );
}
