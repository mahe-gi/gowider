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

export function NoirProjectPage({
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
        <div className="flex justify-center bg-black/60 py-8 border border-white/[0.08]">
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
        aspectRatio="auto"
        className="w-full aspect-[2.39/1]"
      />
    );
  };

  return (
    <div
      data-testid="noir-project-page"
      className="min-h-screen bg-[#050505] text-white selection:bg-amber-400 selection:text-black flex flex-col justify-between"
    >
      <CinemaCursor />

      <div>
        {/* Navigation Bar */}
        <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#050505]/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-[1800px] items-center justify-between px-6 py-4 sm:px-10 lg:px-16">
            <Link
              href={`/${profile.username}`}
              className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-zinc-400 hover:text-amber-300 transition-colors"
            >
              <span>←</span>
              <span>[ BACK TO WORK ]</span>
            </Link>

            <span className="font-mono text-xs uppercase tracking-widest text-amber-400/80">
              {profile.displayName}
            </span>
          </div>
        </header>

        {/* Main Stage */}
        <main className="mx-auto max-w-[1800px] px-6 py-12 sm:px-10 sm:py-16 lg:px-16 space-y-12">
          {/* Header */}
          <div className="space-y-4 border-b border-white/[0.08] pb-8">
            <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs uppercase tracking-widest text-zinc-400">
              <div className="flex items-center gap-3">
                <span className="text-amber-400 font-semibold">[{project.category}]</span>
              </div>
              <div className="flex items-center gap-4">
                {project.year && <span>YEAR: {project.year}</span>}
                {project.client && <span className="text-zinc-300">CLIENT: {project.client}</span>}
              </div>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white">
              {project.title}
            </h1>
          </div>

          {/* Video Player Stage */}
          <div className="relative overflow-hidden border border-white/[0.08] bg-black shadow-2xl">
            {renderMediaStage()}
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-4">
            <div className="lg:col-span-8 space-y-6">
              <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-amber-400">
                [ ABOUT THIS PROJECT ]
              </h2>
              {project.description ? (
                <div className="font-sans text-base sm:text-lg text-zinc-300 leading-relaxed whitespace-pre-line">
                  {project.description}
                </div>
              ) : (
                <p className="font-mono text-sm text-zinc-500 uppercase tracking-wider">
                  No description provided.
                </p>
              )}
            </div>

            <div className="lg:col-span-4 space-y-8">
              {project.tools.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-mono text-xs uppercase tracking-widest text-zinc-400 border-b border-white/[0.06] pb-2">
                    TOOLS &amp; SOFTWARE
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tools.map((tool) => (
                      <span
                        key={tool}
                        className="font-mono text-xs border border-white/[0.08] bg-zinc-950 px-3 py-1.5 text-zinc-300 uppercase tracking-wider"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="border border-white/[0.08] bg-zinc-950/60 p-5 space-y-2">
                <span className="font-mono text-[10px] text-amber-400 uppercase tracking-widest block">
                  SCOPE SPECIFICATION
                </span>
                <p className="font-mono text-xs text-zinc-400 leading-relaxed">
                  2.39:1 Anamorphic DCI mastering with high-fidelity color grading and pristine timecode synchronization.
                </p>
              </div>
            </div>
          </div>

          {/* Sequential Bridge (Prev / Next Projects) */}
          <div
            data-testid="project-navigation-bridge"
            className="border-t border-white/[0.08] pt-12 flex flex-col sm:flex-row items-center justify-between gap-6"
          >
            {navigation.prev ? (
              <Link
                href={`/${profile.username}/work/${navigation.prev.slug}`}
                className="group flex flex-col items-start font-mono text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition"
              >
                <span className="text-[10px] text-zinc-600 group-hover:text-amber-400">← PREVIOUS ROLL</span>
                <span className="text-sm font-semibold text-white mt-1 group-hover:underline">
                  {navigation.prev.title}
                </span>
              </Link>
            ) : (
              <div />
            )}

            {navigation.next ? (
              <Link
                href={`/${profile.username}/work/${navigation.next.slug}`}
                className="group flex flex-col items-end font-mono text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition"
              >
                <span className="text-[10px] text-zinc-600 group-hover:text-amber-400">NEXT ROLL →</span>
                <span className="text-sm font-semibold text-white mt-1 group-hover:underline">
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
      <footer className="border-t border-white/[0.06] py-8 px-6 sm:px-10 lg:px-16 text-center">
        {!settings?.hideBranding ? (
          <Link
            href="/"
            className="font-mono text-xs tracking-wider text-zinc-500 hover:text-zinc-300 transition"
          >
            POWERED BY GOWIDER <span className="text-amber-400/80">[PRO]</span>
          </Link>
        ) : (
          <span />
        )}
      </footer>
    </div>
  );
}
