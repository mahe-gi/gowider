import Link from "next/link";
import { getAdminProjects } from "@/features/admin/queries";
import { ProjectsTable } from "./projects-table";

export default async function AdminProjectsPage() {
  const projects = await getAdminProjects();

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="font-mono text-xs text-zinc-500 hover:text-zinc-300"
          >
            ← COMMAND CENTER
          </Link>
          <span className="text-zinc-700">/</span>
          <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">
            PROJECTS
          </span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-2">
          PROJECT MODERATION ({projects.length})
        </h1>
        <p className="text-zinc-400 text-xs sm:text-sm mt-1">
          Inspect and moderate showcase case studies across YouTube, Instagram, and Drive.
        </p>
      </div>

      <ProjectsTable initialProjects={projects} />
    </div>
  );
}
