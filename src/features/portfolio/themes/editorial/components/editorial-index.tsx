"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { PublicProject } from "../../../types";
import { TypographicPoster } from "@/features/media";

interface EditorialIndexProps {
  projects: PublicProject[];
  username: string;
}

export function EditorialIndex({ projects, username }: EditorialIndexProps) {
  const [activeSlug, setActiveSlug] = useState<string>(
    projects[0]?.slug ?? ""
  );

  const activeProject =
    projects.find((p) => p.slug === activeSlug) || projects[0] || null;

  if (projects.length === 0) {
    return (
      <section
        id="index"
        data-testid="editorial-index"
        className="py-24 text-center border-b border-white/[0.08]"
      >
        <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          No published projects in the editorial index yet.
        </p>
      </section>
    );
  }

  return (
    <section
      id="index"
      data-testid="editorial-index"
      className="py-16 sm:py-24 border-b border-white/[0.08]"
    >
      {/* Section Header */}
      <div className="mb-12 flex flex-wrap items-baseline justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div className="flex items-center gap-3">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#FF3B30]" />
          <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-300">
            [ PROJECT ARCHIVE // INDEX TABLE ]
          </h2>
        </div>
        <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          {projects.length} {projects.length === 1 ? "ENTRY" : "ENTRIES"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Modular Project Index Table (7 cols on desktop) */}
        <div className="lg:col-span-7 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.12] font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                <th scope="col" className="py-3 pr-4 font-normal w-12">
                  No.
                </th>
                <th scope="col" className="py-3 pr-4 font-normal w-16">
                  Year
                </th>
                <th scope="col" className="py-3 pr-4 font-normal">
                  Title
                </th>
                <th scope="col" className="py-3 pr-4 font-normal hidden sm:table-cell">
                  Category
                </th>
                <th scope="col" className="py-3 pr-4 font-normal hidden md:table-cell">
                  Client
                </th>
                <th scope="col" className="py-3 text-right font-normal w-16">
                  Link
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {projects.map((project, idx) => {
                const indexStr = String(idx + 1).padStart(2, "0");
                const isActive = project.slug === activeProject?.slug;

                return (
                  <tr
                    key={project.slug}
                    data-testid={`editorial-row-${project.slug}`}
                    onMouseEnter={() => setActiveSlug(project.slug)}
                    onFocus={() => setActiveSlug(project.slug)}
                    className={`group cursor-pointer transition-colors duration-200 ${
                      isActive
                        ? "bg-white/[0.04]"
                        : "hover:bg-white/[0.02]"
                    }`}
                  >
                    {/* Index */}
                    <td className="py-4 pr-4 font-mono text-xs text-zinc-500 group-hover:text-[#FF3B30] transition-colors">
                      {indexStr}
                    </td>

                    {/* Year */}
                    <td className="py-4 pr-4 font-mono text-xs text-zinc-400">
                      {project.year || "—"}
                    </td>

                    {/* Title */}
                    <td className="py-4 pr-4">
                      <Link
                        href={`/${username}/work/${project.slug}`}
                        className="font-serif text-base sm:text-lg font-medium text-white group-hover:text-[#FF3B30] transition-colors inline-block"
                      >
                        {project.title}
                      </Link>
                      <div className="sm:hidden font-mono text-[10px] uppercase text-zinc-500 tracking-wider mt-0.5">
                        {project.category} {project.client ? `// ${project.client}` : ""}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 pr-4 hidden sm:table-cell font-mono text-xs uppercase tracking-wider text-zinc-400">
                      <span className="px-2 py-0.5 border border-white/10 bg-white/[0.02]">
                        {project.category}
                      </span>
                    </td>

                    {/* Client */}
                    <td className="py-4 pr-4 hidden md:table-cell font-sans text-xs text-zinc-400">
                      {project.client || "—"}
                    </td>

                    {/* View Action */}
                    <td className="py-4 text-right">
                      <Link
                        href={`/${username}/work/${project.slug}`}
                        aria-label={`View case study for ${project.title}`}
                        className="font-mono text-xs uppercase text-zinc-500 group-hover:text-[#FF3B30] transition-all inline-flex items-center gap-1"
                      >
                        <span className="hidden sm:inline">VIEW</span>
                        <span className="transition-transform group-hover:translate-x-0.5">
                          →
                        </span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Interactive Poster Preview Drawer / Stage (5 cols on desktop, sticky) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
          <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-zinc-500 border-b border-white/[0.08] pb-2">
            <span>[ PREVIEW DRAWER ]</span>
            {activeProject && (
              <span className="text-[#FF3B30]">
                {activeProject.category}
              </span>
            )}
          </div>

          {activeProject ? (
            <div className="group relative overflow-hidden border border-white/[0.12] bg-[#0A0A0A] shadow-2xl transition-all">
              {/* Media Poster Stage */}
              <div className="relative aspect-video w-full overflow-hidden bg-black">
                {activeProject.thumbnailUrl ? (
                  <Image
                    src={activeProject.thumbnailUrl}
                    alt={activeProject.title}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <TypographicPoster
                    index="01"
                    title={activeProject.title}
                    category={activeProject.category}
                    client={activeProject.client}
                    year={activeProject.year}
                    aspectRatio="16/9"
                    className="w-full h-full"
                  />
                )}

                {/* Subtle vermillion border accent on hover */}
                <div className="pointer-events-none absolute inset-0 border border-transparent group-hover:border-[#FF3B30]/40 transition-colors" />
              </div>

              {/* Preview Drawer Meta Snippet */}
              <div className="p-5 space-y-3 bg-[#0D0D0D] border-t border-white/[0.08]">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-serif text-lg font-bold text-white tracking-tight">
                    {activeProject.title}
                  </h3>
                  {activeProject.year && (
                    <span className="font-mono text-xs text-zinc-500">
                      {activeProject.year}
                    </span>
                  )}
                </div>

                {activeProject.description && (
                  <p className="font-sans text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {activeProject.description}
                  </p>
                )}

                <div className="pt-2 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase text-zinc-500">
                    {activeProject.tools.slice(0, 3).join(" • ") || activeProject.sourceType}
                  </span>

                  <Link
                    href={`/${username}/work/${activeProject.slug}`}
                    className="font-mono text-xs uppercase tracking-wider text-[#FF3B30] hover:text-white transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>OPEN CASE STUDY</span>
                    <span>↗</span>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="aspect-video w-full flex items-center justify-center border border-white/[0.08] bg-[#0A0A0A] font-mono text-xs text-zinc-600">
              Select project to preview
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
