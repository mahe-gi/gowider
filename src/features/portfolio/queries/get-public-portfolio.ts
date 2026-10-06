import { db } from "@/db";
import { toPublicPortfolioData } from "../mappers";
import type { PublicPortfolioData } from "../types";

/**
 * Resolves a published profile by username with published projects,
 * social links, services, skills, and portfolio settings.
 * Returns null if the profile does not exist or is not published.
 */
export async function getPublicPortfolio(
  username: string
): Promise<PublicPortfolioData | null> {
  if (!username || typeof username !== "string" || !username.trim()) {
    return null;
  }

  const cleanUsername = username.trim().toLowerCase();

  try {
    const profile = await db.query.profiles.findFirst({
      where: (table, { eq, and, sql }) =>
        and(
          eq(sql`lower(${table.username})`, cleanUsername),
          eq(table.isPublished, true)
        ),
      with: {
        projects: {
          where: (proj, { eq }) => eq(proj.isPublished, true),
          orderBy: (proj, { asc, desc }) => [
            asc(proj.sortOrder),
            desc(proj.createdAt),
          ],
        },
        socialLinks: {
          orderBy: (link, { asc }) => [asc(link.sortOrder)],
        },
        services: {
          orderBy: (svc, { asc }) => [asc(svc.sortOrder)],
        },
        skills: {
          orderBy: (sk, { asc }) => [asc(sk.sortOrder)],
        },
        settings: true,
      },
    });

    if (!profile) {
      return null;
    }

    return toPublicPortfolioData(profile);
  } catch (error) {
    console.error("Error executing getPublicPortfolio query:", error);
    return null;
  }
}
