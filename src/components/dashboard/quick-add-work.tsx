"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export function QuickAddWork() {
  const [url, setUrl] = useState("");
  const router = useRouter();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = url.trim();
      if (val) {
        router.push(`/dashboard/work/new?url=${encodeURIComponent(val)}`);
      }
    }
  };

  const handleAddClick = () => {
    const val = url.trim();
    if (val) {
      router.push(`/dashboard/work/new?url=${encodeURIComponent(val)}`);
    } else {
      router.push("/dashboard/work/new");
    }
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1">
          <label htmlFor="quick-media-url" className="sr-only">
            Quick Add Video URL
          </label>
          <input
            id="quick-media-url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste YouTube, Instagram Reel, or Google Drive video URL..."
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
            onKeyDown={handleKeyDown}
          />
        </div>
        <button
          type="button"
          onClick={handleAddClick}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 cursor-pointer"
        >
          Quick Add Work
        </button>
      </div>
    </div>
  );
}
