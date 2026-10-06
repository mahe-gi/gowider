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

export function VogueProjectPage({
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
        <div className="flex justify-center bg-stone-950 py-8 border border-white/[0.08]">
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
        className="w-full h-auto"
      />
    );
  };

  return (
    <div
      data-testid="vogue-project-page"
      className="min-h-screen bg-[#070707] text-[#FAFAFA] selection:bg-[#EFE3C3] selection:text-black flex flex-col justify-between font-sans"
    >
      <div>
        <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#070707]/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-4 sm:px-10 lg:px-16">
            <Link
              href={`/${profile.username}`}
              className="font-mono text-xs uppercase tracking-[0.2em] text-stone-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <span>←</span>
              <span>Back to Lookbook</span>
            </Link>

            <span className="font-serif italic text-sm text-amber-200">
              {profile.displayName}
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] px-6 py-12 sm:px-10 sm:py-20 lg:px-16 space-y-12">
          {/* Header */}
          <div className="space-y-4 border-b border-white/[0.08] pb-8">
            <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-stone-400">
              <span className="uppercase tracking-widest">{project.category}</span>
              {project.client && (
                <span className="uppercase tracking-widest">
                  COMMISSIONED BY {project.client}
                </span>
              )}
            </div>

            <h1 className="font-serif italic text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight">
              {project.title}
            </h1>
          </div>

          {/* Media Player Stage */}
          <div className="overflow-hidden border border-white/[0.08] bg-black shadow-2xl">
            {renderMediaStage()}
          </div>

          {/* Description & Tools */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-4">
            <div className="lg:col-span-8 space-y-6">
              <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-amber-200/90">
                Editorial Note
              </h2>
              {project.description ? (
                <div className="font-serif italic text-lg sm:text-xl text-stone-300 leading-relaxed whitespace-pre-line">
                  {project.description}
                </div>
              ) : (
                <p className="font-mono text-sm text-stone-500 uppercase">
                  No additional editorial notes archived.
                </p>
              )}
            </div>

            <div className="lg:col-span-4 space-y-6">
              {project.tools.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-mono text-xs uppercase tracking-widest text-stone-400 border-b border-white/[0.06] pb-2">
                    Production Palette
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tools.map((tool) => (
                      <span
                        key={tool}
                        className="font-mono text-xs border border-white/[0.08] bg-stone-950 px-3 py-1.5 text-stone-300 uppercase tracking-wider"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sequential Bridge */}
          <div
            data-testid="project-navigation-bridge"
            className="border-t border-white/[0.08] pt-12 flex flex-col sm:flex-row items-center justify-between gap-6"
          >
            {navigation.prev ? (
              <Link
                href={`/${profile.username}/work/${navigation.prev.slug}`}
                className="group flex flex-col items-start font-mono text-xs uppercase tracking-widest text-stone-400 hover:text-white transition"
              >
                <span className="text-[10px] text-stone-600 group-hover:text-amber-200">← PREVIOUS LOOK</span>
                <span className="font-serif italic text-base text-white mt-1 group-hover:underline">
                  {navigation.prev.title}
                </span>
              </Link>
            ) : (
              <div />
            )}

            {navigation.next ? (
              <Link
                href={`/${profile.username}/work/${navigation.next.slug}`}
                className="group flex flex-col items-end font-mono text-xs uppercase tracking-widest text-stone-400 hover:text-white transition"
              >
                <span className="text-[10px] text-stone-600 group-hover:text-amber-200">NEXT LOOK →</span>
                <span className="font-serif italic text-base text-white mt-1 group-hover:underline">
                  {navigation.next.title}
                </span>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </main>
      </div>

      <footer className="border-t border-white/[0.06] py-8 px-6 sm:px-10 lg:px-16 text-center">
        {!settings?.hideBranding ? (
          <Link
            href="/"
            className="font-mono text-xs tracking-wider text-stone-500 hover:text-stone-300 transition"
          >
            POWERED BY GOWIDER <span className="text-amber-200/60">[PRO]</span>
          </Link>
        ) : (
          <span />
        )}
      </footer>
    </div>
  );
}
