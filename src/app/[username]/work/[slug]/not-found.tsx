import React from "react";
import Link from "next/link";
import { LogoMark } from "@/components/brand";

export default function ProjectNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center text-white relative overflow-hidden">
      <div className="max-w-md space-y-6">
        <div className="flex justify-center mb-2">
          <LogoMark withBadge size={36} />
        </div>

        <span className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-500 border border-white/10 px-3 py-1 bg-white/[0.02]">
          404 // REEL UNREACHABLE
        </span>

        <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white leading-tight">
          Project Case Study Not Found
        </h1>

        <p className="font-sans text-sm text-zinc-400 leading-relaxed">
          This project reel may have been unpublished, renamed, or is undergoing color grade updates by the editor.
        </p>

        <div className="pt-4 flex items-center justify-center gap-3">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-black bg-white px-5 py-3 hover:bg-zinc-200 transition-colors"
          >
            Explore Other Work ↗
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-zinc-400 border border-white/15 px-5 py-3 hover:text-white hover:border-white/30 transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
