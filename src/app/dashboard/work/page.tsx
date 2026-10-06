import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAuth, getCurrentProfile } from "@/lib/auth-guards";
import { getProjectsForProfile } from "@/features/projects";
import { isProProfile } from "@/features/billing/subscription-service";
import { WorkTable } from "@/components/dashboard/work-table";
import { EmptyState } from "@/components/dashboard/empty-state";

export default async function WorkManagerPage() {
  const { user } = await requireAuth();

  const profile = await getCurrentProfile(user.id);

  if (!profile) {
    redirect("/onboarding");
  }

  const [projectsList, isPro] = await Promise.all([
    getProjectsForProfile(profile.id),
    isProProfile(profile.id),
  ]);

  const publishedCount = projectsList.filter((p) => p.isPublished).length;

  return (
    <div data-testid="work-manager-page" className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Work</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage your project portfolio, reorder items, and configure live publication.
          </p>
        </div>
        <div>
          <Link
            href="/dashboard/work/new"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            <span>+</span>
            <span>Add Project</span>
          </Link>
        </div>
      </div>

      {/* Plan Publication Capacity Banner */}
      {isPro ? (
        <div className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-amber-400">[PRO ACTIVE]</span>
            <span className="text-white font-medium">{publishedCount} projects published</span>
            <span className="text-zinc-500">•</span>
            <span className="text-amber-200/80">Unlimited publishing enabled</span>
          </div>
          <Link
            href="/dashboard/billing"
            className="text-zinc-400 hover:text-white transition"
          >
            Manage Subscription →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-xs">
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="font-semibold text-white">Free Plan:</span>
            <span>{publishedCount} of 6 published slots used</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">Unlimited drafts allowed</span>
          </div>
          <Link
            href="/dashboard/billing"
            className="font-semibold text-amber-400 hover:text-amber-300 transition inline-flex items-center gap-1"
          >
            <span>Upgrade to Pro for Unlimited</span>
            <span>→</span>
          </Link>
        </div>
      )}

      {/* Projects Table or Empty State */}
      {projectsList.length === 0 ? (
        <EmptyState
          title="No projects in your portfolio"
          description="Add your first video work from YouTube, Instagram, or Google Drive."
          actionText="Add New Project"
          actionHref="/dashboard/work/new"
        />
      ) : (
        <WorkTable profileId={profile.id} initialProjects={projectsList} />
      )}
    </div>
  );
}
