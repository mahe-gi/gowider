"use client";

import React, { useState, useTransition } from "react";
import { updateIdentityAction } from "../actions/update-identity";

interface Step2IdentityProps {
  initialDisplayName?: string;
  initialHeadline?: string;
  initialLocation?: string;
  initialBio?: string;
  onSuccess: () => void;
  onBack?: () => void;
}

export function Step2Identity({
  initialDisplayName = "",
  initialHeadline = "Video Editor & Filmmaker",
  initialLocation = "",
  initialBio = "",
  onSuccess,
  onBack,
}: Step2IdentityProps) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [headline, setHeadline] = useState(initialHeadline);
  const [location, setLocation] = useState(initialLocation);
  const [bio, setBio] = useState(initialBio);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!displayName.trim() || displayName.length < 2) {
      setErrorMessage("Display name must be at least 2 characters.");
      return;
    }

    if (!headline.trim() || headline.length < 2) {
      setErrorMessage("Headline must be at least 2 characters.");
      return;
    }

    startTransition(async () => {
      const res = await updateIdentityAction({
        displayName: displayName.trim(),
        headline: headline.trim(),
        location: location.trim() || undefined,
        bio: bio.trim() || undefined,
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
          Step 02 / 05
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
          Define Your Identity
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Tell directors and clients who you are and what you craft.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="displayName"
            className="block text-xs uppercase tracking-wider font-mono text-zinc-300 mb-1"
          >
            Display Name <span className="text-red-400">*</span>
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            required
            maxLength={100}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Alex Morgan"
            className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/10 rounded-none text-white text-sm focus:border-white focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="headline"
            className="block text-xs uppercase tracking-wider font-mono text-zinc-300 mb-1"
          >
            Headline / Craft Statement <span className="text-red-400">*</span>
          </label>
          <input
            id="headline"
            name="headline"
            type="text"
            required
            maxLength={120}
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="e.g. Commercial & Music Video Lead Editor"
            className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/10 rounded-none text-white text-sm focus:border-white focus:outline-none transition-colors"
          />
          <p className="text-[11px] text-zinc-500 mt-1 font-mono">
            {headline.length}/120 characters
          </p>
        </div>

        <div>
          <label
            htmlFor="location"
            className="block text-xs uppercase tracking-wider font-mono text-zinc-300 mb-1"
          >
            Location <span className="text-zinc-500 font-sans">(Optional)</span>
          </label>
          <input
            id="location"
            name="location"
            type="text"
            maxLength={80}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. London & Remote"
            className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/10 rounded-none text-white text-sm focus:border-white focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="bio"
            className="block text-xs uppercase tracking-wider font-mono text-zinc-300 mb-1"
          >
            Bio / About <span className="text-zinc-500 font-sans">(Optional)</span>
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            maxLength={1000}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A short summary of your background, visual style, and editorial philosophy."
            className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/10 rounded-none text-white text-sm focus:border-white focus:outline-none transition-colors resize-none"
          />
        </div>

        {errorMessage && (
          <div
            data-testid="identity-error"
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
            disabled={isPending}
            data-testid="identity-submit"
            className="flex-1 py-3 bg-white text-black font-semibold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save Identity & Continue →"}
          </button>
        </div>
      </form>
    </div>
  );
}
