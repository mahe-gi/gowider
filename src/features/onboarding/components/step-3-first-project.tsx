"use client";

import React, { useState, useTransition } from "react";
import { createFirstProjectAction } from "../actions/create-first-project";
import { isValidMediaUrl } from "@/features/media";

interface Step3FirstProjectProps {
  onSuccess: () => void;
  onBack?: () => void;
}

const COMMON_CATEGORIES = [
  "Commercial",
  "Music Video",
  "Narrative",
  "Documentary",
  "Social / Reel",
  "Fashion",
  "Color Grading",
  "Visual Effects",
];

export function Step3FirstProject({
  onSuccess,
  onBack,
}: Step3FirstProjectProps) {
  const [title, setTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [category, setCategory] = useState(COMMON_CATEGORIES[0]);
  const [client, setClient] = useState("");
  const [year, setYear] = useState<number | undefined>(new Date().getFullYear());
  const [toolsInput, setToolsInput] = useState("Premiere Pro, DaVinci Resolve");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const isUrlValid = Boolean(sourceUrl && isValidMediaUrl(sourceUrl));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!title.trim()) {
      setErrorMessage("Please enter a project title.");
      return;
    }

    if (!sourceUrl.trim() || !isValidMediaUrl(sourceUrl)) {
      setErrorMessage(
        "Please provide a valid YouTube, Instagram, or Google Drive media link."
      );
      return;
    }

    const tools = toolsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    startTransition(async () => {
      const res = await createFirstProjectAction({
        title: title.trim(),
        sourceUrl: sourceUrl.trim(),
        category: category.trim(),
        client: client.trim() || undefined,
        year: year ? Number(year) : undefined,
        tools,
      });

      if (res.success) {
        onSuccess();
      } else {
        setErrorMessage(res.error);
      }
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="mb-6">
        <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono">
          Step 03 / 05
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
          Feature Your First Work
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Add your best cut from YouTube, Instagram Reels, or Google Drive.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="projectTitle"
            className="block text-xs uppercase tracking-wider font-mono text-zinc-300 mb-1"
          >
            Project Title <span className="text-red-400">*</span>
          </label>
          <input
            id="projectTitle"
            name="title"
            type="text"
            required
            maxLength={140}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Summer Campaign Reel 2025"
            className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/10 rounded-none text-white text-sm focus:border-white focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="sourceUrl"
            className="block text-xs uppercase tracking-wider font-mono text-zinc-300 mb-1"
          >
            Media Source URL <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              id="sourceUrl"
              name="sourceUrl"
              type="url"
              required
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=... or instagram.com/reel/..."
              className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/10 rounded-none text-white text-sm focus:border-white focus:outline-none transition-colors"
            />
          </div>
          <div className="flex items-center justify-between mt-1 text-[11px] font-mono">
            <span className="text-zinc-500">
              Supported: YouTube, Instagram (Reel/Post), Google Drive
            </span>
            {sourceUrl && (
              <span
                data-testid="url-valid-badge"
                className={isUrlValid ? "text-emerald-400" : "text-amber-400"}
              >
                {isUrlValid ? "✓ Valid Source" : "✗ Unrecognized format"}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="category"
              className="block text-xs uppercase tracking-wider font-mono text-zinc-300 mb-1"
            >
              Category <span className="text-red-400">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/10 rounded-none text-white text-sm focus:border-white focus:outline-none transition-colors"
            >
              {COMMON_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="client"
              className="block text-xs uppercase tracking-wider font-mono text-zinc-300 mb-1"
            >
              Client / Brand <span className="text-zinc-500 font-sans">(Optional)</span>
            </label>
            <input
              id="client"
              name="client"
              type="text"
              maxLength={80}
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="e.g. Studio Red"
              className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/10 rounded-none text-white text-sm focus:border-white focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="year"
              className="block text-xs uppercase tracking-wider font-mono text-zinc-300 mb-1"
            >
              Year <span className="text-zinc-500 font-sans">(Optional)</span>
            </label>
            <input
              id="year"
              name="year"
              type="number"
              min={1990}
              max={2100}
              value={year || ""}
              onChange={(e) =>
                setYear(e.target.value ? Number(e.target.value) : undefined)
              }
              className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/10 rounded-none text-white text-sm focus:border-white focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="tools"
              className="block text-xs uppercase tracking-wider font-mono text-zinc-300 mb-1"
            >
              Tools / Software <span className="text-zinc-500 font-sans">(Comma separated)</span>
            </label>
            <input
              id="tools"
              name="tools"
              type="text"
              value={toolsInput}
              onChange={(e) => setToolsInput(e.target.value)}
              placeholder="Premiere, DaVinci Resolve, After Effects"
              className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/10 rounded-none text-white text-sm focus:border-white focus:outline-none transition-colors"
            />
          </div>
        </div>

        {errorMessage && (
          <div
            data-testid="project-error"
            className="p-3 bg-red-950/40 border border-red-800/60 text-red-300 text-xs rounded-none"
          >
            {errorMessage}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              disabled={isPending}
              className="py-3 px-6 border border-white/20 text-zinc-300 font-semibold text-xs uppercase tracking-widest hover:border-white hover:text-white transition-colors disabled:opacity-50"
            >
              ← Back
            </button>
          )}
          <button
            type="submit"
            disabled={isPending || !title || !sourceUrl}
            data-testid="project-submit"
            className="flex-1 py-3 bg-white text-black font-semibold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {isPending ? "Adding Project..." : "Add Project & Continue →"}
          </button>
        </div>
      </form>
    </div>
  );
}
