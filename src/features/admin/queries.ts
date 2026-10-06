import { eq, desc, count } from "drizzle-orm";
import { db } from "@/db";
import { user, profiles, projects, reports } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-guards";
import type {
  AdminMetrics,
  AdminUser,
  AdminProfile,
  AdminProject,
  AdminReport,
} from "./types";

/**
 * Returns high-level platform metrics for the admin command center.
 * Strictly enforces requireAdmin().
 */
export async function getAdminMetrics(): Promise<AdminMetrics> {
  await requireAdmin();

  const [[userCount], [liveProfCount], [totalProfCount], [pubProjCount], [totalProjCount], [pendingRepCount], [resolvedRepCount]] =
    await Promise.all([
      db.select({ count: count() }).from(user),
      db.select({ count: count() }).from(profiles).where(eq(profiles.isPublished, true)),
      db.select({ count: count() }).from(profiles),
      db.select({ count: count() }).from(projects).where(eq(projects.isPublished, true)),
      db.select({ count: count() }).from(projects),
      db.select({ count: count() }).from(reports).where(eq(reports.status, "pending")),
      db.select({ count: count() }).from(reports).where(eq(reports.status, "resolved")),
    ]);

  return {
    totalUsers: Number(userCount?.count || 0),
    liveProfiles: Number(liveProfCount?.count || 0),
    totalProfiles: Number(totalProfCount?.count || 0),
    publishedProjects: Number(pubProjCount?.count || 0),
    totalProjects: Number(totalProjCount?.count || 0),
    pendingReports: Number(pendingRepCount?.count || 0),
    resolvedReports: Number(resolvedRepCount?.count || 0),
  };
}

/**
 * Returns users with their linked profiles.
 * Strictly enforces requireAdmin().
 */
export async function getAdminUsers(): Promise<AdminUser[]> {
  await requireAdmin();

  const dbUsers = await db.query.user.findMany({
    orderBy: [desc(user.createdAt)],
    with: {
      profile: true,
    },
  });

  return dbUsers.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    createdAt: u.createdAt,
    profile: u.profile
      ? {
          id: u.profile.id,
          username: u.profile.username,
          isPublished: u.profile.isPublished,
        }
      : null,
  }));
}

/**
 * Returns all creator profiles with project counts.
 * Strictly enforces requireAdmin().
 */
export async function getAdminProfiles(): Promise<AdminProfile[]> {
  await requireAdmin();

  const dbProfiles = await db.query.profiles.findMany({
    orderBy: [desc(profiles.createdAt)],
    with: {
      user: true,
      projects: true,
    },
  });

  return dbProfiles.map((p) => ({
    id: p.id,
    userId: p.userId,
    username: p.username,
    displayName: p.displayName,
    isPublished: p.isPublished,
    projectCount: p.projects?.length || 0,
    createdAt: p.createdAt,
    userEmail: p.user?.email || null,
  }));
}

/**
 * Returns all projects across all creators.
 * Strictly enforces requireAdmin().
 */
export async function getAdminProjects(): Promise<AdminProject[]> {
  await requireAdmin();

  const dbProjects = await db.query.projects.findMany({
    orderBy: [desc(projects.createdAt)],
    with: {
      profile: true,
    },
  });

  return dbProjects.map((proj) => ({
    id: proj.id,
    profileId: proj.profileId,
    slug: proj.slug,
    title: proj.title,
    category: proj.category,
    sourceType: proj.sourceType,
    sourceUrl: proj.sourceUrl,
    isPublished: proj.isPublished,
    featured: proj.featured,
    createdAt: proj.createdAt,
    creatorUsername: proj.profile?.username || "unknown",
    creatorDisplayName: proj.profile?.displayName || "Unknown Creator",
  }));
}

/**
 * Returns abuse reports queue with target entities.
 * Strictly enforces requireAdmin().
 */
export async function getAdminReports(): Promise<AdminReport[]> {
  await requireAdmin();

  const dbReports = await db.query.reports.findMany({
    orderBy: [desc(reports.createdAt)],
    with: {
      profile: true,
      project: true,
    },
  });

  return dbReports.map((r) => ({
    id: r.id,
    reporterIpHash: r.reporterIpHash,
    profileId: r.profileId,
    projectId: r.projectId,
    reason: r.reason,
    description: r.description,
    status: r.status,
    resolvedBy: r.resolvedBy,
    resolvedAt: r.resolvedAt,
    createdAt: r.createdAt,
    targetProfile: {
      id: r.profile.id,
      username: r.profile.username,
      displayName: r.profile.displayName,
      isPublished: r.profile.isPublished,
    },
    targetProject: r.project
      ? {
          id: r.project.id,
          slug: r.project.slug,
          title: r.project.title,
          isPublished: r.project.isPublished,
        }
      : null,
  }));
}
