"use client";

import React, { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { TypographicPoster } from "./typographic-poster";

export interface DrivePlayerProps {
  url?: string;
  fileId?: string;
  previewUrl?: string;
  canonicalUrl?: string;
  title: string;
  posterUrl?: string;
  index?: number | string;
  category?: string;
  client?: string | null;
  year?: number | null;
  autoLoadOnIntersect?: boolean;
  className?: string;
}

export function DrivePlayer({
  url,
  fileId,
  previewUrl,
  canonicalUrl: propCanonicalUrl,
  title,
  posterUrl,
  index,
  category,
  client,
  year,
  autoLoadOnIntersect = true,
  className,
}: DrivePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isManualLoaded, setIsManualLoaded] = useState(false);
  const [posterError, setPosterError] = useState(false);

  const effectiveFileId = fileId;
  const embedSrc =
    previewUrl ||
    (effectiveFileId
      ? `https://drive.google.com/file/d/${effectiveFileId}/preview`
      : null);

  const targetLink =
    propCanonicalUrl ||
    (effectiveFileId
      ? `https://drive.google.com/file/d/${effectiveFileId}/view`
      : url || "#");

  const defaultPoster = effectiveFileId
    ? `https://drive.google.com/thumbnail?id=${effectiveFileId}&sz=w1280`
    : undefined;
  const currentPoster = posterUrl || defaultPoster;

  // IntersectionObserver for lazy-loading preview iframe
  useEffect(() => {
    if (!autoLoadOnIntersect) return;
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return;
    }

    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [autoLoadOnIntersect]);

  const shouldMountIframe = (isIntersecting || isManualLoaded) && Boolean(embedSrc);

  const handleManualActivate = () => {
    setIsManualLoaded(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleManualActivate();
    }
  };

  return (
    <div
      ref={containerRef}
      data-testid="drive-player"
      className={clsx(
        "relative flex flex-col overflow-hidden bg-[#0A0A0A] border border-white/[0.08]",
        className
      )}
    >
      {/* 16:9 Media Display Area */}
      <div className="relative w-full aspect-video overflow-hidden bg-black">
        {shouldMountIframe ? (
          <iframe
            data-testid="drive-iframe"
            src={embedSrc!}
            title={title}
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="w-full h-full border-0 absolute inset-0"
          />
        ) : (
          <div
            role="button"
            tabIndex={0}
            aria-label={`Preview media: ${title}`}
            onClick={handleManualActivate}
            onKeyDown={handleKeyDown}
            className="group relative w-full h-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            {posterError || !currentPoster ? (
              <TypographicPoster
                index={index}
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
                  data-testid="drive-poster-img"
                  src={currentPoster}
                  alt={title}
                  onError={() => setPosterError(true)}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-black/30 transition-colors duration-300 group-hover:bg-black/10"
                  aria-hidden="true"
                />
              </div>
            )}

            {/* Centered Preview Badge / Play Indicator */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div
                data-testid="drive-play-badge"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white font-mono text-xs uppercase tracking-wider shadow-2xl transition-all duration-300 ease-out group-hover:scale-105 group-hover:bg-black/80 group-hover:border-white/40"
              >
                <svg
                  className="w-3.5 h-3.5 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <span>PREVIEW</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Permanent Direct Action Bar */}
      <div
        data-testid="drive-action-bar"
        className="flex items-center justify-between border-t border-white/[0.08] bg-[#0A0A0A] px-4 py-2.5 font-mono text-xs select-none"
      >
        <span className="truncate max-w-[200px] text-zinc-400 font-sans text-xs">
          {title}
        </span>
        <a
          data-testid="drive-action-link"
          href={targetLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-medium text-white hover:text-zinc-300 transition-colors focus:outline-none focus-visible:underline"
        >
          <span>OPEN IN GOOGLE DRIVE ↗</span>
        </a>
      </div>
    </div>
  );
}
