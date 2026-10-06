import React from "react";
import clsx from "clsx";

export interface InstagramCardProps {
  url?: string;
  canonicalUrl?: string;
  subtype?: "reel" | "p" | "tv" | string;
  title: string;
  posterUrl?: string;
  index?: number | string;
  category?: string;
  client?: string | null;
  year?: number | null;
  className?: string;
}

export function InstagramCard({
  url,
  canonicalUrl,
  subtype = "reel",
  title,
  posterUrl,
  index,
  category,
  client,
  year,
  className,
}: InstagramCardProps) {
  const targetUrl = canonicalUrl || url || "#";

  const formattedIndex =
    index !== undefined && index !== null
      ? typeof index === "number"
        ? String(index).padStart(2, "0")
        : String(index)
      : null;

  // Typographic badge label
  const badgeLabel =
    subtype === "reel"
      ? "REEL"
      : subtype === "tv"
        ? "IGTV"
        : "POST";

  // CTA button label
  const buttonLabel =
    subtype === "reel"
      ? "WATCH REEL ↗"
      : subtype === "tv"
        ? "WATCH IGTV ↗"
        : "WATCH POST ↗";

  return (
    <div
      data-testid="instagram-card"
      className={clsx(
        "group relative flex flex-col justify-between overflow-hidden",
        "aspect-[9/16] w-full max-w-sm rounded-none border border-white/[0.08]",
        "bg-gradient-to-b from-[#18181B] via-[#0A0A0A] to-[#000000] p-6 text-white select-none",
        className
      )}
    >
      {/* Background Poster (if provided) with dark gradient overlay */}
      {posterUrl && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            data-testid="instagram-poster-img"
            src={posterUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/90"
            aria-hidden="true"
          />
        </div>
      )}

      {/* Top Bar: Typographic Badge & Index */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <span
          data-testid="instagram-badge"
          className="inline-flex items-center font-mono text-[10px] tracking-widest text-zinc-300 uppercase px-2.5 py-1 border border-white/10 bg-white/5 backdrop-blur-md"
        >
          {badgeLabel}
        </span>

        {formattedIndex && (
          <span
            data-testid="instagram-index"
            className="font-mono text-xs tracking-widest text-zinc-500 uppercase"
          >
            {formattedIndex}
          </span>
        )}
      </div>

      {/* Middle: Title, Category, Client & Year */}
      <div className="relative z-10 my-auto py-4 space-y-2">
        {category && (
          <span
            data-testid="instagram-category"
            className="font-mono text-[10px] tracking-widest text-zinc-400 uppercase block"
          >
            {category}
          </span>
        )}

        <h3
          data-testid="instagram-title"
          className="text-lg sm:text-xl font-medium tracking-tight text-white leading-snug line-clamp-4"
        >
          {title}
        </h3>

        {(client || year) && (
          <div
            data-testid="instagram-metadata"
            className="flex items-center gap-2 font-mono text-xs tracking-wider text-zinc-500 pt-1"
          >
            {client && <span className="truncate max-w-[160px]">{client}</span>}
            {client && year && <span className="text-zinc-600">/</span>}
            {year && <span>{year}</span>}
          </div>
        )}
      </div>

      {/* Bottom Action: Direct Link Button */}
      <div className="relative z-10 pt-2">
        <a
          data-testid="instagram-cta-btn"
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 py-3 px-4 font-mono text-xs font-semibold tracking-wider text-white bg-white/10 border border-white/20 backdrop-blur-md transition-all duration-300 hover:bg-white hover:text-black hover:border-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        >
          <span>{buttonLabel}</span>
        </a>
      </div>
    </div>
  );
}
