import React from "react";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded bg-zinc-800/80" />
          <div className="h-4 w-72 rounded bg-zinc-900" />
        </div>
        <div className="h-10 w-32 rounded-lg bg-zinc-800" />
      </div>

      {/* Metrics Row Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-zinc-800/80 bg-zinc-950 p-5 space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 rounded bg-zinc-800" />
              <div className="h-4 w-4 rounded bg-zinc-800" />
            </div>
            <div className="h-8 w-16 rounded bg-zinc-700/80" />
            <div className="h-3 w-36 rounded bg-zinc-900" />
          </div>
        ))}
      </div>

      {/* Content Area / Table Skeleton */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-950 p-6 space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-zinc-800/60">
          <div className="h-5 w-32 rounded bg-zinc-800" />
          <div className="h-4 w-20 rounded bg-zinc-900" />
        </div>

        {/* Rows */}
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 rounded-lg border border-zinc-900 bg-zinc-900/40"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-20 rounded bg-zinc-800 shrink-0" />
              <div className="space-y-2">
                <div className="h-4 w-40 rounded bg-zinc-800" />
                <div className="h-3 w-24 rounded bg-zinc-900" />
              </div>
            </div>
            <div className="h-6 w-20 rounded bg-zinc-800/60" />
          </div>
        ))}
      </div>
    </div>
  );
}
