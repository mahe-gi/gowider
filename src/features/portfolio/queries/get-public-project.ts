import { computeProjectNavigation } from "../mappers";
import { getPublicPortfolio } from "./get-public-portfolio";
import type { PublicProjectDetail } from "../types";

/**
 * Resolves a published project by slug under a published profile,
 * computing previous/next project navigation bridges.
 * Returns null if the profile or project is unpublished or missing.
 */
export async function getPublicProject(
  username: string,
  slug: string
): Promise<PublicProjectDetail | null> {
  if (!username || !slug || typeof username !== "string" || typeof slug !== "string") {
    return null;
  }

  const cleanSlug = slug.trim();
  const portfolio = await getPublicPortfolio(username);
  if (!portfolio) {
    return null;
  }

  const currentProject = portfolio.projects.find((p) => p.slug === cleanSlug);
  if (!currentProject) {
    return null;
  }

  const navigation = computeProjectNavigation(portfolio.projects, cleanSlug);

  return {
    project: currentProject,
    profile: portfolio.profile,
    settings: portfolio.settings,
    navigation,
  };
}
