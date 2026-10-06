import React from "react";
import { LogoMark } from "@/components/brand";

export default function PortfolioLoading() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between p-6 sm:p-12 overflow-hidden animate-pulse">
      {/* Top Header Skeleton */}
      <header className="flex items-center justify-between max-w-[1800px] w-full mx-auto border-b border-white/[0.08] pb-4">
        <div className="h-5 w-40 bg-zinc-800 rounded" />
        <div className="h-4 w-28 bg-zinc-900 rounded hidden sm:block" />
        <div className="flex gap-6">
          <div className="h-4 w-12 bg-zinc-900 rounded" />
          <div className="h-4 w-12 bg-zinc-900 rounded" />
          <div className="h-4 w-16 bg-zinc-900 rounded" />
        </div>
      </header>

      {/* Main Cinematic Stage Skeleton */}
      <main className="max-w-[1800px] w-full mx-auto my-auto py-12 flex flex-col items-center">
        <div className="w-full aspect-video max-w-4xl bg-zinc-950 border border-white/10 rounded-lg flex flex-col items-center justify-center p-6 relative overflow-hidden">
          <LogoMark withBadge size={36} className="opacity-40 animate-pulse" />
          <div className="mt-4 h-3 w-32 bg-zinc-800 rounded" />
        </div>
      </main>

      {/* Footer Skeleton */}
      <footer className="max-w-[1800px] w-full mx-auto border-t border-white/[0.08] pt-6 flex justify-between items-center text-zinc-700">
        <div className="h-3 w-32 bg-zinc-900 rounded" />
        <div className="h-3 w-24 bg-zinc-900 rounded" />
      </footer>
    </div>
  );
}
