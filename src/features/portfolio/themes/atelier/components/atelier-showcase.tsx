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

interface AtelierShowcaseProps {
  projects: PublicProject[];
  username: string;
}

export function AtelierShowcase({ projects, username }: AtelierShowcaseProps) {
  if (projects.length === 0) {
    return (
      <section id="exhibitions" className="py-24 text-center border-b border-[#292524]/60">
        <p className="font-mono text-sm uppercase tracking-widest text-[#78716C]">
          No works documented in this exhibition.
        </p>
      </section>
    );
  }

  return (
    <section
      id="exhibitions"
      data-testid="atelier-showcase"
      className="py-20 sm:py-32 border-b border-[#292524]/60"
    >
      {/* Exhibition Section Header */}
      <div className="mb-16 sm:mb-24 flex items-baseline justify-between border-b border-[#292524]/60 pb-6">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-none bg-[#D6D3CD]" />
          <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-[#D6D3CD]">
            SELECTED EXHIBITION WORKS
          </h2>
        </div>
        <span className="font-mono text-xs uppercase tracking-widest text-[#78716C]">
          {projects.length} {projects.length === 1 ? "PLAQUE" : "PLAQUES"} RECORDED
        </span>
      </div>

      {/* Museum Plaque Exhibition Works */}
      <div className="space-y-28 sm:space-y-36">
        {projects.map((project, idx) => {
          const plaqueIndex = String(idx + 1).padStart(2, "0");
          const parsed = tryParseMediaUrl(project.sourceUrl);

          const renderMedia = () => {
            if (project.sourceType === "youtube" && parsed?.id) {
              return (
                <YouTubePlayer
                  videoId={parsed.id}
                  title={project.title}
                  posterUrl={project.thumbnailUrl || undefined}
                  fallbackIndex={plaqueIndex}
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
                  index={plaqueIndex}
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
                index={plaqueIndex}
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
              data-testid={`atelier-project-${project.slug}`}
              className="space-y-6 group"
            >
              {/* Museum Catalogue Plaque Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] text-[#A8A29E] uppercase tracking-widest border-b border-[#292524]/40 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-[#F5F5F4] font-semibold">[EXHIBITION N° {plaqueIndex}]</span>
                  <span>CATALOGUE ID: ATL-{plaqueIndex}</span>
                  <span className="hidden sm:inline">MEDIUM: MOVING IMAGE</span>
                </div>
                <div className="flex items-center gap-4 text-[#78716C]">
                  {project.client && (
                    <span className="text-[#D6D3CD]">COMMISSION: {project.client}</span>
                  )}
                  {project.year && <span>{project.year}</span>}
                </div>
              </div>

              {/* Museum Framing Stage */}
              <div className="relative overflow-hidden border border-[#292524] bg-[#141210] p-2 sm:p-4 shadow-xl transition-all duration-500 group-hover:border-[#78716C]">
                <div className="w-full overflow-hidden bg-black">
                  {renderMedia()}
                </div>
              </div>

              {/* Plaque Metadata & Curatorial Link */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-6 pt-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs uppercase text-[#A8A29E] tracking-wider">
                      {project.category}
                    </span>
                    {project.featured && (
                      <span className="font-mono text-[10px] px-2 py-0.5 border border-[#78716C]/60 bg-[#1C1917] text-[#F5F5F4] uppercase">
                        MASTERWORK
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif text-3xl sm:text-4xl font-normal text-[#F5F5F4] tracking-tight">
                    {project.title}
                  </h3>
                  {project.description && (
                    <p className="max-w-2xl font-serif text-base text-[#D6D3CD]/80 leading-relaxed italic pt-1">
                      {project.description}
                    </p>
                  )}
                </div>

                <Link
                  href={`/${username}/work/${project.slug}`}
                  className="font-mono text-xs uppercase tracking-widest text-[#A8A29E] hover:text-[#F5F5F4] transition-colors inline-flex items-center gap-1.5 shrink-0 self-start sm:self-auto py-2"
                >
                  <span>[ CURATORIAL ESSAY ]</span>
                  <span>↗</span>
                </Link>
              </div>

              {/* Archival Medium & Palette Tags */}
              {project.tools.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {project.tools.map((tool) => (
                    <span
                      key={tool}
                      className="font-mono text-[10px] uppercase tracking-wider text-[#A8A29E] border border-[#292524] bg-[#171513] px-2.5 py-1"
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
