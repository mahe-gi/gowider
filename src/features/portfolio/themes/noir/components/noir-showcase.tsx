import React from "react";
import Link from "next/link";
import type { PublicProject } from "../../../types";
import {
  YouTubePlayer,
  DrivePlayer,
  InstagramCard,
  TypographicPoster,
  tryParseMediaUrl,
} from "@/features/media";

interface NoirShowcaseProps {
  projects: PublicProject[];
  username: string;
}

export function NoirShowcase({ projects, username }: NoirShowcaseProps) {
  if (projects.length === 0) {
    return (
      <section id="repertoire" className="py-24 text-center border-b border-white/[0.08]">
        <p className="font-mono text-sm uppercase tracking-widest text-zinc-500">
          [ ARCHIVE EMPTY // NO PUBLISHED WORKS RECORDED ]
        </p>
      </section>
    );
  }

  return (
    <section
      id="repertoire"
      data-testid="noir-showcase"
      className="py-20 sm:py-32 border-b border-white/[0.08]"
    >
      {/* Scope Header */}
      <div className="mb-16 sm:mb-24 flex items-baseline justify-between border-b border-white/[0.08] pb-6">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-300">
            [ SELECTED WORK // 2.39:1 WIDESCREEN ]
          </h2>
        </div>
        <span className="font-mono text-xs uppercase tracking-widest text-amber-500/70">
          {projects.length} {projects.length === 1 ? "PROJECT" : "PROJECTS"}
        </span>
      </div>

      {/* Projects in 2.39:1 Anamorphic Framing */}
      <div className="space-y-28 sm:space-y-40">
        {projects.map((project, idx) => {
          const rollIndex = String(idx + 1).padStart(2, "0");
          const parsed = tryParseMediaUrl(project.sourceUrl);

          const renderMedia = () => {
            if (project.sourceType === "youtube" && parsed?.id) {
              return (
                <YouTubePlayer
                  videoId={parsed.id}
                  title={project.title}
                  posterUrl={project.thumbnailUrl || undefined}
                  fallbackIndex={rollIndex}
                  category={project.category}
                  client={project.client}
                  year={project.year}
                  className="w-full"
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
                  index={rollIndex}
                  category={project.category}
                  client={project.client}
                  year={project.year}
                  autoLoadOnIntersect={false}
                  className="w-full"
                />
              );
            }

            if (project.sourceType === "instagram") {
              return (
                <div className="flex justify-center bg-black/60 py-8 border border-white/[0.06]">
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
                index={rollIndex}
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
            <article
              key={project.slug}
              data-testid={`noir-project-${project.slug}`}
              className="space-y-6 group"
            >
              {/* Clapperboard Metadata Ribbon */}
              <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] text-zinc-500 uppercase tracking-widest border-b border-white/[0.04] pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-amber-400 font-semibold">[ROLL {rollIndex}]</span>
                  <span>TC: 01:{(idx * 14).toString().padStart(2, "0")}:22:08</span>
                  <span className="hidden sm:inline">FORMAT: DCI 4K SCOPE</span>
                </div>
                <div className="flex items-center gap-4">
                  {project.client && (
                    <span className="text-zinc-300">CLIENT: {project.client}</span>
                  )}
                  {project.year && <span>{project.year}</span>}
                </div>
              </div>

              {/* Anamorphic Framing Box with Top/Bottom Film Letterbox Curtains */}
              <div className="relative overflow-hidden rounded-none border border-white/[0.08] bg-black shadow-2xl transition-all duration-500 group-hover:border-amber-500/40">
                {/* 2.39:1 Letterbox Visual Container */}
                <div className="w-full">
                  {renderMedia()}
                </div>
              </div>

              {/* Lower Info & Directorial Link */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pt-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs uppercase text-amber-500 tracking-wider">
                      {project.category}
                    </span>
                    {project.featured && (
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-amber-500/40 bg-amber-500/10 text-amber-300 uppercase">
                        MASTER CUT
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl font-extrabold uppercase text-white tracking-tight">
                    {project.title}
                  </h3>
                  {project.description && (
                    <p className="max-w-2xl text-sm text-zinc-400 leading-relaxed pt-1">
                      {project.description}
                    </p>
                  )}
                </div>

                <Link
                  href={`/${username}/work/${project.slug}`}
                  className="font-mono text-xs uppercase tracking-widest text-zinc-400 hover:text-amber-300 transition-colors inline-flex items-center gap-1.5 shrink-0 self-start sm:self-auto py-2"
                >
                  <span>[ PRODUCTION BREAKDOWN ]</span>
                  <span>↗</span>
                </Link>
              </div>

              {/* Tools & Camera Package Tags */}
              {project.tools.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {project.tools.map((tool) => (
                    <span
                      key={tool}
                      className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 border border-white/[0.06] bg-zinc-950 px-2.5 py-1"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
