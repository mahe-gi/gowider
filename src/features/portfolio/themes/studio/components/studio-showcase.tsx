"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { PublicProject } from "../../../types";
import {
  YouTubePlayer,
  DrivePlayer,
  InstagramCard,
  TypographicPoster,
  tryParseMediaUrl,
} from "@/features/media";

interface StudioShowcaseProps {
  projects: PublicProject[];
  username: string;
}

export function StudioShowcase({ projects, username }: StudioShowcaseProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Extract unique categories across all projects
  const categories = [
    "ALL",
    ...Array.from(new Set(projects.map((p) => p.category))).filter(Boolean),
  ];

  const filteredProjects =
    selectedCategory === "ALL"
      ? projects
      : projects.filter((p) => p.category === selectedCategory);

  if (projects.length === 0) {
    return (
      <section
        id="showcase"
        data-testid="studio-showcase"
        className="py-24 text-center border-b border-white/[0.08]"
      >
        <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          No projects available in the studio showcase.
        </p>
      </section>
    );
  }

  return (
    <section
      id="showcase"
      data-testid="studio-showcase"
      className="py-16 sm:py-24 border-b border-white/[0.08]"
    >
      {/* Showcase Header & Category Filter Chips */}
      <div className="mb-12 space-y-6">
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div className="flex items-center gap-3">
            <span className="inline-block h-2 w-2 rounded-full bg-[#2997FF]" />
            <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-300">
              [ SELECTED WORK ]
            </h2>
          </div>
          <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
            {filteredProjects.length} / {projects.length} PROJECTS
          </span>
        </div>

        {/* Filter Chips */}
        {categories.length > 2 && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-500 mr-2">
              FILTER:
            </span>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 font-mono text-xs uppercase tracking-wider transition-all rounded-none border ${
                    isSelected
                      ? "border-[#2997FF] bg-[#2997FF]/15 text-[#2997FF] font-semibold"
                      : "border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2-column & 3-column Structured Media Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.map((project, idx) => {
          const indexStr = String(idx + 1).padStart(2, "0");
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
                  index={indexStr}
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
                <div className="flex justify-center bg-black/40 py-4">
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
                className="w-full aspect-video"
              />
            );
          };

          return (
            <article
              key={project.slug}
              data-testid={`studio-card-${project.slug}`}
              className="group flex flex-col justify-between border border-white/[0.08] bg-[#0F0F0F] hover:border-[#2997FF]/50 transition-all duration-300"
            >
              {/* Media Player Frame */}
              <div className="relative overflow-hidden bg-black border-b border-white/[0.08]">
                {renderMedia()}

                {/* Electric Cyan Micro Indicator on Card Top Right */}
                <div className="absolute top-2 right-2 pointer-events-none z-10 px-1.5 py-0.5 bg-black/80 border border-[#2997FF]/40 font-mono text-[9px] text-[#2997FF] uppercase">
                  #{indexStr}
                </div>
              </div>

              {/* Card Body & Metadata Chips */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  {/* Category & Year Chips */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[#2997FF] bg-[#2997FF]/10 border border-[#2997FF]/30">
                      {project.category}
                    </span>

                    {project.year && (
                      <span className="px-2 py-0.5 font-mono text-[10px] text-zinc-400 border border-white/10 bg-white/[0.02]">
                        {project.year}
                      </span>
                    )}

                    {project.client && (
                      <span className="px-2 py-0.5 font-mono text-[10px] text-zinc-300 border border-white/10 bg-white/[0.02] truncate max-w-[140px]">
                        {project.client}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-xl font-bold uppercase tracking-tight text-white group-hover:text-[#2997FF] transition-colors">
                    <Link href={`/${username}/work/${project.slug}`}>
                      {project.title}
                    </Link>
                  </h3>

                  {/* Description */}
                  {project.description && (
                    <p className="font-sans text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  )}
                </div>

                {/* Tools & Case Study Link */}
                <div className="pt-4 border-t border-white/[0.06] space-y-3">
                  {/* Tools Chips */}
                  {project.tools && project.tools.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {project.tools.slice(0, 4).map((tool) => (
                        <span
                          key={tool}
                          className="px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-zinc-400 bg-white/[0.02] border border-white/[0.06]"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Case Study Link */}
                  <div className="pt-1 flex items-center justify-between font-mono text-xs">
                    <Link
                      href={`/${username}/work/${project.slug}`}
                      className="inline-flex items-center gap-2 text-zinc-300 group-hover:text-[#2997FF] transition-colors"
                    >
                      <span className="uppercase tracking-widest text-[11px]">
                        VIEW PROJECT
                      </span>
                      <span className="transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
