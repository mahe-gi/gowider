import React from "react";
import type { PublicProject } from "../../../types";
import {
  YouTubePlayer,
  DrivePlayer,
  InstagramCard,
  TypographicPoster,
  tryParseMediaUrl,
} from "@/features/media";

interface CinemaShowreelProps {
  projects: PublicProject[];
}

export function CinemaShowreel({ projects }: CinemaShowreelProps) {
  const featured = projects.find((p) => p.featured) || projects[0];

  if (!featured) {
    return null;
  }

  const parsed = tryParseMediaUrl(featured.sourceUrl);

  const renderPlayer = () => {
    if (featured.sourceType === "youtube" && parsed?.id) {
      return (
        <YouTubePlayer
          videoId={parsed.id}
          title={featured.title}
          posterUrl={featured.thumbnailUrl || undefined}
          fallbackIndex="00"
          category={featured.category}
          client={featured.client}
          year={featured.year}
          className="w-full aspect-video"
        />
      );
    }

    if (featured.sourceType === "google_drive") {
      return (
        <DrivePlayer
          url={featured.sourceUrl}
          fileId={parsed?.id}
          canonicalUrl={parsed?.canonicalUrl}
          title={featured.title}
          posterUrl={featured.thumbnailUrl || undefined}
          index="00"
          category={featured.category}
          client={featured.client}
          year={featured.year}
          autoLoadOnIntersect={false}
          className="w-full aspect-video"
        />
      );
    }

    if (featured.sourceType === "instagram") {
      return (
        <div className="flex justify-center bg-black/40 py-6">
          <InstagramCard
            url={featured.sourceUrl}
            canonicalUrl={parsed?.canonicalUrl}
            title={featured.title}
            posterUrl={featured.thumbnailUrl || undefined}
            index="00"
            category={featured.category}
            client={featured.client}
            year={featured.year}
          />
        </div>
      );
    }

    return (
      <TypographicPoster
        index="00"
        title={featured.title}
        category={featured.category}
        client={featured.client}
        year={featured.year}
        aspectRatio="16/9"
        className="w-full aspect-video"
      />
    );
  };

  return (
    <section
      data-testid="cinema-showreel"
      className="relative py-16 sm:py-24 border-b border-white/[0.08]"
    >
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4 font-mono text-xs uppercase tracking-widest text-zinc-400">
        <div className="flex items-center gap-3">
          <span className="text-zinc-600">[ SHOWREEL ]</span>
          <span className="text-white font-semibold">{featured.title}</span>
        </div>
        <div className="flex items-center gap-4 text-zinc-500">
          {featured.category && <span>{featured.category}</span>}
          {featured.client && <span>• {featured.client}</span>}
          {featured.year && <span>• {featured.year}</span>}
        </div>
      </div>

      <div className="relative overflow-hidden bg-[#0A0A0A] border border-white/[0.08] shadow-2xl">
        {renderPlayer()}
      </div>
    </section>
  );
}
