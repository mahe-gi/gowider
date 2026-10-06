import type { PublicPortfolioData, PublicProjectDetail } from "./types";

/**
 * Generates Schema.org Person JSON-LD for a creator portfolio.
 */
export function generatePersonJsonLd(portfolio: PublicPortfolioData) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gowider.in";
  const { profile, socialLinks, skills } = portfolio;

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.displayName,
    jobTitle: profile.headline,
    description: profile.bio || profile.headline,
    url: `${appUrl}/${profile.username}`,
    image: profile.avatarUrl || undefined,
    homeLocation: profile.location
      ? {
          "@type": "Place",
          name: profile.location,
        }
      : undefined,
    sameAs: socialLinks.map((s) => s.url),
    knowsAbout: skills.map((s) => s.name),
  };
}

/**
 * Generates Schema.org VideoObject JSON-LD for a project case-study.
 */
export function generateVideoJsonLd(detail: PublicProjectDetail) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gowider.in";
  const { project, profile } = detail;

  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: project.title,
    description: project.description || `${project.title} - Video editing work by ${profile.displayName}`,
    thumbnailUrl: project.thumbnailUrl ? [project.thumbnailUrl] : undefined,
    contentUrl: project.sourceUrl,
    embedUrl: project.sourceType === "youtube" ? project.sourceUrl : undefined,
    author: {
      "@type": "Person",
      name: profile.displayName,
      url: `${appUrl}/${profile.username}`,
    },
  };
}
