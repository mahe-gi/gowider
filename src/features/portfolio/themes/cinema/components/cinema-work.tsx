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

interface CinemaWorkProps {
  projects: PublicProject[];
  username: string;
}

export function CinemaWork({ projects, username }: CinemaWorkProps) {
  if (projects.length === 0) {
    return (
      <section id="work" className="py-20 text-center border-b border-white/[0.08]">
        <p className="font-mono text-sm uppercase tracking-widest text-zinc-500">
          No published projects available yet.
        </p>
      </section>
    );
  }

  return (
    <section id="work" data-testid="cinema-work" className="py-20 sm:py-28 border-b border-white/[0.08]">
      {/* Section Header */}
      <div className="mb-16 sm:mb-24 flex items-baseline justify-between border-b border-white/[0.08] pb-6">
        <h2 className="font-display text-xs font-mono uppercase tracking-[0.25em] text-zinc-400">
          [ SELECTED WORK ]
        </h2>
        <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          {projects.length} {projects.length === 1 ? "PROJECT" : "PROJECTS"}
        </span>
      </div>

      {/* Projects List */}
      <div className="space-y-24 sm:space-y-36">
        {projects.map((project, idx) => {
          const indexStr = String(idx + 1).padStart(2, "0");
          const isEven = idx % 2 === 0;
          const parsed = tryParseMediaUrl(project.sourceUrl);

          const renderMedia = () => {
            if (project.sourceType === "youtube" && parsed?.id) {
              return (
                <YouTubePlayer
                  videoId={parsed.id}
                  title={project.title}
                  posterUrl={project.thumbnailUrl || undefined}
                  fallbackIndex={indexStr}
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
                  index={indexStr}
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
                <div className="flex justify-center bg-black/30 py-4">
                  <InstagramCard
                    url={project.sourceUrl}
                    canonicalUrl={parsed?.canonicalUrl}
                    title={project.title}
                    posterUrl={project.thumbnailUrl || undefined}
                    index={indexStr}
                    category={project.category}
                    client={project.client}
                    year={project.year}
                  />
                </div>
              );
            }

            return (
              <TypographicPoster
                index={indexStr}
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
            <article
              key={project.slug}
              data-testid={`cinema-project-${project.slug}`}
              className={`flex flex-col gap-10 lg:gap-14 ${
                isEven
                  ? "lg:flex-row items-center"
                  : "lg:flex-row-reverse items-center"
              }`}
            >
              {/* Media Frame (60%) */}
              <div className="w-full lg:w-[60%] shrink-0">
                <div className="group relative overflow-hidden bg-[#0A0A0A] border border-white/[0.08] transition-colors duration-300 hover:border-white/20">
                  {renderMedia()}
                </div>
              </div>

              {/* Project Meta & Narrative (40%) */}
              <div className="w-full lg:w-[40%] flex flex-col justify-between space-y-6">
                {/* Index & Category */}
                <div className="flex items-center justify-between font-mono text-xs text-zinc-400">
                  <span className="font-semibold tracking-wider text-white">
                    {"//"} {indexStr}
                  </span>
                  <span className="px-2 py-0.5 border border-white/10 uppercase tracking-widest text-[10px]">
                    {project.category}
                  </span>
                </div>

                {/* Title in Syne */}
                <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-tight text-white leading-tight">
                  <Link
                    href={`/${username}/work/${project.slug}`}
                    className="hover:text-zinc-300 transition-colors"
                  >
                    {project.title}
                  </Link>
                </h3>

                {/* Description snippet if present */}
                {project.description && (
                  <p className="font-sans text-sm sm:text-base text-zinc-400 leading-relaxed line-clamp-3">
                    {project.description}
                  </p>
                )}

                {/* Metadata Details (Client, Year) */}
                {(project.client || project.year) && (
                  <div className="flex items-center gap-4 font-mono text-xs text-zinc-500 uppercase tracking-wider">
                    {project.client && (
                      <div>
                        <span className="text-zinc-600">CLIENT: </span>
                        <span className="text-zinc-300">{project.client}</span>
                      </div>
                    )}
                    {project.client && project.year && <span>/</span>}
                    {project.year && (
                      <div>
                        <span className="text-zinc-600">YEAR: </span>
                        <span className="text-zinc-300">{project.year}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Tool Chips */}
                {project.tools && project.tools.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.tools.map((tool) => (
                      <span
                        key={tool}
                        className="px-2 py-0.5 font-mono text-[10px] tracking-wider text-zinc-400 border border-white/[0.06] bg-white/[0.02]"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                )}

                {/* Project CTA Link */}
                <div className="pt-2">
                  <Link
                    href={`/${username}/work/${project.slug}`}
                    className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-white border-b border-white pb-1 hover:border-zinc-400 hover:text-zinc-400 transition-all"
                  >
                    <span>VIEW PROJECT</span>
                    <span className="transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
