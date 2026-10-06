import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { env } from "@/env";
import {
  getPublicPortfolio,
  PortfolioRenderer,
} from "@/features/portfolio";
import { generatePersonJsonLd } from "@/features/portfolio/seo";

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  const portfolio = await getPublicPortfolio(username);

  if (!portfolio) {
    return {
      title: "Portfolio Not Found | GoWider",
      description: "This portfolio is not available or has not been published.",
    };
  }

  const { profile, projects } = portfolio;
  const title = `${profile.displayName} — ${profile.headline}`;
  const description = profile.bio || profile.headline;
  const canonicalUrl = `${env.NEXT_PUBLIC_APP_URL}/${profile.username}`;

  // Use avatar or first project thumbnail as OpenGraph image fallback
  const firstThumbnail = projects.find((p) => p.thumbnailUrl)?.thumbnailUrl;
  const ogImage = profile.avatarUrl || firstThumbnail;
  const images = ogImage ? [{ url: ogImage, alt: title }] : [];

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "GoWider",
      images,
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
  };
}

export default async function PublicPortfolioPage({ params }: PageProps) {
  const { username } = await params;
  const portfolio = await getPublicPortfolio(username);

  if (!portfolio) {
    notFound();
  }

  const jsonLd = generatePersonJsonLd(portfolio);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PortfolioRenderer portfolio={portfolio} />
    </>
  );
}
