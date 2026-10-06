"use client";

import { useState } from "react";

export function InteractiveDemo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const appUrl = "https://gowider.in";

  return (
    <section id="demo" className="py-20 border-t border-white/[0.08] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 block mb-2">
              02 // BESPOKE CINEMATIC PREVIEW
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-bold uppercase tracking-tight text-white">
              THE LIVE CINEMA STAGE
            </h2>
          </div>
          <div className="font-mono text-xs text-zinc-400 tracking-wider uppercase">
            Poster-First Engine • 0ms Initial Iframe Load
          </div>
        </div>

        {/* Mock Stage Frame */}
        <div className="border border-white/[0.12] bg-[#0A0A0A] overflow-hidden shadow-2xl">
          {/* Top Browser / Portfolio Navigation Bar */}
          <div className="px-4 py-3 border-b border-white/[0.08] bg-black/60 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
            </div>

            <div className="flex-1 max-w-md mx-auto bg-[#141414] px-4 py-1.5 border border-white/[0.06] text-center">
              <span className="font-mono text-xs text-zinc-400 tracking-wider">
                {appUrl}/alex-morgan
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 hidden sm:inline-block">
                ● Live Portfolio
              </span>
            </div>
          </div>

          {/* 16:9 Video Canvas Stage */}
          <div className="relative aspect-video w-full bg-zinc-950 flex items-center justify-center overflow-hidden group">
            {isPlaying ? (
              <iframe
                src="https://www.youtube-nocookie.com/embed/ScMzIvxBSi4?autoplay=1&rel=0&modestbranding=1&playsinline=1"
                title="Curated Showcase Video"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div
                onClick={() => setIsPlaying(true)}
                className="absolute inset-0 cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label="Play curated portfolio reel"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setIsPlaying(true);
                }}
              >
                {/* Poster Graphic Background with Cinematic Scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />

                {/* Abstract Cinematic Dark Poster Artwork */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1600&q=80')`,
                  }}
                />

                {/* Top Poster Metadata Overlay */}
                <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
                  <span className="font-mono text-xs px-2.5 py-1 bg-black/80 border border-white/20 uppercase tracking-widest text-white">
                    01 // SELECTED WORK
                  </span>
                  <span className="font-mono text-xs px-2 py-1 bg-black/60 border border-white/10 uppercase tracking-wider text-zinc-300">
                    4K MASTER
                  </span>
                </div>

                {/* Centered Play Trigger */}
                <div className="absolute inset-0 z-20 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border border-white/40 bg-black/60 backdrop-blur-md flex items-center justify-center text-white transition-all duration-300 group-hover:scale-110 group-hover:border-white group-hover:bg-white group-hover:text-black">
                      <svg
                        className="h-6 w-6 sm:h-7 sm:w-7 ml-1 fill-current"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/90 bg-black/60 px-3 py-1 border border-white/10">
                      CLICK TO PLAY REEL
                    </span>
                  </div>
                </div>

                {/* Bottom Title Overlay */}
                <div className="absolute bottom-6 left-6 right-6 z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs uppercase tracking-wider text-zinc-400 block">
                      COMMERCIAL // AUTOMOTIVE
                    </span>
                    <h3 className="font-display text-xl sm:text-3xl font-bold uppercase tracking-tight text-white mt-1">
                      HYPERION ELECTRIC SHOWREEL
                    </h3>
                  </div>
                  <div className="font-mono text-xs uppercase tracking-wider text-zinc-400">
                    DIRECTOR&apos;S CUT • 2026
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Lower Thirds Spec Sheet */}
          <div className="px-6 py-4 bg-[#0F0F0F] border-t border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 block">
                Category
              </span>
              <span className="font-sans text-xs font-medium text-white uppercase mt-0.5 block">
                Commercial Color &amp; Edit
              </span>
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 block">
                Client Repertoire
              </span>
              <span className="font-sans text-xs font-medium text-white uppercase mt-0.5 block">
                Automotive Studios
              </span>
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 block">
                Editing Suite
              </span>
              <span className="font-sans text-xs font-medium text-white uppercase mt-0.5 block">
                DaVinci Resolve / Premiere
              </span>
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 block">
                Native Source
              </span>
              <span className="font-sans text-xs font-medium text-white uppercase mt-0.5 block">
                YouTube 4K Lossless Embed
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
