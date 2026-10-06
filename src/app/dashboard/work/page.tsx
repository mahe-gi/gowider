import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAuth, getCurrentProfile } from "@/lib/auth-guards";
import { getProjectsForProfile } from "@/features/projects";
import { WorkTable } from "@/components/dashboard/work-table";
import { EmptyState } from "@/components/dashboard/empty-state";

export default async function WorkManagerPage() {
  const { user } = await requireAuth();

  const profile = await getCurrentProfile(user.id);

  if (!profile) {
    redirect("/onboarding");
  }

  const projectsList = await getProjectsForProfile(profile.id);

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
