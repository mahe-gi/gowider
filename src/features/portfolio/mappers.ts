import type {
  PortfolioData,
  PublicPortfolioData,
  PublicProject,
  PublicSocialLink,
  PublicService,
  PublicSkill,
  PublicPortfolioSettings,
  ProjectNavBridge,
} from "./types";

interface DbProjectInput {
  slug?: unknown;
  title?: unknown;
  description?: unknown;
  sourceType?: unknown;
  sourceUrl?: unknown;
  thumbnailUrl?: unknown;
  category?: unknown;
  client?: unknown;
  year?: unknown;
  tools?: unknown;
  featured?: unknown;
  isPublished?: unknown;
  sortOrder?: unknown;
  createdAt?: unknown;
  id?: unknown;
  profileId?: unknown;
  publishedAt?: unknown;
  updatedAt?: unknown;
}

interface DbSocialLinkInput {
  platform?: unknown;
  url?: unknown;
  sortOrder?: unknown;
  id?: unknown;
  profileId?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
}

interface DbServiceInput {
  name?: unknown;
  sortOrder?: unknown;
  id?: unknown;
  profileId?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
}

interface DbSkillInput {
  name?: unknown;
  sortOrder?: unknown;
  id?: unknown;
  profileId?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
}

interface DbSettingsInput {
  theme?: unknown;
  motionLevel?: unknown;
  accentColor?: unknown;
  hideBranding?: unknown;
  id?: unknown;
  profileId?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface DbProfileInput {
  username?: unknown;
  displayName?: unknown;
  headline?: unknown;
  bio?: unknown;
  avatarUrl?: unknown;
  location?: unknown;
  availability?: unknown;
  isPublished?: unknown;
  id?: unknown;
  userId?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
  projects?: DbProjectInput[];
  socialLinks?: DbSocialLinkInput[];
  services?: DbServiceInput[];
  skills?: DbSkillInput[];
  settings?: DbSettingsInput | null;
}

/**
 * Strips all internal database UUIDs, user IDs, emails, session info, timestamps,
 * and unpublished draft projects to produce a completely sanitized public projection.
 */
export function toPublicPortfolioData(dbProfile: DbProfileInput): PublicPortfolioData {
  if (!dbProfile) {
    throw new Error("Cannot map null or undefined profile to PublicPortfolioData");
  }

  // Filter only published projects and sort them by sortOrder ascending
  const rawProjects = Array.isArray(dbProfile.projects) ? dbProfile.projects : [];
  const publishedProjects = rawProjects
    .filter((p) => p.isPublished === true || p.isPublished === undefined)
    .sort((a, b) => {
      const orderA = typeof a.sortOrder === "number" ? a.sortOrder : 0;
      const orderB = typeof b.sortOrder === "number" ? b.sortOrder : 0;
      const orderDiff = orderA - orderB;
      if (orderDiff !== 0) return orderDiff;
      const aTime = a.createdAt ? new Date(String(a.createdAt)).getTime() : 0;
      const bTime = b.createdAt ? new Date(String(b.createdAt)).getTime() : 0;
      return bTime - aTime;
    });

  const projects: PublicProject[] = publishedProjects.map((p) => ({
    slug: String(p.slug || ""),
    title: String(p.title || ""),
    description: p.description ? String(p.description) : null,
    sourceType: (p.sourceType as "youtube" | "instagram" | "google_drive") || "youtube",
    sourceUrl: String(p.sourceUrl || ""),
    thumbnailUrl: p.thumbnailUrl ? String(p.thumbnailUrl) : null,
    category: String(p.category || ""),
    client: p.client ? String(p.client) : null,
    year: p.year != null ? Number(p.year) : null,
    tools: Array.isArray(p.tools) ? p.tools.map(String) : [],
    featured: Boolean(p.featured),
    sortOrder: typeof p.sortOrder === "number" ? p.sortOrder : 0,
  }));

  // Map social links, sorting by sortOrder, strictly filtering out email / mailto links
  const rawLinks = Array.isArray(dbProfile.socialLinks) ? dbProfile.socialLinks : [];
  const sortedLinks = [...rawLinks].sort((a, b) => {
    const orderA = typeof a.sortOrder === "number" ? a.sortOrder : 0;
    const orderB = typeof b.sortOrder === "number" ? b.sortOrder : 0;
    return orderA - orderB;
  });

  const socialLinks: PublicSocialLink[] = sortedLinks
    .filter((link) => {
      if (!link || !link.url) return false;
      const platform = String(link.platform).toLowerCase();
      const url = String(link.url).toLowerCase();
      return platform !== "email" && !url.startsWith("mailto:");
    })
    .map((link) => ({
      platform: link.platform as PublicSocialLink["platform"],
      url: String(link.url),
    }));

  // Map services
  const rawServices = Array.isArray(dbProfile.services) ? dbProfile.services : [];
  const sortedServices = [...rawServices].sort((a, b) => {
    const orderA = typeof a.sortOrder === "number" ? a.sortOrder : 0;
    const orderB = typeof b.sortOrder === "number" ? b.sortOrder : 0;
    return orderA - orderB;
  });
  const services: PublicService[] = sortedServices.map((svc) => ({
    name: String(svc.name || ""),
  }));

  // Map skills
  const rawSkills = Array.isArray(dbProfile.skills) ? dbProfile.skills : [];
  const sortedSkills = [...rawSkills].sort((a, b) => {
    const orderA = typeof a.sortOrder === "number" ? a.sortOrder : 0;
    const orderB = typeof b.sortOrder === "number" ? b.sortOrder : 0;
    return orderA - orderB;
  });
  const skills: PublicSkill[] = sortedSkills.map((sk) => ({
    name: String(sk.name || ""),
  }));

  // Map settings with safe defaults
  const settings: PublicPortfolioSettings = {
    theme: (dbProfile.settings?.theme as PublicPortfolioSettings["theme"]) || "cinema",
    motionLevel: (dbProfile.settings?.motionLevel as PublicPortfolioSettings["motionLevel"]) || "full",
    accentColor: String(dbProfile.settings?.accentColor || "#E5E5E5"),
    hideBranding: Boolean(dbProfile.settings?.hideBranding),
  };

  return {
    profile: {
      username: String(dbProfile.username || ""),
      displayName: String(dbProfile.displayName || ""),
      headline: String(dbProfile.headline || ""),
      bio: dbProfile.bio ? String(dbProfile.bio) : null,
      avatarUrl: dbProfile.avatarUrl ? String(dbProfile.avatarUrl) : null,
      location: dbProfile.location ? String(dbProfile.location) : null,
      availability: dbProfile.availability ? String(dbProfile.availability) : null,
      isPublished: Boolean(dbProfile.isPublished),
    },
    projects,
    socialLinks,
    services,
    skills,
    settings,
  };
}

/**
 * Preserves internal database IDs for dashboard editing and authenticated preview.
 */
export function toPortfolioData(dbProfile: DbProfileInput): PortfolioData {
  if (!dbProfile) {
    throw new Error("Cannot map null or undefined profile to PortfolioData");
  }

  const rawProjects = Array.isArray(dbProfile.projects) ? dbProfile.projects : [];
  const rawLinks = Array.isArray(dbProfile.socialLinks) ? dbProfile.socialLinks : [];
  const rawServices = Array.isArray(dbProfile.services) ? dbProfile.services : [];
  const rawSkills = Array.isArray(dbProfile.skills) ? dbProfile.skills : [];

  return {
    profile: {
      id: String(dbProfile.id || ""),
      userId: String(dbProfile.userId || ""),
      username: String(dbProfile.username || ""),
      displayName: String(dbProfile.displayName || ""),
      headline: String(dbProfile.headline || ""),
      bio: (dbProfile.bio as string | null) ?? null,
      avatarUrl: (dbProfile.avatarUrl as string | null) ?? null,
      location: (dbProfile.location as string | null) ?? null,
      availability: (dbProfile.availability as string | null) ?? null,
      isPublished: Boolean(dbProfile.isPublished),
      createdAt: dbProfile.createdAt as Date,
      updatedAt: dbProfile.updatedAt as Date,
    },
    projects: rawProjects.map((p) => ({
      id: String(p.id || ""),
      profileId: String(p.profileId || ""),
      slug: String(p.slug || ""),
      title: String(p.title || ""),
      description: (p.description as string | null) ?? null,
      sourceType: (p.sourceType as "youtube" | "instagram" | "google_drive") || "youtube",
      sourceUrl: String(p.sourceUrl || ""),
      thumbnailUrl: (p.thumbnailUrl as string | null) ?? null,
      category: String(p.category || ""),
      client: (p.client as string | null) ?? null,
      year: p.year != null ? Number(p.year) : null,
      tools: Array.isArray(p.tools) ? p.tools.map(String) : [],
      featured: Boolean(p.featured),
      isPublished: Boolean(p.isPublished),
      publishedAt: (p.publishedAt as Date | null) ?? null,
      sortOrder: typeof p.sortOrder === "number" ? p.sortOrder : 0,
      createdAt: p.createdAt as Date,
      updatedAt: p.updatedAt as Date,
    })),
    socialLinks: rawLinks.map((s) => ({
      id: String(s.id || ""),
      profileId: String(s.profileId || ""),
      platform: s.platform as PublicSocialLink["platform"],
      url: String(s.url || ""),
      sortOrder: typeof s.sortOrder === "number" ? s.sortOrder : 0,
      createdAt: s.createdAt as Date,
      updatedAt: s.updatedAt as Date,
    })),
    services: rawServices.map((s) => ({
      id: String(s.id || ""),
      profileId: String(s.profileId || ""),
      name: String(s.name || ""),
      sortOrder: typeof s.sortOrder === "number" ? s.sortOrder : 0,
      createdAt: s.createdAt as Date,
      updatedAt: s.updatedAt as Date,
    })),
    skills: rawSkills.map((s) => ({
      id: String(s.id || ""),
      profileId: String(s.profileId || ""),
      name: String(s.name || ""),
      sortOrder: typeof s.sortOrder === "number" ? s.sortOrder : 0,
      createdAt: s.createdAt as Date,
      updatedAt: s.updatedAt as Date,
    })),
    settings: dbProfile.settings
      ? {
          id: String(dbProfile.settings.id || ""),
          profileId: String(dbProfile.settings.profileId || ""),
          theme: (dbProfile.settings.theme as PublicPortfolioSettings["theme"]) || "cinema",
          motionLevel: (dbProfile.settings.motionLevel as PublicPortfolioSettings["motionLevel"]) || "full",
          accentColor: String(dbProfile.settings.accentColor || "#E5E5E5"),
          hideBranding: Boolean(dbProfile.settings.hideBranding),
          createdAt: dbProfile.settings.createdAt as Date,
          updatedAt: dbProfile.settings.updatedAt as Date,
        }
      : null,
  };
}

/**
 * Computes previous and next project navigation links for a given project slug
 * within an ordered project list.
 */
export function computeProjectNavigation<T extends { slug: string; title: string }>(
  projects: T[],
  currentSlug: string
): { prev: ProjectNavBridge | null; next: ProjectNavBridge | null } {
  const index = projects.findIndex((p) => p.slug === currentSlug);
  if (index === -1) {
    return { prev: null, next: null };
  }

  return {
    prev:
      index > 0
        ? { slug: projects[index - 1].slug, title: projects[index - 1].title }
        : null,
    next:
      index < projects.length - 1
        ? { slug: projects[index + 1].slug, title: projects[index + 1].title }
        : null,
  };
}
