"use client";

import React, { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import type { PortfolioData } from "@/features/portfolio/types";
import { PortfolioRenderer } from "@/features/portfolio/renderer/portfolio-renderer";

interface DraftPreviewClientProps {
  portfolio: PortfolioData;
}

type ViewportMode = "desktop" | "tablet" | "mobile";

export function DraftPreviewClient({ portfolio }: DraftPreviewClientProps) {
  const [viewport, setViewport] = useState<ViewportMode>("desktop");

  const getViewportWidthClass = () => {
    switch (viewport) {
      case "mobile":
        return "w-[375px]";
      case "tablet":
        return "w-[768px]";
      case "desktop":
      default:
        return "w-full";
    }
  };

  return (
    <div data-testid="draft-preview-container" className="space-y-6">
      {/* Draft Notification Banner */}
      <div className="rounded-xl border border-amber-800/80 bg-amber-950/40 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-amber-300">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
          <span className="text-xs sm:text-sm font-medium">
            Draft Device Preview — Rendering live draft data (all {portfolio.projects.length} projects, unpublished changes visible).
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/design"
            className="text-xs font-semibold text-amber-200 underline hover:text-white transition"
          >
            Edit Theme
          </Link>
          <span className="text-amber-700">•</span>
          <Link
            href="/dashboard/work"
            className="text-xs font-semibold text-amber-200 underline hover:text-white transition"
          >
            Manage Work
          </Link>
        </div>
      </div>

      {/* Viewport Control Bar */}
      <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
        <div className="text-xs text-zinc-400 font-medium">
          Simulated Viewport: <span className="text-white capitalize">{viewport}</span>
        </div>

        {/* Viewport Switcher Controls */}
        <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 p-1">
          <button
            type="button"
            data-testid="viewport-desktop"
            onClick={() => setViewport("desktop")}
            className={clsx(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition",
              viewport === "desktop"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Desktop</span>
          </button>

          <button
            type="button"
            data-testid="viewport-tablet"
            onClick={() => setViewport("tablet")}
            className={clsx(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition",
              viewport === "tablet"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span>Tablet (768px)</span>
          </button>

          <button
            type="button"
            data-testid="viewport-mobile"
            onClick={() => setViewport("mobile")}
            className={clsx(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition",
              viewport === "mobile"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span>Mobile (375px)</span>
          </button>
        </div>
      </div>

      {/* Viewport Frame Container - ZERO IFRAMES */}
      <div className="flex justify-center overflow-x-auto pb-12 pt-2">
        <div
          data-testid="viewport-frame"
          className={clsx(
            "transition-all duration-300 rounded-xl overflow-hidden border border-zinc-800 bg-black shadow-2xl",
            viewport !== "desktop" && "ring-1 ring-zinc-700/50 shadow-black/80 my-4",
            getViewportWidthClass()
          )}
        >
          {/* Direct rendering of PortfolioRenderer with ZERO IFRAMES */}
          <PortfolioRenderer portfolio={portfolio} />
        </div>
      </div>
    </div>
  );
}
