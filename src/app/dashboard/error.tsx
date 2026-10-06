"use client";

import React, { useEffect } from "react";
import Link from "next/link";

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error("Dashboard error boundary caught:", error);
  }, [error]);

  return (
    <div className="rounded-xl border border-red-900/40 bg-zinc-950 p-8 text-center space-y-6 my-6 max-w-2xl mx-auto">
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs uppercase tracking-wider rounded">
        <span>⚠ STUDIO ERROR</span>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-white tracking-tight">
          Failed to load studio view
        </h2>
        <p className="text-sm text-zinc-400 max-w-md mx-auto">
          We encountered an issue while loading this section of your dashboard. Your saved projects and settings are secure.
        </p>
      </div>

      {error.digest && (
        <p className="font-mono text-xs text-zinc-600">
          Ref: {error.digest}
        </p>
      )}

      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          onClick={() => reset()}
          type="button"
          className="rounded-lg bg-white px-5 py-2.5 text-xs font-bold font-mono uppercase tracking-wider text-black transition hover:bg-zinc-200 active:scale-95 cursor-pointer"
        >
          ↻ Try Again
        </button>
        <Link
          href="/dashboard"
          className="rounded-lg border border-zinc-800 px-5 py-2.5 text-xs font-mono uppercase tracking-wider text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
        >
          Studio Home
        </Link>
      </div>
    </div>
  );
}
