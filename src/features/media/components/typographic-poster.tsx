import React from "react";
import clsx from "clsx";

export interface TypographicPosterProps {
  index?: number | string;
  title: string;
  category?: string;
  client?: string | null;
  year?: number | null;
  aspectRatio?: "16/9" | "9/16" | "auto";
  className?: string;
}

export function TypographicPoster({
  index,
  title,
  category,
  client,
  year,
  aspectRatio = "16/9",
  className,
}: TypographicPosterProps) {
  const formattedIndex =
    index !== undefined && index !== null
      ? typeof index === "number"
        ? String(index).padStart(2, "0")
        : String(index)
      : null;

  const aspectClass =
    aspectRatio === "16/9"
      ? "aspect-video"
      : aspectRatio === "9/16"
        ? "aspect-[9/16]"
        : "";

  return (
    <div
      data-testid="typographic-poster"
      className={clsx(
        "relative flex flex-col justify-between overflow-hidden",
        "bg-[#0A0A0A] p-5 sm:p-7 text-white select-none",
        "border border-white/[0.08]",
        aspectClass,
        className
      )}
    >
      {/* Subtle cinematic gradient vignette */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.03),transparent_60%)]"
        aria-hidden="true"
      />

      {/* Top Header: Index Counter & Category Badge */}
      <div className="relative z-10 flex items-center justify-between gap-4">
        {formattedIndex ? (
          <span
            data-testid="poster-index"
            className="font-mono text-xs tracking-widest text-zinc-500 uppercase"
          >
            {formattedIndex}
          </span>
        ) : (
          <span />
        )}
        {category ? (
          <span
            data-testid="poster-category"
            className="font-mono text-[10px] tracking-widest text-zinc-400 uppercase px-2 py-0.5 border border-white/[0.08] bg-white/[0.02]"
          >
            {category.toUpperCase()}
          </span>
        ) : null}
      </div>

      {/* Middle: Title */}
      <div className="relative z-10 my-auto py-2">
        <h3
          data-testid="poster-title"
          className="text-base sm:text-xl font-medium tracking-tight text-white line-clamp-3 leading-snug"
        >
          {title}
        </h3>
      </div>

      {/* Bottom Footer: Client and Year metadata */}
      {(client || year) && (
        <div
          data-testid="poster-metadata"
          className="relative z-10 flex items-center gap-2 font-mono text-xs tracking-wider text-zinc-500"
        >
          {client && (
            <span data-testid="poster-client" className="truncate max-w-[200px]">
              {client}
            </span>
          )}
          {client && year && <span className="text-zinc-600">/</span>}
          {year && (
            <span data-testid="poster-year">
              {year}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
