"use client";

import React, { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { tryParseMediaUrl, TypographicPoster } from "@/features/media";
import { isValidThumbnailHost } from "@/features/projects/validation";
import { createProjectAction } from "@/features/projects/actions";

const CATEGORY_SUGGESTIONS = [
  "Commercial",
  "Music Video",
  "Narrative",
  "Documentary",
  "Reel",
  "Short Film",
  "Motion Graphics",
  "Brand Film",
];

export default function NewProjectWizardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialUrl = searchParams.get("url") || "";

  const [sourceUrl, setSourceUrl] = useState(initialUrl);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [clientName, setClientName] = useState("");
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [toolsStr, setToolsStr] = useState("");
  const [featured, setFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Real-time media URL detection
  const detectedMedia = sourceUrl.trim() ? tryParseMediaUrl(sourceUrl.trim()) : null;
  const isThumbnailValid = !thumbnailUrl.trim() || isValidThumbnailHost(thumbnailUrl.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!sourceUrl.trim()) {
      setErrorMsg("Please provide a media source URL.");
      return;
    }
    if (!detectedMedia) {
      setErrorMsg("Please enter a valid YouTube, Instagram, or Google Drive URL.");
      return;
    }
    if (!title.trim()) {
      setErrorMsg("Please provide a project title.");
      return;
    }
    if (!category.trim()) {
      setErrorMsg("Please provide a project category.");
      return;
    }
    if (thumbnailUrl.trim() && !isThumbnailValid) {
      setErrorMsg(
        "Thumbnail URL must be hosted on an allowed domain (Unsplash, Sanity, Google, Imgur, Cloudinary)."
      );
      return;
    }

    const parsedYear = year ? parseInt(year, 10) : undefined;
    const tools = toolsStr
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    startTransition(async () => {
      const res = await createProjectAction({
        title: title.trim(),
        sourceUrl: sourceUrl.trim(),
        sourceType: detectedMedia.sourceType,
        thumbnailUrl: thumbnailUrl.trim() || null,
        category: category.trim(),
        client: clientName.trim() || null,
        year: isNaN(parsedYear as number) ? null : parsedYear,
        description: description.trim() || null,
        tools,
        featured,
        isPublished,
      });

      if (res.success) {
        router.push("/dashboard/work");
        router.refresh();
      } else {
        setErrorMsg(res.error);
      }
    });
  };

  return (
    <div data-testid="new-project-wizard" className="max-w-4xl mx-auto space-y-8">
      {/* Breadcrumb & Title */}
      <div>
        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
          <Link href="/dashboard/work" className="hover:text-zinc-300 transition">
            Work
          </Link>
          <span>/</span>
          <span className="text-zinc-300">New Project</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Add New Project
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Paste your media link, add details, and configure the project poster presentation.
        </p>
      </div>

      {errorMsg && (
        <div className="rounded-lg border border-red-800/80 bg-red-950/40 p-4 text-sm text-red-300">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Media Source URL Auto-Detection */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">
              1. Media Link Auto-Detection
            </h2>
            {detectedMedia && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950 border border-emerald-800 px-3 py-0.5 text-xs font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Detected {detectedMedia.sourceType.replace("_", " ").toUpperCase()}
              </span>
            )}
          </div>

          <div>
            <label htmlFor="sourceUrl" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Source URL <span className="text-red-400">*</span>
            </label>
            <input
              id="sourceUrl"
              type="text"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="e.g. https://www.youtube.com/watch?v=... or https://www.instagram.com/reel/..."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
              required
            />
            <p className="mt-1 text-xs text-zinc-500">
              Supported providers: YouTube, Instagram Reels, and Google Drive video links.
            </p>
          </div>
        </div>

        {/* Step 2: Poster-First Preview & Custom Thumbnail */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
          <h2 className="text-base font-semibold text-white">
            2. Poster & Visual Presentation
          </h2>
          <p className="text-xs text-zinc-400">
            GoWider portfolios are strictly poster-first: visitors see a high-impact poster card without heavy iframes or autoplaying video on initial load.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div>
              <label htmlFor="thumbnailUrl" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Custom Thumbnail URL (Optional)
              </label>
              <input
                id="thumbnailUrl"
                type="text"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
              />
              {thumbnailUrl && !isThumbnailValid && (
                <p className="mt-1 text-xs text-amber-400">
                  Host must be Unsplash, Sanity, Google, Imgur, or Cloudinary.
                </p>
              )}
              <p className="mt-2 text-xs text-zinc-500">
                Allowed hosts: Unsplash, Sanity, Google, Imgur, Cloudinary. If omitted, an automatic typographic poster is displayed.
              </p>
            </div>

            {/* Poster Preview Card */}
            <div>
              <span className="block text-xs font-medium text-zinc-400 mb-1.5">
                Poster Preview
              </span>
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
                {thumbnailUrl.trim() && isThumbnailValid ? (
                  <Image
                    src={thumbnailUrl.trim()}
                    alt="Poster preview"
                    fill
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <TypographicPoster
                    title={title || "Untitled Project"}
                    category={category || "Category"}
                    client={clientName || undefined}
                    year={year ? parseInt(year, 10) : undefined}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Project Details Form */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-6">
          <h2 className="text-base font-semibold text-white">
            3. Project Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                id="title"
                type="text"
                maxLength={140}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Nocturne in Blue"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Category <span className="text-red-400">*</span>
              </label>
              <input
                id="category"
                type="text"
                maxLength={60}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Commercial, Music Video"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
                required
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {CATEGORY_SUGGESTIONS.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className="rounded bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-400 hover:bg-zinc-700 hover:text-white transition"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="client" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Client (Optional)
              </label>
              <input
                id="client"
                type="text"
                maxLength={80}
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Studio Canal, A24"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="year" className="block text-xs font-medium text-zinc-300 mb-1.5">
                Year (Optional)
              </label>
              <input
                id="year"
                type="number"
                min={1990}
                max={2100}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g. 2024"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="tools" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Tools & Software (Comma-separated)
            </label>
            <input
              id="tools"
              type="text"
              value={toolsStr}
              onChange={(e) => setToolsStr(e.target.value)}
              placeholder="e.g. Premiere Pro, DaVinci Resolve, After Effects"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-xs font-medium text-zinc-300 mb-1.5">
              Description / Notes (Optional)
            </label>
            <textarea
              id="description"
              rows={3}
              maxLength={5000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief background or creative context for this project..."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-6 pt-2">
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
                Publish Immediately to Public Portfolio
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/dashboard/work"
            className="rounded-lg border border-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className={clsx(
              "rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200",
              isPending && "opacity-50 cursor-not-allowed"
            )}
          >
            {isPending ? "Creating..." : "Create Project"}
          </button>
        </div>
      </form>
    </div>
  );
}
