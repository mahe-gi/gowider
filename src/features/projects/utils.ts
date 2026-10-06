import slugify from "slugify";
import { eq, and, ne } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema/projects";

/**
 * Deterministically generates a URL-safe project slug.
 * Sticking to lowercase alphanumeric characters with single hyphens, max 100 characters.
 */
export function generateDeterministicProjectSlug(
  title: string,
  attempt = 0
): string {
  let base = slugify(title, {
    lower: true,
    strict: true,
    trim: true,
  });

  // Ensure slug matches pattern ^[a-z0-9]+(-[a-z0-9]+)*$
  base = base.replace(/^-+|-+$/g, "");
  if (!base) {
    base = "project";
  }

  if (attempt === 0) {
    return base.slice(0, 100);
  }

  const suffix = `-${attempt}`;
  const maxBaseLen = 100 - suffix.length;
  return `${base.slice(0, maxBaseLen)}${suffix}`;
}

/**
 * Resolves a unique slug for a given profile with retry logic.
 */
export async function resolveUniqueProjectSlug(
  profileId: string,
  title: string,
  excludeProjectId?: string,
  dbClient = db
): Promise<string> {
  let attempt = 0;
  const maxAttempts = 100;

  while (attempt < maxAttempts) {
    const candidate = generateDeterministicProjectSlug(title, attempt);
    const conditions = [
      eq(projects.profileId, profileId),
      eq(projects.slug, candidate),
    ];

    if (excludeProjectId) {
      conditions.push(ne(projects.id, excludeProjectId));
    }

    const [existing] = await dbClient
      .select({ id: projects.id })
      .from(projects)
      .where(and(...conditions))
      .limit(1);

    if (!existing) {
      return candidate;
    }

    attempt++;
  }

  // Fallback with timestamp hash if collisions exceed 100
  const timestampSuffix = `-${Date.now().toString(36)}`;
  const base = generateDeterministicProjectSlug(title, 0);
  return `${base.slice(0, 100 - timestampSuffix.length)}${timestampSuffix}`;
}
