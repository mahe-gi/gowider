"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ExploreCreator } from "@/features/explore/types";

interface ExploreClientGridProps {
  initialCreators: ExploreCreator[];
  initialSearch?: string;
  initialCategory?: string;
}

const CATEGORIES = [
  "All",
  "Commercial",
  "Narrative",
  "Music Video",
  "Documentary",
  "Social Media",
];

export function ExploreClientGrid({
  initialCreators,
  initialSearch = "",
  initialCategory = "All",
}: ExploreClientGridProps) {
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const filteredCreators = useMemo(() => {
    return initialCreators.filter((creator) => {
      // 1. Search filter (displayName, headline, username)
      if (search.trim()) {
        const query = search.trim().toLowerCase();
        const matchesName = creator.displayName.toLowerCase().includes(query);
        const matchesHeadline = creator.headline.toLowerCase().includes(query);
        const matchesUsername = creator.username.toLowerCase().includes(query);
        if (!matchesName && !matchesHeadline && !matchesUsername) {
          return false;
        }
      }

      // 2. Category filter
      if (
        selectedCategory &&
        selectedCategory.toLowerCase() !== "all"
      ) {
        const catQuery = selectedCategory.toLowerCase();
        const matchesCategory =
          creator.featuredProject?.category.toLowerCase() === catQuery;
        if (!matchesCategory) {
          return false;
        }
      }

      return true;
    });
  }, [initialCreators, search, selectedCategory]);

  const isInitialDatabaseEmpty = initialCreators.length === 0;

  return (
    <div className="space-y-8">
      {/* Search Bar & Category Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-8">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            data-testid="explore-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search editors, colorists, names..."
            className="w-full bg-zinc-950 border border-white/10 pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-white/30"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-white"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {CATEGORIES.map((category) => {
            const isActive =
              selectedCategory.toLowerCase() === category.toLowerCase();
            return (
              <button
                key={category}
                type="button"
                data-testid={`category-filter-${category.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => setSelectedCategory(category)}
                className={`px-3.5 py-1.5 text-xs font-mono tracking-wider uppercase transition-colors shrink-0 ${
                  isActive
                    ? "bg-white text-black font-semibold"
                    : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-white/5"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid or Clean Empty State */}
      {filteredCreators.length > 0 ? (
        <div
          data-testid="explore-creators-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {filteredCreators.map((creator) => (
            <Link
              key={creator.username}
              href={`/${creator.username}`}
              data-testid={`creator-card-${creator.username}`}
              className="group flex flex-col bg-zinc-950 border border-white/10 hover:border-white/30 transition-all duration-300 overflow-hidden"
            >
              {/* Featured Project Preview / Poster Container */}
              <div className="relative aspect-video w-full bg-zinc-900 border-b border-white/10 overflow-hidden">
                {creator.featuredProject?.thumbnailUrl ? (
                  <Image
                    src={creator.featuredProject.thumbnailUrl}
                    alt={creator.featuredProject.title}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col justify-end p-5 bg-gradient-to-t from-zinc-950 to-zinc-900">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
                      [ FEATURED SHOWCASE ]
                    </span>
                    <span className="font-display font-bold text-sm text-zinc-300 uppercase line-clamp-1">
                      {creator.featuredProject?.title || "Portfolio Reel"}
                    </span>
                  </div>
                )}

                {/* Category Pill Overlay */}
                {creator.featuredProject && (
                  <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 border border-white/10 font-mono text-[10px] uppercase tracking-wider text-zinc-300">
                    {creator.featuredProject.category}
                  </div>
                )}

                {/* Project Count Pill Overlay */}
                <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-1 border border-white/10 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                  {creator.projectCount} {creator.projectCount === 1 ? "PROJECT" : "PROJECTS"}
                </div>
              </div>

              {/* Creator Info Card Body */}
              <div className="p-6 flex flex-col flex-1 justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    {/* Avatar or Initials Fallback */}
                    {creator.avatarUrl ? (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-white/20">
                        <Image
                          src={creator.avatarUrl}
                          alt={creator.displayName}
                          fill
                          unoptimized
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/20 flex items-center justify-center font-mono font-bold text-xs text-white shrink-0">
                        {creator.displayName.slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-base text-white group-hover:text-zinc-200 transition-colors truncate">
                        {creator.displayName}
                      </h3>
                      <p className="font-mono text-xs text-zinc-500 truncate">
                        @{creator.username}
                      </p>
                    </div>
                  </div>

                  {/* Headline */}
                  <p className="text-xs text-zinc-400 font-sans line-clamp-2 leading-relaxed">
                    {creator.headline}
                  </p>
                </div>

                {/* Footer metadata: Location + View Arrow */}
                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between font-mono text-[11px] text-zinc-500">
                  <span className="truncate max-w-[200px]">
                    {creator.location || "Available Globally"}
                  </span>
                  <span className="group-hover:translate-x-1 group-hover:text-white transition-all text-zinc-400">
                    VIEW PORTFOLIO →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : isInitialDatabaseEmpty ? (
        /* Clean Zero State for Empty Database */
        <div
          data-testid="explore-empty-state"
          className="border border-white/10 bg-zinc-950 p-12 sm:p-20 text-center flex flex-col items-center justify-center max-w-2xl mx-auto space-y-6"
        >
          {/* Aesthetic Graphic */}
          <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center text-zinc-500">
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>

          <div className="space-y-2">
            <span className="font-mono text-xs uppercase tracking-widest text-zinc-500 block">
              [ ZERO DIRECTORY ENTRIES ]
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-wider text-white">
              No creators published yet
            </h2>
            <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
              No creators published yet. Be the first to publish your portfolio.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/onboarding"
              data-testid="create-portfolio-cta"
              className="inline-flex items-center gap-2 px-6 py-3 font-mono text-xs uppercase tracking-widest font-bold bg-white text-black hover:bg-zinc-200 transition-colors"
            >
              <span>CREATE PORTFOLIO</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Filter/Search Zero State */
        <div
          data-testid="explore-no-search-results"
          className="border border-white/10 bg-zinc-950 p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto space-y-4"
        >
          <div className="font-mono text-xs text-zinc-500 uppercase tracking-wider">
            [ NO MATCHES ]
          </div>
          <p className="text-sm text-zinc-300">
            No creators found matching your current filters.
          </p>
          <button
            type="button"
            data-testid="clear-filters-btn"
            onClick={() => {
              setSearch("");
              setSelectedCategory("All");
            }}
            className="px-4 py-2 border border-white/20 font-mono text-xs uppercase tracking-wider text-white hover:bg-zinc-900 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
