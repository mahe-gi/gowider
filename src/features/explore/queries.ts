import { and, eq, or, ilike, asc, desc } from "drizzle-orm";
import { db } from "@/db";
import { profiles, projects } from "@/db/schema";
import type {
  ExploreCreator,
  GetExploreCreatorsParams,
  ExploreFeaturedProject,
} from "./types";

interface DbProjectForExplore {
  id?: unknown;
  profileId?: unknown;
  title: string;
  thumbnailUrl: string | null;
  category: string;
  featured: boolean;
  isPublished: boolean;
  sortOrder: number;
  createdAt: Date;
}

interface DbProfileForExplore {
  id?: unknown;
  userId?: unknown;
  email?: unknown;
  username: string;
  displayName: string;
  headline: string;
  location: string | null;
  avatarUrl: string | null;
  isPublished: boolean;
  projects?: DbProjectForExplore[];
}

/**
 * Sanitizes a database profile and projects into a clean public ExploreCreator.
 * Strictly guarantees that ZERO database UUIDs, user IDs, emails, or internal fields are exposed.
 */
export function toExploreCreator(
  profile: DbProfileForExplore,
  creatorProjects: DbProjectForExplore[]
): ExploreCreator {
  const publishedProjects = creatorProjects.filter((p) => p.isPublished);

  const featured =
    publishedProjects.find((p) => p.featured) || publishedProjects[0] || null;

  const featuredProject: ExploreFeaturedProject | null = featured
    ? {
        title: featured.title,
        thumbnailUrl: featured.thumbnailUrl,
        category: featured.category,
      }
    : null;

  return {
    username: profile.username,
    displayName: profile.displayName,
    headline: profile.headline,
    location: profile.location,
    avatarUrl: profile.avatarUrl,
    projectCount: publishedProjects.length,
    featuredProject,
  };
}

/**
 * Fetches published creators who have at least one published project.
 * Supports optional text search (displayName, headline, username) and category filter.
 */
export async function getExploreCreators(
  params: GetExploreCreatorsParams = {}
): Promise<ExploreCreator[]> {
  const { search, category, limit = 24 } = params;

  const searchTrimmed = search?.trim();
  const categoryTrimmed = category?.trim().toLowerCase();

  const searchCondition = searchTrimmed
    ? or(
        ilike(profiles.displayName, `%${searchTrimmed}%`),
        ilike(profiles.headline, `%${searchTrimmed}%`),
        ilike(profiles.username, `%${searchTrimmed}%`)
      )
    : undefined;

  const dbProfiles = await db.query.profiles.findMany({
    where: and(eq(profiles.isPublished, true), searchCondition),
    with: {
      projects: {
        where: eq(projects.isPublished, true),
        orderBy: [asc(projects.sortOrder), desc(projects.createdAt)],
      },
    },
    orderBy: [desc(profiles.createdAt)],
  });

  const matchingCreators: ExploreCreator[] = [];

  for (const prof of dbProfiles) {
    const pubProjects = (prof.projects || []).filter((p) => p.isPublished);

    // Rule: Must have at least ONE published project
    if (pubProjects.length === 0) {
      continue;
    }

    // Category filter: at least one published project must match the category
    if (
      categoryTrimmed &&
      categoryTrimmed !== "all" &&
      !pubProjects.some(
        (p) => p.category.toLowerCase() === categoryTrimmed
      )
    ) {
      continue;
    }

    matchingCreators.push(toExploreCreator(prof, pubProjects));

    if (matchingCreators.length >= limit) {
      break;
    }
  }

  return matchingCreators;
}
