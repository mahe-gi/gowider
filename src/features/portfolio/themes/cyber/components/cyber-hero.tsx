import React from "react";
import Link from "next/link";
import type { PublicProfile, PublicProject } from "../../../types";
import {
  YouTubePlayer,
  DrivePlayer,
  InstagramCard,
  TypographicPoster,
  tryParseMediaUrl,
} from "@/features/media";

interface CyberHeroProps {
  profile: PublicProfile;
  spotlightProject?: PublicProject | null;
  cta?: { enabled: boolean; label: string; url: string } | null;
}

export function CyberHero({ profile, spotlightProject, cta }: CyberHeroProps) {
  const parsedSpotlight = spotlightProject ? tryParseMediaUrl(spotlightProject.sourceUrl) : null;

  return (
    <section
      data-testid="cyber-hero"
      className="relative pt-20 pb-16 sm:pt-28 sm:pb-24 border-b border-emerald-500/20"
    >
      {/* Neon Cyber Glow Vignette */}
      <div
        className="pointer-events-none absolute inset-0 -top-24 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(0,255,136,0.08),rgba(0,0,0,0))]"
        aria-hidden="true"
      />

      {/* Cyber Telemetry HUD Status Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-400/80 pb-6 border-b border-emerald-500/20">
        <div className="flex items-center gap-2.5">
          <span className="inline-block h-2 w-2 rounded-none bg-[#00FF88] shadow-[0_0_8px_#00FF88] animate-pulse" />
          <span className="text-[#00FF88] font-bold">
            SYS_ONLINE // {profile.availability || "GPU PIPELINE ACTIVE"}
          </span>
        </div>

        <div className="flex items-center gap-4 text-zinc-500">
          <span>TC: 00:04:12:18</span>
          <span className="hidden sm:inline">REFRESH: 120HZ // DCI 4K</span>
          {profile.location && (
            <span className="text-zinc-400">NODE: {profile.location}</span>
          )}
          <span className="rounded-none border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300 font-mono">
            VFX HUD [PRO]
          </span>
        </div>
      </div>

      {/* Headline & Terminal Bio */}
      <div className="pt-10 sm:pt-16 space-y-8">
        <div className="space-y-3">
          <div className="font-mono text-xs uppercase tracking-widest text-cyan-400 flex items-center gap-2">
            <span>&gt;&gt; OPERATOR_IDENT:</span>
            <span className="text-zinc-500">#009-CYBER</span>
          </div>
          <h1
            data-testid="cyber-hero-headline"
            className="font-mono text-4xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tight text-white leading-none drop-shadow-[0_0_25px_rgba(0,255,136,0.2)]"
          >
            {profile.displayName}
          </h1>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-2">
          <p className="max-w-2xl font-mono text-sm sm:text-base text-zinc-300 leading-relaxed border-l-2 border-[#00FF88] pl-4 bg-emerald-950/20 py-2">
            {profile.headline}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 shrink-0">
            {cta?.enabled && (
              <a
                href={cta.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#00FF88] text-black font-mono text-xs font-bold uppercase tracking-widest hover:bg-[#33ff9f] hover:shadow-[0_0_20px_rgba(0,255,136,0.5)] transition-all"
              >
                <span>{cta.label}</span>
                <span>↗</span>
              </a>
            )}

            <a
              href="#telemetry"
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-zinc-400 hover:text-[#00FF88] transition-colors py-3"
            >
              <span>[ VIEW TELEMETRY ]</span>
              <span>↓</span>
            </a>
          </div>
        </div>
      </div>

      {/* Hero Showreel Spotlight (If Configured) */}
      {spotlightProject && (
        <div className="mt-16 sm:mt-20 pt-10 border-t border-emerald-500/20">
          <div className="space-y-4">
            <div className="flex items-center justify-between font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 bg-[#00FF88] shadow-[0_0_6px_#00FF88]" />
                <span className="font-bold text-white">SIGNATURE SHOWREEL // ACTIVE GPU PIPELINE</span>
              </div>
              <span className="text-[11px] text-cyan-400">[PRIORITY RENDER]</span>
            </div>

            <div className="relative border border-emerald-500/40 bg-black/90 p-3 sm:p-5 shadow-[0_0_30px_rgba(0,255,136,0.1)]">
              {/* Corner crosshairs */}
              <div className="absolute top-1 left-1 font-mono text-[9px] text-emerald-500/60">+</div>
              <div className="absolute top-1 right-1 font-mono text-[9px] text-emerald-500/60">+</div>
              <div className="absolute bottom-1 left-1 font-mono text-[9px] text-emerald-500/60">+</div>
              <div className="absolute bottom-1 right-1 font-mono text-[9px] text-emerald-500/60">+</div>

              {/* Media Container */}
              <div className="w-full overflow-hidden bg-black">
                {spotlightProject.sourceType === "youtube" && parsedSpotlight?.id ? (
                  <YouTubePlayer
                    videoId={parsedSpotlight.id}
                    title={spotlightProject.title}
                    posterUrl={spotlightProject.thumbnailUrl || undefined}
                    fallbackIndex="00"
                    category={spotlightProject.category}
                    client={spotlightProject.client}
                    year={spotlightProject.year}
                    className="w-full aspect-video"
                  />
                ) : spotlightProject.sourceType === "google_drive" ? (
                  <DrivePlayer
                    url={spotlightProject.sourceUrl}
                    fileId={parsedSpotlight?.id}
                    canonicalUrl={parsedSpotlight?.canonicalUrl}
                    title={spotlightProject.title}
                    posterUrl={spotlightProject.thumbnailUrl || undefined}
                    index="00"
                    category={spotlightProject.category}
                    client={spotlightProject.client}
                    year={spotlightProject.year}
                    autoLoadOnIntersect={false}
                    className="w-full aspect-video"
                  />
                ) : spotlightProject.sourceType === "instagram" ? (
                  <div className="flex justify-center bg-black/60 py-8">
                    <InstagramCard
                      url={spotlightProject.sourceUrl}
                      canonicalUrl={parsedSpotlight?.canonicalUrl}
                      title={spotlightProject.title}
                    />
                  </div>
                ) : (
                  <TypographicPoster
                    index="00"
                    title={spotlightProject.title}
                    category={spotlightProject.category}
                    client={spotlightProject.client}
                    year={spotlightProject.year}
                    aspectRatio="16/9"
                    className="w-full"
                  />
                )}
              </div>

              {/* Spotlight Metadata Footer */}
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-emerald-500/20 font-mono text-xs">
                <div>
                  <h3 className="font-bold text-white tracking-wide">
                    {spotlightProject.title}
                  </h3>
                  <p className="text-[11px] text-zinc-400 tracking-wider uppercase mt-0.5">
                    PASS: {spotlightProject.category} {spotlightProject.year ? `// ${spotlightProject.year}` : ""}
                    {spotlightProject.client ? ` // CLIENT: ${spotlightProject.client}` : ""}
                  </p>
                </div>

                <Link
                  href={`/${profile.username}/work/${spotlightProject.slug}`}
                  className="font-mono text-xs uppercase tracking-widest text-[#00FF88] hover:text-white inline-flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                >
                  <span>[ ACCESS PIPELINE TELEMETRY ]</span>
                  <span>↗</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
