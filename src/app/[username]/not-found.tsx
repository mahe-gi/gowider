import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div
      data-testid="public-not-found"
      className="flex min-h-screen flex-col items-center justify-center bg-[#000000] px-6 text-center text-white"
    >
      <div className="max-w-md space-y-6">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-zinc-500">
          404 // NOT FOUND
        </span>

        <h1 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white leading-tight">
          This work is not available.
        </h1>

        <p className="font-sans text-sm text-zinc-400 leading-relaxed">
          The creator portfolio or case study you requested could not be located. It may be unpublished, deleted, or the URL might be mistyped.
        </p>

        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-black bg-white px-6 py-3 hover:bg-zinc-200 transition-colors"
          >
            <span>← RETURN TO GOWIDER</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
