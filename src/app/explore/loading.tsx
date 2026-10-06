import React from "react";

export default function ExploreLoading() {
  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <div className="h-4 w-32 bg-zinc-800 rounded font-mono" />
        <div className="h-10 w-80 bg-zinc-700/70 rounded" />
        <div className="h-4 w-96 bg-zinc-800/60 rounded" />
      </div>

      {/* Filter and Search Bar Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pb-6 border-b border-white/10">
        <div className="h-12 w-full sm:w-80 bg-zinc-900 border border-zinc-800 rounded" />
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-24 bg-zinc-900 border border-zinc-800 rounded shrink-0" />
          ))}
        </div>
      </div>

      {/* Creator Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex flex-col bg-zinc-950 border border-white/10 overflow-hidden"
          >
            {/* Aspect Video Poster Skeleton */}
            <div className="aspect-video w-full bg-zinc-900 border-b border-white/10" />

            {/* Creator Info Skeleton */}
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-zinc-800 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-28 bg-zinc-700 rounded" />
                  <div className="h-3 w-20 bg-zinc-800 rounded" />
                </div>
              </div>
              <div className="h-3 w-full bg-zinc-900 rounded" />
              <div className="h-3 w-2/3 bg-zinc-900 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
