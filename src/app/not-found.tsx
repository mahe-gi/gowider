import React from "react";
import Link from "next/link";
import { LogoMark } from "@/components/brand";

export default function GlobalNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center text-white relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-white/[0.02] blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-lg space-y-6">
        <div className="flex justify-center mb-4">
          <LogoMark withBadge size={40} />
        </div>

        <span className="inline-block font-mono text-xs uppercase tracking-[0.3em] text-zinc-500 border border-white/10 px-3 py-1 bg-white/[0.02]">
          404 // SIGNAL LOST
        </span>

        <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
          FRAME NOT FOUND
        </h1>

        <p className="font-sans text-sm text-zinc-400 leading-relaxed max-w-md mx-auto">
          The portfolio, project reel, or page frequency you requested is currently off-air. It may have been moved, unpublished, or does not exist.
        </p>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/explore"
            className="w-full sm:w-auto inline-flex items-center justify-center font-mono text-xs font-bold uppercase tracking-widest text-black bg-white px-6 py-3.5 hover:bg-zinc-200 transition-colors"
          >
            Explore Creators ↗
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center font-mono text-xs uppercase tracking-widest text-zinc-400 border border-white/15 px-6 py-3.5 hover:text-white hover:border-white/30 transition-colors"
          >
            ← Return Home
          </Link>
        </div>
      </div>

      <footer className="absolute bottom-8 left-0 right-0 text-center">
        <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-700">
          GOWIDER // BROADCAST REEL PLATFORM
        </p>
      </footer>
    </div>
  );
}
