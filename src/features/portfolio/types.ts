import type {
  Profile,
  Project,
  SocialLink,
  Service,
  Skill,
  PortfolioSettings,
} from "@/db/schema";

/**
 * Internal portfolio data structure retaining database IDs.
 * Used by dashboard management and authenticated draft preview.
 */
export type PortfolioProfile = Profile;
export type PortfolioProject = Project;
export type PortfolioSocialLink = SocialLink;
export type PortfolioService = Service;
export type PortfolioSkill = Skill;
export type PortfolioSettingsData = PortfolioSettings;

export interface PortfolioData {
  profile: PortfolioProfile;
  projects: PortfolioProject[];
  socialLinks: PortfolioSocialLink[];
  services: PortfolioService[];
  skills: PortfolioSkill[];
  settings: PortfolioSettingsData | null;
}

/**
 * Sanitized public projection contract strictly stripping all internal database UUIDs,
 * user IDs, emails, session info, timestamps, and draft projects.
 */
export interface PublicProject {
  slug: string;
  title: string;
  description: string | null;
  sourceType: "youtube" | "instagram" | "google_drive";
  sourceUrl: string;
  thumbnailUrl: string | null;
  category: string;
  client: string | null;
  year: number | null;
  tools: string[];
  featured: boolean;
  sortOrder: number;
}

export interface PublicSocialLink {
  platform: "instagram" | "youtube" | "linkedin" | "x" | "whatsapp" | "website";
  url: string;
}

export interface PublicService {
  name: string;
}

export interface PublicSkill {
  name: string;
}

export interface PublicPortfolioSettings {
  theme: "cinema" | "editorial" | "studio";
  motionLevel: "full" | "reduced";
  accentColor: string;
}

export interface PublicProfile {
  username: string;
  displayName: string;
  headline: string;
  bio: string | null;
  avatarUrl: string | null;
  location: string | null;
  availability: string | null;
  isPublished: boolean;
}

export interface PublicPortfolioData {
  profile: PublicProfile;
  projects: PublicProject[];
  socialLinks: PublicSocialLink[];
  services: PublicService[];
  skills: PublicSkill[];
  settings: PublicPortfolioSettings;
}

/**
 * Navigation bridge for sequential project traversal.
 */
export interface ProjectNavBridge {
  slug: string;
  title: string;
}

export interface PublicProjectDetail {
  project: PublicProject;
  profile: PublicProfile;
  settings: PublicPortfolioSettings;
  navigation: {
    prev: ProjectNavBridge | null;
    next: ProjectNavBridge | null;
  };
}

/**
 * Unified portfolio interface that works for both public view and draft preview.
 */
export type UnifiedPortfolioData = PublicPortfolioData | PortfolioData;
