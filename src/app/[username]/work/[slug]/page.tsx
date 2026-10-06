import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { env } from "@/env";
import { getPublicProject, ProjectRenderer } from "@/features/portfolio";
import { generateVideoJsonLd } from "@/features/portfolio/seo";

interface ProjectPageProps {
  params: Promise<{
    username: string;
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { username, slug } = await params;
  const detail = await getPublicProject(username, slug);

  if (!detail) {
    return {
      title: "Project Not Found | GoWider",
      description: "This project is not available or has not been published.",
    };
  }

  const { project, profile } = detail;
  const title = `${project.title} — ${profile.displayName}`;
  const description =
    project.description || `${project.title} by ${profile.displayName}`;
  const canonicalUrl = `${env.NEXT_PUBLIC_APP_URL}/${profile.username}/work/${project.slug}`;
  const images = project.thumbnailUrl
    ? [{ url: project.thumbnailUrl, alt: project.title }]
    : [];

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
      type: "video.other",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: project.thumbnailUrl ? [project.thumbnailUrl] : [],
    },
  };
}

export default async function PublicProjectPage({ params }: ProjectPageProps) {
  const { username, slug } = await params;
  const detail = await getPublicProject(username, slug);

  if (!detail) {
    notFound();
  }

  const jsonLd = generateVideoJsonLd(detail);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProjectRenderer detail={detail} />
    </>
  );
}
