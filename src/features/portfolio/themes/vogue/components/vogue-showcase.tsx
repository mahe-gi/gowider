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

interface VogueShowcaseProps {
  projects: PublicProject[];
  username: string;
}

const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

export function VogueShowcase({ projects, username }: VogueShowcaseProps) {
  if (projects.length === 0) {
    return (
      <section id="repertoire" className="py-24 text-center border-b border-white/[0.08]">
        <p className="font-mono text-sm uppercase tracking-widest text-stone-500">
          No works documented in this issue.
        </p>
      </section>
    );
  }

  return (
    <section
      id="repertoire"
      data-testid="vogue-showcase"
      className="py-20 sm:py-32 border-b border-white/[0.08]"
    >
      {/* Editorial Header */}
      <div className="mb-20 sm:mb-28 flex items-baseline justify-between border-b border-white/[0.08] pb-6">
        <h2 className="font-serif italic text-base sm:text-lg text-amber-200/90 tracking-wide">
          Selected Visual Archive
        </h2>
        <span className="font-mono text-xs uppercase tracking-widest text-stone-500">
          {projects.length} Works
        </span>
      </div>

      {/* Staggered Editorial Works */}
      <div className="space-y-32 sm:space-y-48">
        {projects.map((project, idx) => {
          const roman = ROMAN_NUMERALS[idx] || String(idx + 1);
          const parsed = tryParseMediaUrl(project.sourceUrl);
          const isOffset = idx % 2 === 1;

          const renderMedia = () => {
            if (project.sourceType === "youtube" && parsed?.id) {
              return (
                <YouTubePlayer
                  videoId={parsed.id}
                  title={project.title}
                  posterUrl={project.thumbnailUrl || undefined}
                  fallbackIndex={String(idx + 1).padStart(2, "0")}
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
                  index={String(idx + 1).padStart(2, "0")}
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
                index={String(idx + 1).padStart(2, "0")}
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
            <article
              key={project.slug}
              data-testid={`vogue-project-${project.slug}`}
              className={`space-y-6 ${isOffset ? "lg:ml-auto lg:max-w-4xl" : "lg:mr-auto lg:max-w-4xl"}`}
            >
              {/* Lookbook Plate Caption */}
              <div className="flex items-baseline justify-between border-b border-white/[0.06] pb-3 text-xs font-mono text-stone-400">
                <div className="flex items-center gap-3">
                  <span className="font-serif italic text-sm text-amber-200">{roman}.</span>
                  <span className="uppercase tracking-widest">{project.category}</span>
                </div>
                {project.client && (
                  <span className="text-stone-300 uppercase tracking-widest">
                    FOR {project.client}
                  </span>
                )}
              </div>

              {/* Video Showcase Stage */}
              <div className="overflow-hidden border border-white/[0.08] bg-black shadow-2xl transition-all duration-700 hover:border-amber-200/40">
                {renderMedia()}
              </div>

              {/* Editorial Typography & Metadata */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pt-2">
                <div>
                  <h3 className="font-serif italic text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight">
                    {project.title}
                  </h3>
                  {project.description && (
                    <p className="max-w-2xl text-sm font-sans text-stone-400 leading-relaxed pt-2">
                      {project.description}
                    </p>
                  )}
                </div>

                <Link
                  href={`/${username}/work/${project.slug}`}
                  className="font-mono text-xs uppercase tracking-[0.2em] text-amber-200/90 hover:text-white transition-colors shrink-0 self-start sm:self-auto py-2 inline-flex items-center gap-2"
                >
                  <span>VIEW LOOK</span>
                  <span>→</span>
                </Link>
              </div>

              {/* Tools Tags */}
              {project.tools.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1 font-mono text-[10px] text-stone-500">
                  {project.tools.map((t) => (
                    <span key={t} className="border border-white/[0.06] px-2.5 py-1 uppercase">
                      {t}
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
