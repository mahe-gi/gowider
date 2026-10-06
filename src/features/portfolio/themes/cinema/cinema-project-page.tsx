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

export function CinemaProjectPage({
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
      data-testid="cinema-project-page"
      className="min-h-screen bg-[#000000] text-white selection:bg-white selection:text-black"
    >
      <CinemaCursor />

      {/* Header with Back Link */}
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between px-6 py-4 sm:px-10 lg:px-16">
          <Link
            href={`/${profile.username}`}
            className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
          >
            <span className="transition-transform duration-200 group-hover:-translate-x-1">
              ←
            </span>
            <span>BACK TO ARCHIVE</span>
          </Link>

          <span className="font-display text-sm font-bold uppercase tracking-wider text-zinc-400">
            {profile.displayName}
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-[1800px] px-6 sm:px-10 lg:px-16 py-12 sm:py-20 space-y-16 sm:space-y-24">
        {/* Project Header Info */}
        <div className="space-y-6 max-w-4xl">
          <div className="flex items-center gap-4 font-mono text-xs uppercase tracking-widest text-zinc-500">
            <span className="px-2.5 py-1 border border-white/10 bg-white/5 text-zinc-300">
              {project.category}
            </span>
            {project.year && <span>{project.year}</span>}
            {project.client && <span>{"//"} {project.client}</span>}
          </div>

          <h1 className="font-display font-extrabold uppercase text-white leading-[0.95] tracking-[-0.03em] text-[clamp(2.5rem,6vw,5.5rem)]">
            {project.title}
          </h1>
        </div>

        {/* Media Player Stage */}
        <div className="overflow-hidden bg-[#0A0A0A] border border-white/[0.08] shadow-2xl">
          {renderMediaStage()}
        </div>

        {/* Narrative & Metadata Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 border-b border-white/[0.08] pb-20">
          {/* Narrative Text (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
              [ SYNOPSIS & EDITORIAL NOTES ]
            </h2>
            <div className="font-sans text-base sm:text-lg text-zinc-300 leading-relaxed whitespace-pre-line space-y-4">
              {project.description ||
                "No additional editorial notes supplied for this case study."}
            </div>
          </div>

          {/* Metadata Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-8 font-mono text-xs border-t lg:border-t-0 lg:border-l border-white/[0.08] pt-8 lg:pt-0 lg:pl-10">
            <div>
              <span className="uppercase tracking-widest text-zinc-500 block mb-1">
                CATEGORY
              </span>
              <span className="text-zinc-200 uppercase">{project.category}</span>
            </div>

            {project.client && (
              <div>
                <span className="uppercase tracking-widest text-zinc-500 block mb-1">
                  CLIENT
                </span>
                <span className="text-zinc-200">{project.client}</span>
              </div>
            )}

            {project.year && (
              <div>
                <span className="uppercase tracking-widest text-zinc-500 block mb-1">
                  YEAR
                </span>
                <span className="text-zinc-200">{project.year}</span>
              </div>
            )}

            <div>
              <span className="uppercase tracking-widest text-zinc-500 block mb-1">
                MEDIA SOURCE
              </span>
              <span className="text-zinc-200 uppercase">
                {project.sourceType.replace("_", " ")}
              </span>
            </div>

            {project.tools && project.tools.length > 0 && (
              <div>
                <span className="uppercase tracking-widest text-zinc-500 block mb-2">
                  TOOLS & STACK
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {project.tools.map((tool) => (
                    <span
                      key={tool}
                      className="px-2.5 py-1 text-[11px] uppercase tracking-wider text-zinc-300 border border-white/10 bg-white/[0.03]"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Previous / Next Project Navigation Bridge */}
        <nav
          data-testid="project-navigation-bridge"
          aria-label="Project Navigation"
          className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 pb-12"
        >
          {navigation.prev ? (
            <Link
              href={`/${profile.username}/work/${navigation.prev.slug}`}
              className="group flex flex-col space-y-2 p-6 border border-white/[0.08] bg-white/[0.01] hover:bg-white/[0.04] transition-all"
            >
              <span className="font-mono text-xs uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                <span className="transition-transform group-hover:-translate-x-1">←</span>
                <span>PREVIOUS PROJECT</span>
              </span>
              <span className="font-display text-lg sm:text-xl font-bold uppercase text-white group-hover:text-zinc-200">
                {navigation.prev.title}
              </span>
            </Link>
          ) : (
            <div className="hidden sm:block" />
          )}

          {navigation.next ? (
            <Link
              href={`/${profile.username}/work/${navigation.next.slug}`}
              className="group flex flex-col space-y-2 p-6 border border-white/[0.08] bg-white/[0.01] hover:bg-white/[0.04] transition-all text-right sm:items-end"
            >
              <span className="font-mono text-xs uppercase tracking-widest text-zinc-500 flex items-center gap-1.5 justify-end">
                <span>NEXT PROJECT</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </span>
              <span className="font-display text-lg sm:text-xl font-bold uppercase text-white group-hover:text-zinc-200">
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
