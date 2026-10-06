import React from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema/projects";
import { requireAuth, getCurrentProfile } from "@/lib/auth-guards";
import { ProjectEditorForm } from "./editor-form";

interface EditProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { projectId } = await params;
  const { user } = await requireAuth();

  const profile = await getCurrentProfile(user.id);

  if (!profile) {
    redirect("/onboarding");
  }

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project || project.profileId !== profile.id) {
    notFound();
  }

  return (
    <div data-testid="edit-project-page" className="space-y-6">
      {/* Breadcrumb Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
          <Link href="/dashboard/work" className="hover:text-zinc-300 transition">
            Work
          </Link>
          <span>/</span>
          <span className="text-zinc-300">{project.title}</span>
          <span>/</span>
          <span className="text-zinc-400">Edit</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Edit Project
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Update project details, category metadata, and publication status.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {project.isPublished && (
              <a
                href={`/${profile.username}/${project.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition"
              >
                <span>View Live Work</span>
                <span>↗</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Split Screen Editor: Form on Left, Media Poster Preview on Right */}
      <ProjectEditorForm project={project} username={profile.username} />
    </div>
  );
}
