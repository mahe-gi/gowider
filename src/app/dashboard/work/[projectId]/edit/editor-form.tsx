"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import type { Project } from "@/db/schema";
import type { UpdateProjectInput } from "@/features/projects";
import { tryParseMediaUrl, TypographicPoster } from "@/features/media";
import { isValidThumbnailHost } from "@/features/projects/validation";
import { updateProjectAction } from "@/features/projects/actions";

interface ProjectEditorFormProps {
  project: Project;
  username: string;
}

export function ProjectEditorForm({ project, username }: ProjectEditorFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(project.title);
  const [slug, setSlug] = useState(project.slug);
  const [sourceUrl, setSourceUrl] = useState(project.sourceUrl);
  const [category, setCategory] = useState(project.category);
  const [clientName, setClientName] = useState(project.client || "");
  const [year, setYear] = useState<string>(project.year ? project.year.toString() : "");
  const [description, setDescription] = useState(project.description || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(project.thumbnailUrl || "");
  const [toolsStr, setToolsStr] = useState((project.tools || []).join(", "));
  const [featured, setFeatured] = useState(project.featured);
  const [isPublished, setIsPublished] = useState(project.isPublished);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Slug immutability rule: once published_at is not null, slug cannot change
  const isSlugLocked = project.publishedAt !== null;

  const detectedMedia = sourceUrl.trim() ? tryParseMediaUrl(sourceUrl.trim()) : null;
  const isThumbnailValid = !thumbnailUrl.trim() || isValidThumbnailHost(thumbnailUrl.trim());

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!title.trim()) {
      setErrorMsg("Title is required.");
      return;
    }
    if (!category.trim()) {
      setErrorMsg("Category is required.");
      return;
    }
    if (!sourceUrl.trim() || !detectedMedia) {
      setErrorMsg("Valid media source URL is required.");
      return;
    }
    if (thumbnailUrl.trim() && !isThumbnailValid) {
      setErrorMsg(
        "Thumbnail URL must be hosted on an allowed domain (Unsplash, Sanity, Google, Imgur, Cloudinary)."
      );
      return;
    }

    const parsedYear = year ? parseInt(year, 10) : null;
    const tools = toolsStr
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    startTransition(async () => {
      const payload: UpdateProjectInput = {
        id: project.id,
        title: title.trim(),
        sourceUrl: sourceUrl.trim(),
        sourceType: detectedMedia.sourceType,
        thumbnailUrl: thumbnailUrl.trim() || null,
        category: category.trim(),
        client: clientName.trim() || null,
        year: parsedYear,
        description: description.trim() || null,
        tools,
        featured,
        isPublished,
      };

      // Only pass slug if it was not locked and changed
      if (!isSlugLocked && slug.trim() && slug.trim() !== project.slug) {
        payload.slug = slug.trim().toLowerCase();
      }

      const res = await updateProjectAction(payload);
      if (res.success) {
        setSuccessMsg("Project saved successfully.");
        router.refresh();
      } else {
        setErrorMsg(res.error);
      }
    });
  };

  return (
    <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Editor Form (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        {errorMsg && (
          <div className="rounded-lg border border-red-800/80 bg-red-950/40 p-4 text-sm text-red-300">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="rounded-lg border border-emerald-800/80 bg-emerald-950/40 p-4 text-sm text-emerald-300">
            {successMsg}
          </div>
        )}

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <h2 className="text-base font-semibold text-white">Project Information</h2>
            <div className="flex items-center gap-2">
              <span
                className={clsx(
                  "rounded-full px-2.5 py-0.5 text-xs font-medium",
                  isPublished
                    ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60"
                    : "bg-zinc-800 text-zinc-400 border border-zinc-700/60"
                )}
              >
                {isPublished ? "Live / Published" : "Draft"}
              </span>
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="edit-title" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              id="edit-title"
              type="text"
              maxLength={140}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white focus:border-zinc-600 focus:outline-none"
              required
            />
          </div>

          {/* Slug Input: Locked if published_at is not null */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="edit-slug" className="block text-xs font-medium text-zinc-300">
                URL Slug
              </label>
              {isSlugLocked && (
                <span
                  data-testid="slug-locked-badge"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Locked (Published)</span>
                </span>
              )}
            </div>
            <div className="relative">
              <input
                id="edit-slug"
                type="text"
                value={slug}
                disabled={isSlugLocked}
                onChange={(e) => setSlug(e.target.value)}
                className={clsx(
                  "w-full rounded-lg border px-4 py-2.5 text-sm font-mono focus:outline-none",
                  isSlugLocked
                    ? "border-zinc-800 bg-zinc-900/60 text-zinc-500 cursor-not-allowed select-none"
                    : "border-zinc-800 bg-zinc-950 text-white focus:border-zinc-600"
                )}
              />
            </div>
            {isSlugLocked ? (
              <p className="mt-1.5 text-xs text-zinc-500">
                Slug is locked because this project has already been published. Published slugs are immutable to preserve external links.
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-zinc-500">
                Custom URL path for this work. Editable while in draft state.
              </p>
            )}
          </div>

          {/* Media URL */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="edit-sourceUrl" className="block text-xs font-medium text-zinc-300">
                Media Source URL <span className="text-red-400">*</span>
              </label>
              {detectedMedia && (
                <span className="text-[11px] font-medium text-zinc-400 uppercase">
                  {detectedMedia.sourceType.replace("_", " ")}
                </span>
              )}
            </div>
            <input
              id="edit-sourceUrl"
              type="text"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white focus:border-zinc-600 focus:outline-none"
              required
            />
          </div>

          {/* Thumbnail URL */}
          <div>
            <label htmlFor="edit-thumbnailUrl" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Thumbnail Poster URL (Optional)
            </label>
            <input
              id="edit-thumbnailUrl"
              type="text"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white focus:border-zinc-600 focus:outline-none"
            />
            {thumbnailUrl && !isThumbnailValid && (
              <p className="mt-1 text-xs text-amber-400">
                Must be hosted on Unsplash, Sanity, Google, Imgur, or Cloudinary.
              </p>
            )}
          </div>

          {/* Category & Client */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-category" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Category <span className="text-red-400">*</span>
              </label>
              <input
                id="edit-category"
                type="text"
                maxLength={60}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white focus:border-zinc-600 focus:outline-none"
                required
              />
            </div>
            <div>
              <label htmlFor="edit-client" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Client (Optional)
              </label>
              <input
                id="edit-client"
                type="text"
                maxLength={80}
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white focus:border-zinc-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Year & Tools */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-year" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Year (Optional)
              </label>
              <input
                id="edit-year"
                type="number"
                min={1990}
                max={2100}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white focus:border-zinc-600 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="edit-tools" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Tools & Software
              </label>
              <input
                id="edit-tools"
                type="text"
                value={toolsStr}
                onChange={(e) => setToolsStr(e.target.value)}
                placeholder="DaVinci Resolve, Premiere Pro"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white focus:border-zinc-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="edit-description" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Description / Creative Context
            </label>
            <textarea
              id="edit-description"
              rows={4}
              maxLength={5000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white focus:border-zinc-600 focus:outline-none"
            />
          </div>

          {/* Checkboxes: Featured & Published */}
          <div className="flex flex-col sm:flex-row gap-6 pt-2 border-t border-zinc-800">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-700 bg-zinc-950 text-white focus:ring-0"
              />
              <span className="text-sm text-zinc-300 font-medium">
                Mark as Featured Project
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-700 bg-zinc-950 text-white focus:ring-0"
              />
              <span className="text-sm text-zinc-300 font-medium">
                Published to Live Portfolio
              </span>
            </label>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="submit"
              disabled={isPending}
              className={clsx(
                "rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200",
                isPending && "opacity-50 cursor-not-allowed"
              )}
            >
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Poster-First Media Preview (5 cols) */}
      <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-8">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Poster-First Preview
            </h3>
            {detectedMedia && (
              <span className="rounded bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-300">
                {detectedMedia.sourceType.replace("_", " ")}
              </span>
            )}
          </div>

          {/* Poster Container - ZERO initial iframes */}
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
            {thumbnailUrl.trim() && isThumbnailValid ? (
              <Image
                src={thumbnailUrl.trim()}
                alt={title || "Project poster"}
                fill
                unoptimized
                className="h-full w-full object-cover"
              />
            ) : (
              <TypographicPoster
                title={title || "Project Title"}
                category={category || "Category"}
                client={clientName || undefined}
                year={year ? parseInt(year, 10) : undefined}
              />
            )}
          </div>

          <div className="space-y-2 pt-2 text-xs text-zinc-400">
            <div className="flex justify-between py-1 border-b border-zinc-800/80">
              <span className="text-zinc-500">Live URL</span>
              <span className="font-mono text-zinc-300 truncate max-w-[200px]">
                /{username}/{project.slug}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-800/80">
              <span className="text-zinc-500">Publication Date</span>
              <span className="text-zinc-300">
                {project.publishedAt
                  ? new Date(project.publishedAt).toLocaleDateString()
                  : "Never published (Draft)"}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-800/80">
              <span className="text-zinc-500">Sort Order</span>
              <span className="font-mono text-zinc-300">#{project.sortOrder + 1}</span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
