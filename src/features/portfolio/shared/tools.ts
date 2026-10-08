import type { PublicSkill, PublicProject } from "../types";

/**
 * Resolves the display tools for a portfolio.
 * Prefers explicitly curated skills/software from profile.
 * Falls back to extracting distinct project tools from published projects if profile skills is empty.
 */
export function resolveDisplayTools(
  skills: PublicSkill[] = [],
  projects: PublicProject[] = []
): PublicSkill[] {
  if (skills && skills.length > 0) {
    return skills;
  }

  const projectToolNames = Array.from(
    new Set(
      projects
        .flatMap((p) => p.tools || [])
        .map((t) => t.trim())
        .filter(Boolean)
    )
  );

  return projectToolNames.map((name) => ({ name }));
}
