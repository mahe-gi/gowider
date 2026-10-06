import type { Project } from "@/db/schema";

export type ProjectItem = Project;

export interface CreateProjectInput {
  title: string;
  sourceUrl: string;
  sourceType?: "youtube" | "instagram" | "google_drive";
  thumbnailUrl?: string | null;
  category: string;
  client?: string | null;
  year?: number | null;
  description?: string | null;
  tools?: string[];
  featured?: boolean;
  isPublished?: boolean;
  slug?: string;
}

export interface UpdateProjectInput {
  id: string;
  title?: string;
  sourceUrl?: string;
  sourceType?: "youtube" | "instagram" | "google_drive";
  thumbnailUrl?: string | null;
  category?: string;
  client?: string | null;
  year?: number | null;
  description?: string | null;
  tools?: string[];
  featured?: boolean;
  isPublished?: boolean;
  slug?: string;
}

export interface ReorderProjectsInput {
  profileId: string;
  projectIds: string[];
}
