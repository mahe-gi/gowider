export interface AdminMetrics {
  totalUsers: number;
  liveProfiles: number;
  totalProfiles: number;
  publishedProjects: number;
  totalProjects: number;
  pendingReports: number;
  resolvedReports: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  profile: {
    id: string;
    username: string;
    isPublished: boolean;
  } | null;
}

export interface AdminProfile {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  isPublished: boolean;
  projectCount: number;
  createdAt: Date;
  userEmail: string | null;
}

export interface AdminProject {
  id: string;
  profileId: string;
  slug: string;
  title: string;
  category: string;
  sourceType: string;
  sourceUrl: string;
  isPublished: boolean;
  featured: boolean;
  createdAt: Date;
  creatorUsername: string;
  creatorDisplayName: string;
}

export interface AdminReport {
  id: string;
  reporterIpHash: string;
  profileId: string;
  projectId: string | null;
  reason: string;
  description: string | null;
  status: "pending" | "resolved" | "dismissed";
  resolvedBy: string | null;
  resolvedAt: Date | null;
  createdAt: Date;
  targetProfile: {
    id: string;
    username: string;
    displayName: string;
    isPublished: boolean;
  };
  targetProject: {
    id: string;
    slug: string;
    title: string;
    isPublished: boolean;
  } | null;
}
