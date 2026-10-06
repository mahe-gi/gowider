"use client";

import { useState } from "react";
import Link from "next/link";
import { unpublishProjectModerationAction } from "@/features/admin/actions/unpublish-project";
import type { AdminProject } from "@/features/admin/types";

interface ProjectsTableProps {
  initialProjects: AdminProject[];
}

export function ProjectsTable({ initialProjects }: ProjectsTableProps) {
  const [projectsList, setProjectsList] = useState(initialProjects);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [search, setSearch] = useState("");

  const handleUnpublish = async (projectId: string, title: string) => {
    if (!confirm(`Are you sure you want to unpublish project "${title}"?`)) {
      return;
    }

    setLoadingId(projectId);
    setMessage(null);

    try {
      const res = await unpublishProjectModerationAction(projectId);
      if (res.success) {
        setProjectsList((prev) =>
          prev.map((p) => (p.id === projectId ? { ...p, isPublished: false } : p))
        );
        setMessage({ text: `Project "${title}" successfully unpublished.` });
      } else {
        setMessage({ text: res.error, error: true });
      }
    } catch {
      setMessage({ text: "Failed to unpublish project.", error: true });
    } finally {
      setLoadingId(null);
    }
  };

  const filteredProjects = projectsList.filter((p) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q) ||
      p.creatorUsername.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by title, slug, creator, category..."
          className="w-full max-w-sm bg-black border border-white/10 px-3.5 py-2 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
        />
        <div className="font-mono text-xs text-zinc-500">
          Showing {filteredProjects.length} of {projectsList.length}
        </div>
      </div>

      {message && (
        <div
          data-testid="admin-projects-feedback"
          className={`p-3 font-mono text-xs border ${
            message.error
              ? "bg-red-950/40 border-red-500/30 text-red-200"
              : "bg-emerald-950/40 border-emerald-500/30 text-emerald-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="border border-white/10 overflow-x-auto bg-black">
        <table className="w-full text-left font-mono text-xs divide-y divide-white/10">
          <thead className="bg-zinc-950 text-zinc-400 uppercase tracking-wider text-[11px]">
            <tr>
              <th scope="col" className="px-6 py-3.5">
                Project
              </th>
              <th scope="col" className="px-6 py-3.5">
                Creator
              </th>
              <th scope="col" className="px-6 py-3.5">
                Category & Source
              </th>
              <th scope="col" className="px-6 py-3.5">
                Status
              </th>
              <th scope="col" className="px-6 py-3.5">
                Created
              </th>
              <th scope="col" className="px-6 py-3.5 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06] text-zinc-300">
            {filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                  No projects found.
                </td>
              </tr>
            ) : (
              filteredProjects.map((proj) => (
                <tr key={proj.id} className="hover:bg-white/[0.02]">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>{proj.title}</span>
                      {proj.featured && (
                        <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[9px] uppercase font-bold tracking-wider">
                          FEATURED
                        </span>
                      )}
                    </div>
                    <div className="text-zinc-500 text-[11px] font-mono">
                      /{proj.slug}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/${proj.creatorUsername}`}
                      target="_blank"
                      className="text-zinc-300 hover:text-white underline decoration-dotted"
                    >
                      @{proj.creatorUsername}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-zinc-200">{proj.category}</div>
                    <div className="text-zinc-500 text-[10px] uppercase">
                      {proj.sourceType}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      data-testid={`project-status-${proj.slug}`}
                      className={`inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider ${
                        proj.isPublished
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-zinc-800 text-zinc-500"
                      }`}
                    >
                      {proj.isPublished ? "PUBLISHED" : "DRAFT"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500 text-[11px]">
                    {new Date(proj.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {proj.isPublished && (
                        <Link
                          href={`/${proj.creatorUsername}/work/${proj.slug}`}
                          target="_blank"
                          className="px-2.5 py-1 text-zinc-400 hover:text-white border border-white/10 hover:border-white/30 text-[10px] uppercase tracking-wider transition-colors"
                        >
                          View ↗
                        </Link>
                      )}
                      {proj.isPublished ? (
                        <button
                          type="button"
                          data-testid={`unpublish-project-${proj.slug}`}
                          disabled={loadingId === proj.id}
                          onClick={() => handleUnpublish(proj.id, proj.title)}
                          className="px-2.5 py-1 bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-200 text-[10px] uppercase tracking-wider transition-colors disabled:opacity-50"
                        >
                          {loadingId === proj.id ? "Unpublishing..." : "Unpublish"}
                        </button>
                      ) : (
                        <span className="text-zinc-600 text-[11px]">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
