"use client";

import React, { useState } from "react";
import clsx from "clsx";
import { TypographicPoster } from "./typographic-poster";

export interface YouTubePlayerProps {
  videoId: string;
  title: string;
  posterUrl?: string;
  fallbackIndex?: number | string;
  category?: string;
  client?: string | null;
  year?: number | null;
  className?: string;
}

export function YouTubePlayer({
  videoId,
  title,
  posterUrl,
  fallbackIndex,
  category,
  client,
  year,
  className,
}: YouTubePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [imgError, setImgError] = useState(false);

  // If posterUrl is explicitly passed, use it; otherwise standard high-res YouTube thumbnail
  const initialThumb =
    posterUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const [currentThumb, setCurrentThumb] = useState(initialThumb);

  const handleThumbError = () => {
    // If maxres fails, try hqdefault before falling back to typographic poster
    if (currentThumb.includes("maxresdefault")) {
      setCurrentThumb(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
    } else {
      setImgError(true);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handlePlay();
    }
  };

  return (
    <div
      data-testid="youtube-player"
      className={clsx(
        "relative w-full aspect-video overflow-hidden bg-[#0A0A0A] border border-white/[0.08]",
        className
      )}
    >
      {isPlaying ? (
        <iframe
          data-testid="youtube-iframe"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full border-0 absolute inset-0"
        />
      ) : (
        <div
          role="button"
          tabIndex={0}
          aria-label={`Play video: ${title}`}
          onClick={handlePlay}
          onKeyDown={handleKeyDown}
          className="group relative w-full h-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          {imgError ? (
            <TypographicPoster
              index={fallbackIndex}
              title={title}
              category={category}
              client={client}
              year={year}
              aspectRatio="16/9"
              className="w-full h-full border-0"
            />
          ) : (
            <div className="relative w-full h-full overflow-hidden bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                data-testid="youtube-poster-img"
                src={currentThumb}
                alt={title}
                onError={handleThumbError}
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/10"
                aria-hidden="true"
              />
            </div>
          )}

          {/* Minimal Play Button Overlay */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div
              data-testid="youtube-play-btn"
              className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white shadow-2xl transition-all duration-300 ease-out group-hover:scale-110 group-hover:bg-black/80 group-hover:border-white/40"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5 fill-current"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
