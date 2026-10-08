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

interface AtelierHeroProps {
  profile: PublicProfile;
  spotlightProject?: PublicProject | null;
  cta?: { enabled: boolean; label: string; url: string } | null;
}

export function AtelierHero({ profile, spotlightProject, cta }: AtelierHeroProps) {
  const parsedSpotlight = spotlightProject ? tryParseMediaUrl(spotlightProject.sourceUrl) : null;

  return (
    <section
      data-testid="atelier-hero"
      className="relative pt-20 pb-16 sm:pt-28 sm:pb-24 border-b border-[#292524]/60"
    >
      {/* Subtle Fine-Art Travertine Vignette */}
      <div
        className="pointer-events-none absolute inset-0 -top-24 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(168,162,158,0.06),rgba(0,0,0,0))]"
        aria-hidden="true"
      />

      {/* Header Info Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.25em] text-[#A8A29E] pb-8 border-b border-[#292524]/40">
        <div className="flex items-center gap-2.5">
          <span className="inline-block h-2 w-2 rounded-none bg-[#D6D3CD]" />
          <span className="text-[#D6D3CD] font-medium">
            {profile.availability || "AVAILABLE FOR COMMISSIONS"}
          </span>
        </div>

        <div className="flex items-center gap-4 text-[#78716C]">
          {profile.location && (
            <span>LOCATION: <span className="text-[#D6D3CD]">{profile.location}</span></span>
          )}
          <span className="rounded-none border border-[#78716C]/40 bg-[#1C1917] px-2 py-0.5 text-[10px] text-[#D6D3CD] font-mono">
            PORTFOLIO
          </span>
        </div>
      </div>

      {/* Curator & Artist Headline */}
      <div className="pt-12 sm:pt-16 space-y-8">
        <div className="space-y-4">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#A8A29E]">
            PORTFOLIO OF
          </p>
          <h1
            data-testid="atelier-hero-headline"
            className="font-serif text-5xl sm:text-7xl lg:text-8xl font-normal tracking-[-0.03em] text-[#F5F5F4] leading-[0.95]"
          >
            {profile.displayName}
          </h1>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-2">
          <p className="max-w-2xl font-serif text-xl sm:text-2xl text-[#D6D3CD]/90 font-light leading-relaxed italic">
            &ldquo;{profile.headline}&rdquo;
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 shrink-0">
            {cta?.enabled && (
              <a
                href={cta.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#E7E5E4] text-[#0C0A09] font-mono text-xs font-semibold uppercase tracking-widest hover:bg-[#F5F5F4] hover:shadow-[0_0_20px_rgba(231,229,228,0.2)] transition-all"
              >
                <span>{cta.label}</span>
                <span>↗</span>
              </a>
            )}

            <a
              href="#exhibitions"
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#A8A29E] hover:text-[#F5F5F4] transition-colors py-3"
            >
              <span>[ VIEW WORK ]</span>
              <span>↓</span>
            </a>
          </div>
        </div>
      </div>

      {/* Signature Showreel Spotlight (If Configured) */}
      {spotlightProject && (
        <div className="mt-16 sm:mt-20 pt-10 border-t border-[#292524]/60">
          <div className="space-y-4">
            <div className="flex items-center justify-between font-mono text-xs uppercase tracking-[0.2em] text-[#A8A29E]">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 bg-[#D6D3CD]" />
                <span className="text-[#D6D3CD] font-medium">FEATURED SHOWREEL</span>
              </div>
              <span className="text-[11px] text-[#78716C]">[FEATURED]</span>
            </div>

            <div className="relative border border-[#292524] bg-[#141210] p-3 sm:p-5 shadow-2xl">
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

              {/* Spotlight Plaque Card Footer */}
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-[#292524]/40 font-mono text-xs">
                <div>
                  <h3 className="font-serif text-lg text-[#F5F5F4] tracking-tight">
                    {spotlightProject.title}
                  </h3>
                  <p className="text-[11px] text-[#A8A29E] tracking-wider uppercase mt-0.5">
                    {spotlightProject.category} {spotlightProject.year ? `// ${spotlightProject.year}` : ""}
                    {spotlightProject.client ? ` // FOR ${spotlightProject.client}` : ""}
                  </p>
                </div>

                <Link
                  href={`/${profile.username}/work/${spotlightProject.slug}`}
                  className="font-mono text-xs uppercase tracking-widest text-[#D6D3CD] hover:text-white inline-flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                >
                  <span>[ VIEW PROJECT ]</span>
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
