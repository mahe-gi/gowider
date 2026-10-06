"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import type { Project } from "@/db/schema";
import { TypographicPoster } from "@/features/media";
import {
  toggleProjectPublishAction,
  deleteProjectAction,
  reorderProjectsAction,
  updateProjectAction,
} from "@/features/projects/actions";

interface WorkTableProps {
  profileId: string;
  initialProjects: Project[];
}

export function WorkTable({ profileId, initialProjects }: WorkTableProps) {
  const router = useRouter();
  const [projectsList, setProjectsList] = useState<Project[]>(initialProjects);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state if props change
  React.useEffect(() => {
    setProjectsList(initialProjects);
  }, [initialProjects]);

  const handleTogglePublish = async (projectId: string) => {
    setErrorMsg(null);
    const prevProjects = [...projectsList];

    // Optimistically toggle publish status immediately (0ms feedback)
    setProjectsList((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, isPublished: !p.isPublished } : p
      )
    );

    try {
      const res = await toggleProjectPublishAction(projectId);
      if (res.success) {
        setProjectsList((prev) =>
          prev.map((p) => (p.id === projectId ? res.data : p))
        );
      } else {
        setErrorMsg(res.error);
        setProjectsList(prevProjects); // Revert on failure
      }
    } catch {
      setErrorMsg("Failed to update publication status");
      setProjectsList(prevProjects); // Revert on failure
    }
  };

  const handleToggleFeatured = async (project: Project) => {
    setErrorMsg(null);
    const prevProjects = [...projectsList];
    const targetId = project.id;
    const nextFeatured = !project.featured;

    // Optimistically toggle featured status immediately (0ms feedback)
    setProjectsList((prev) =>
      prev.map((p) =>
        p.id === targetId ? { ...p, featured: nextFeatured } : p
      )
    );

    try {
      const res = await updateProjectAction({
        id: targetId,
        featured: nextFeatured,
      });
      if (res.success) {
        setProjectsList((prev) =>
          prev.map((p) => (p.id === targetId ? res.data : p))
        );
      } else {
        setErrorMsg(res.error);
        setProjectsList(prevProjects); // Revert on failure
      }
    } catch {
      setErrorMsg("Failed to update featured status");
      setProjectsList(prevProjects); // Revert on failure
    }
  };

  const handleDelete = (projectId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project? This action cannot be undone."
    );
    if (!confirmed) return;

    setErrorMsg(null);
    setDeletingId(projectId);
    startTransition(async () => {
      const res = await deleteProjectAction(projectId);
      if (res.success) {
        setProjectsList((prev) => prev.filter((p) => p.id !== projectId));
        router.refresh();
      } else {
        setErrorMsg(res.error);
      }
      setDeletingId(null);
    });
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projectsList.length) return;

    setErrorMsg(null);
    const prevProjects = [...projectsList];
    const updated = [...projectsList];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    // Reorder optimistically immediately
    setProjectsList(updated);

    try {
      const projectIds = updated.map((p) => p.id);
      const res = await reorderProjectsAction({ profileId, projectIds });
      if (!res.success) {
        setErrorMsg(res.error);
        setProjectsList(prevProjects); // Revert on failure
      }
    } catch {
      setErrorMsg("Failed to save project order");
      setProjectsList(prevProjects); // Revert on failure
    }
  };

  const getProviderBadge = (sourceType: string) => {
    switch (sourceType) {
      case "youtube":
        return (
          <span className="inline-flex items-center rounded bg-red-950/80 px-2 py-0.5 text-[11px] font-medium text-red-400 border border-red-800/60">
            YouTube
          </span>
        );
      case "instagram":
        return (
          <span className="inline-flex items-center rounded bg-pink-950/80 px-2 py-0.5 text-[11px] font-medium text-pink-400 border border-pink-800/60">
            Instagram
          </span>
        );
      case "google_drive":
        return (
          <span className="inline-flex items-center rounded bg-blue-950/80 px-2 py-0.5 text-[11px] font-medium text-blue-400 border border-blue-800/60">
            Google Drive
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-400">
            {sourceType}
          </span>
        );
    }
  };

  return (
    <div data-testid="work-table-container" className="space-y-4">
      {errorMsg && (
        <div className="rounded-lg border border-red-800/80 bg-red-950/40 p-3 text-xs text-red-300">
          {errorMsg}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950">
        <table className="w-full text-left text-sm text-zinc-300">
          <thead className="border-b border-zinc-800 bg-zinc-900/60 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            <tr>
              <th scope="col" className="w-12 px-3 py-3 text-center">
                #
              </th>
              <th scope="col" className="w-24 px-4 py-3">
                Poster
              </th>
              <th scope="col" className="px-4 py-3">
                Title & Client
              </th>
              <th scope="col" className="px-4 py-3">
                Provider
              </th>
              <th scope="col" className="px-4 py-3">
                Category
              </th>
              <th scope="col" className="w-16 px-4 py-3 text-center">
                Featured
              </th>
              <th scope="col" className="w-28 px-4 py-3">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/70">
            {projectsList.map((project, index) => (
              <tr
                key={project.id}
                data-testid={`project-row-${project.id}`}
                className="group transition-colors hover:bg-zinc-900/40"
              >
                {/* Reorder Up/Down */}
                <td className="px-3 py-3 text-center">
                  <div className="flex flex-col items-center justify-center gap-0.5">
                    <button
                      type="button"
                      aria-label="Move project up"
                      disabled={index === 0}
                      onClick={() => handleMove(index, "up")}
                      className={clsx(
                        "rounded p-0.5 text-zinc-500 hover:bg-zinc-800 hover:text-white active:scale-90 active:bg-zinc-700 transition cursor-pointer",
                        index === 0 && "opacity-25 cursor-not-allowed pointer-events-none"
                      )}
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <span className="font-mono text-xs text-zinc-500">
                      {index + 1}
                    </span>
                    <button
                      type="button"
                      aria-label="Move project down"
                      disabled={index === projectsList.length - 1}
                      onClick={() => handleMove(index, "down")}
                      className={clsx(
                        "rounded p-0.5 text-zinc-500 hover:bg-zinc-800 hover:text-white active:scale-90 active:bg-zinc-700 transition cursor-pointer",
                        index === projectsList.length - 1 && "opacity-25 cursor-not-allowed pointer-events-none"
                      )}
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </td>

                {/* Poster-First Preview (Zero iframes/autoplay) */}
                <td className="px-4 py-3">
                  <div className="relative h-12 w-20 overflow-hidden rounded border border-zinc-800 bg-zinc-900 flex items-center justify-center">
                    {project.thumbnailUrl ? (
                      <Image
                        src={project.thumbnailUrl}
                        alt={project.title}
                        fill
                        unoptimized
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="scale-[0.25] origin-center w-80 h-44 absolute">
                        <TypographicPoster
                          title={project.title}
                          category={project.category}
                          client={project.client}
                          year={project.year}
                        />
                      </div>
                    )}
                  </div>
                </td>

                {/* Title & Metadata */}
                <td className="px-4 py-3">
                  <div className="font-medium text-white truncate max-w-xs">
                    {project.title}
                  </div>
                  <div className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5">
                    {project.client && <span>{project.client}</span>}
                    {project.year && <span>• {project.year}</span>}
                    <span className="font-mono text-[11px] text-zinc-600">/{project.slug}</span>
                  </div>
                </td>

                {/* Provider */}
                <td className="px-4 py-3 whitespace-nowrap">
                  {getProviderBadge(project.sourceType)}
                </td>

                {/* Category */}
                <td className="px-4 py-3 whitespace-nowrap text-zinc-400 text-xs">
                  {project.category}
                </td>

                {/* Featured Star */}
                <td className="px-4 py-3 text-center">
                  <button
                    type="button"
                    aria-label={project.featured ? "Unmark featured" : "Mark featured"}
                    onClick={() => handleToggleFeatured(project)}
                    className="p-1 rounded text-zinc-500 hover:text-amber-400 active:scale-90 transition cursor-pointer"
                  >
                    {project.featured ? (
                      <svg className="h-4 w-4 fill-amber-400 text-amber-400" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4 text-zinc-600 hover:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    )}
                  </button>
                </td>

                {/* Publish status */}
                <td className="px-4 py-3 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(project.id)}
                    className={clsx(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition active:scale-95 cursor-pointer select-none",
                      project.isPublished
                        ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 hover:bg-emerald-900/60"
                        : "bg-zinc-800 text-zinc-400 border border-zinc-700/60 hover:bg-zinc-700 hover:text-white"
                    )}
                  >
                    <span
                      className={clsx(
                        "h-1.5 w-1.5 rounded-full",
                        project.isPublished ? "bg-emerald-400" : "bg-zinc-500"
                      )}
                    />
                    <span>{project.isPublished ? "Published" : "Draft"}</span>
                  </button>
                </td>

                {/* Actions: Edit, Delete */}
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/dashboard/work/${project.id}/edit`}
                      className="rounded border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white active:scale-95 cursor-pointer"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(project.id)}
                      disabled={isPending || deletingId === project.id}
                      className={clsx(
                        "rounded border border-red-950 bg-red-950/40 px-2.5 py-1 text-xs font-medium text-red-400 transition hover:bg-red-900/60 hover:text-red-200 active:scale-95 cursor-pointer",
                        (isPending || deletingId === project.id) && "opacity-50 cursor-not-allowed pointer-events-none"
                      )}
                    >
                      {deletingId === project.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
