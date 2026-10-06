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

export function EditorialProjectPage({
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
      data-testid="editorial-project-page"
      className="min-h-screen bg-[#080808] text-white selection:bg-[#FF3B30] selection:text-white"
    >
      {/* Editorial Header with Back Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#080808]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-4 sm:px-10 lg:px-12">
          <Link
            href={`/${profile.username}`}
            className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-zinc-400 hover:text-[#FF3B30] transition-colors"
          >
            <span className="transition-transform duration-200 group-hover:-translate-x-1 text-[#FF3B30]">
              ←
            </span>
            <span>BACK TO ARCHIVE</span>
          </Link>

          <span className="font-serif italic text-base text-zinc-300">
            {profile.displayName}
          </span>
        </div>
      </header>

      {/* Main Reading Container */}
      <main className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-12 py-12 sm:py-20 space-y-16 sm:space-y-20">
        {/* Project Header Title */}
        <div className="space-y-4 max-w-4xl">
          <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-zinc-500">
            <span className="text-[#FF3B30] font-semibold">{project.category}</span>
            {project.year && <span>• {project.year}</span>}
            {project.client && <span>• {project.client}</span>}
          </div>

          <h1 className="font-serif italic text-white leading-[0.95] tracking-tight text-[clamp(2.5rem,5.5vw,5rem)]">
            {project.title}
          </h1>
        </div>

        {/* Prominent Media Player Stage */}
        <div className="overflow-hidden bg-[#0A0A0A] border border-white/[0.10] shadow-2xl">
          {renderMediaStage()}
        </div>

        {/* Narrative & Credits Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 border-b border-white/[0.08] pb-16">
          {/* Narrative Writeup (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-[#FF3B30]">
              [ SYNOPSIS & EDITORIAL NOTES ]
            </h2>
            <div className="font-sans text-base sm:text-lg text-zinc-200 leading-relaxed whitespace-pre-line space-y-4">
              {project.description ||
                "No editorial notes recorded for this piece."}
            </div>
          </div>

          {/* Editorial Credits Table (5 cols) */}
          <div className="lg:col-span-5 space-y-6 border-t lg:border-t-0 lg:border-l border-white/[0.08] pt-8 lg:pt-0 lg:pl-10">
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400">
              [ PRODUCTION CREDITS ]
            </h2>

            <table className="w-full text-left font-mono text-xs border-collapse">
              <tbody className="divide-y divide-white/[0.06]">
                <tr>
                  <td className="py-2.5 uppercase tracking-wider text-zinc-500 w-36">
                    CATEGORY
                  </td>
                  <td className="py-2.5 text-zinc-200 uppercase">
                    {project.category}
                  </td>
                </tr>

                {project.client && (
                  <tr>
                    <td className="py-2.5 uppercase tracking-wider text-zinc-500">
                      CLIENT
                    </td>
                    <td className="py-2.5 text-zinc-200">{project.client}</td>
                  </tr>
                )}

                {project.year && (
                  <tr>
                    <td className="py-2.5 uppercase tracking-wider text-zinc-500">
                      YEAR
                    </td>
                    <td className="py-2.5 text-zinc-200">{project.year}</td>
                  </tr>
                )}

                <tr>
                  <td className="py-2.5 uppercase tracking-wider text-zinc-500">
                    SOURCE
                  </td>
                  <td className="py-2.5 text-zinc-200 uppercase">
                    {project.sourceType.replace("_", " ")}
                  </td>
                </tr>

                {project.tools && project.tools.length > 0 && (
                  <tr>
                    <td className="py-2.5 uppercase tracking-wider text-zinc-500 align-top">
                      TOOLS & STACK
                    </td>
                    <td className="py-2.5 text-zinc-200">
                      <div className="flex flex-wrap gap-1.5">
                        {project.tools.map((tool) => (
                          <span
                            key={tool}
                            className="px-2 py-0.5 text-[11px] uppercase tracking-wider text-zinc-300 border border-white/10 bg-white/[0.03]"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
              className="group flex flex-col space-y-2 p-6 border border-white/[0.08] bg-white/[0.01] hover:bg-white/[0.03] transition-all"
            >
              <span className="font-mono text-xs uppercase tracking-widest text-zinc-500 flex items-center gap-1.5 group-hover:text-[#FF3B30] transition-colors">
                <span className="transition-transform group-hover:-translate-x-1">
                  ←
                </span>
                <span>PREVIOUS</span>
              </span>
              <span className="font-serif italic text-lg sm:text-xl text-white group-hover:text-zinc-200">
                {navigation.prev.title}
              </span>
            </Link>
          ) : (
            <div className="hidden sm:block" />
          )}

          {navigation.next ? (
            <Link
              href={`/${profile.username}/work/${navigation.next.slug}`}
              className="group flex flex-col space-y-2 p-6 border border-white/[0.08] bg-white/[0.01] hover:bg-white/[0.03] transition-all text-right sm:items-end"
            >
              <span className="font-mono text-xs uppercase tracking-widest text-zinc-500 flex items-center gap-1.5 justify-end group-hover:text-[#FF3B30] transition-colors">
                <span>NEXT</span>
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </span>
              <span className="font-serif italic text-lg sm:text-xl text-white group-hover:text-zinc-200">
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
