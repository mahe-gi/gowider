"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/brand";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log unexpected client exceptions
    console.error("Global application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center text-white relative overflow-hidden">
      {/* Background ambient red glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-red-950/20 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-lg space-y-6">
        <div className="flex justify-center mb-4">
          <LogoMark withBadge size={40} />
        </div>

        <span className="inline-block font-mono text-xs uppercase tracking-[0.3em] text-red-400 border border-red-500/20 px-3 py-1 bg-red-500/[0.05]">
          500 // TRANSMISSION INTERRUPTED
        </span>

        <h1 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-tight text-white leading-tight">
          SOMETHING WENT OFF-AIR
        </h1>

        <p className="font-sans text-sm text-zinc-400 leading-relaxed max-w-md mx-auto">
          An unexpected interruption occurred during playback or execution. Your account and work remain completely safe.
        </p>

        {error.digest && (
          <div className="py-2">
            <span className="font-mono text-[11px] text-zinc-600 uppercase tracking-wider bg-zinc-950 border border-zinc-800 px-3 py-1 rounded">
              Error Digest: {error.digest}
            </span>
          </div>
        )}

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            type="button"
            className="w-full sm:w-auto inline-flex items-center justify-center font-mono text-xs font-bold uppercase tracking-widest text-black bg-white px-6 py-3.5 hover:bg-zinc-200 active:scale-[0.98] transition-all cursor-pointer"
          >
            ↻ Retry Transmission
          </button>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center font-mono text-xs uppercase tracking-widest text-zinc-300 border border-white/15 px-6 py-3.5 hover:text-white hover:border-white/30 transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center font-mono text-xs uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors py-2"
          >
            Home
          </Link>
        </div>
      </div>

      <footer className="absolute bottom-8 left-0 right-0 text-center">
        <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-700">
          GOWIDER // BROADCAST-GRADE FAULT ISOLATION
        </p>
      </footer>
    </div>
  );
}
