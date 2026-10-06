import type { MetadataRoute } from "next";
import { db } from "@/db";
import { profiles } from "@/db/schema/profiles";
import { projects } from "@/db/schema/projects";
import { eq, and } from "drizzle-orm";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gowider.in";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${appUrl}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${appUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${appUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${appUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  try {
    // Query published profiles
    const publishedProfiles = await db
      .select({
        username: profiles.username,
        updatedAt: profiles.updatedAt,
      })
      .from(profiles)
      .where(eq(profiles.isPublished, true));

    const profileRoutes: MetadataRoute.Sitemap = publishedProfiles.map((p) => ({
      url: `${appUrl}/${p.username}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    // Query published projects under published profiles
    const publishedProjects = await db
      .select({
        slug: projects.slug,
        username: profiles.username,
        updatedAt: projects.updatedAt,
      })
      .from(projects)
      .innerJoin(profiles, eq(projects.profileId, profiles.id))
      .where(
        and(
          eq(projects.isPublished, true),
          eq(profiles.isPublished, true)
        )
      );

    const projectRoutes: MetadataRoute.Sitemap = publishedProjects.map((proj) => ({
      url: `${appUrl}/${proj.username}/work/${proj.slug}`,
      lastModified: proj.updatedAt ? new Date(proj.updatedAt) : new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    }));

    return [...staticRoutes, ...profileRoutes, ...projectRoutes];
  } catch {
    // If DB is offline or in build environment, return static routes safely
    return staticRoutes;
  }
}
