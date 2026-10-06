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

interface CyberShowcaseProps {
  projects: PublicProject[];
  username: string;
}

export function CyberShowcase({ projects, username }: CyberShowcaseProps) {
  if (projects.length === 0) {
    return (
      <section id="telemetry" className="py-24 text-center border-b border-emerald-500/20">
        <p className="font-mono text-sm uppercase tracking-widest text-zinc-500">
          [ NO ACTIVE GPU NODES DETECTED IN PIPELINE ]
        </p>
      </section>
    );
  }

  return (
    <section
      id="telemetry"
      data-testid="cyber-showcase"
      className="py-20 sm:py-32 border-b border-emerald-500/20"
    >
      {/* Telemetry Index Header */}
      <div className="mb-16 sm:mb-24 flex items-baseline justify-between border-b border-emerald-500/20 pb-6">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-none bg-[#00FF88] shadow-[0_0_8px_#00FF88]" />
          <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-[#00FF88]">
            [ GPU COMPUTE PIPELINE // TELEMETRY NODES ]
          </h2>
        </div>
        <span className="font-mono text-xs uppercase tracking-widest text-cyan-400">
          {projects.length} {projects.length === 1 ? "NODE ACTIVE" : "NODES ACTIVE"}
        </span>
      </div>

      {/* Grid of Dense VFX / Motion Nodes */}
      <div className="space-y-28 sm:space-y-36">
        {projects.map((project, idx) => {
          const nodeIndex = String(idx + 1).padStart(2, "0");
          const parsed = tryParseMediaUrl(project.sourceUrl);

          const renderMedia = () => {
            if (project.sourceType === "youtube" && parsed?.id) {
              return (
                <YouTubePlayer
                  videoId={parsed.id}
                  title={project.title}
                  posterUrl={project.thumbnailUrl || undefined}
                  fallbackIndex={nodeIndex}
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
                  index={nodeIndex}
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
                <div className="flex justify-center bg-black/80 py-8 border border-emerald-500/20">
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
                index={nodeIndex}
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
              data-testid={`cyber-project-${project.slug}`}
              className="space-y-6 group"
            >
              {/* Telemetry Ribbon */}
              <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] text-zinc-400 uppercase tracking-widest border-b border-emerald-500/20 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-[#00FF88] font-bold">[NODE_ID: 0x{nodeIndex}]</span>
                  <span>TC: 01:{(idx * 16).toString().padStart(2, "0")}:44:12</span>
                  <span className="hidden sm:inline">RENDER_ENGINE: GPU_OCTANE</span>
                </div>
                <div className="flex items-center gap-4 text-zinc-500">
                  {project.client && (
                    <span className="text-cyan-400">CLIENT: {project.client}</span>
                  )}
                  {project.year && <span>{project.year}</span>}
                </div>
              </div>

              {/* Cyber Container with Crosshair Corners */}
              <div className="relative overflow-hidden border border-emerald-500/30 bg-black shadow-[0_0_20px_rgba(0,0,0,0.8)] transition-all duration-500 group-hover:border-[#00FF88] group-hover:shadow-[0_0_25px_rgba(0,255,136,0.15)]">
                {/* Corner crosshairs */}
                <div className="absolute top-1 left-1 font-mono text-[9px] text-emerald-500/50 z-10">+</div>
                <div className="absolute top-1 right-1 font-mono text-[9px] text-emerald-500/50 z-10">+</div>
                <div className="absolute bottom-1 left-1 font-mono text-[9px] text-emerald-500/50 z-10">+</div>
                <div className="absolute bottom-1 right-1 font-mono text-[9px] text-emerald-500/50 z-10">+</div>

                <div className="w-full overflow-hidden bg-black">
                  {renderMedia()}
                </div>
              </div>

              {/* Project Info & Telemetry Link */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-6 pt-2 font-mono">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs uppercase text-emerald-400 tracking-wider">
                      {project.category}
                    </span>
                    {project.featured && (
                      <span className="text-[10px] px-2 py-0.5 border border-[#00FF88]/50 bg-emerald-950/40 text-[#00FF88] uppercase">
                        PRIMARY BUFFER
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold uppercase text-white tracking-wide">
                    {project.title}
                  </h3>
                  {project.description && (
                    <p className="max-w-2xl text-xs sm:text-sm text-zinc-400 leading-relaxed pt-1">
                      {project.description}
                    </p>
                  )}
                </div>

                <Link
                  href={`/${username}/work/${project.slug}`}
                  className="text-xs uppercase tracking-widest text-[#00FF88] hover:text-white transition-colors inline-flex items-center gap-1.5 shrink-0 self-start sm:self-auto py-2"
                >
                  <span>[ ACCESS PIPELINE TELEMETRY ]</span>
                  <span>↗</span>
                </Link>
              </div>

              {/* Render Toolkit / Shaders */}
              {project.tools.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {project.tools.map((tool) => (
                    <span
                      key={tool}
                      className="font-mono text-[10px] uppercase tracking-wider text-cyan-300 border border-cyan-500/30 bg-cyan-950/20 px-2.5 py-1"
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
