"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { publishOnboardingPortfolioAction } from "../actions/publish-portfolio";
import type { Profile, PortfolioSettings } from "@/db/schema";

interface Step5PublishProps {
  profile: Profile | null;
  settings: PortfolioSettings | null;
  projectsCount: number;
  isAlreadyPublished?: boolean;
  onBack?: () => void;
}

export function Step5Publish({
  profile,
  settings,
  projectsCount,
  isAlreadyPublished = false,
  onBack,
}: Step5PublishProps) {
  const [isPublished, setIsPublished] = useState(isAlreadyPublished);
  const [publishedUrl, setPublishedUrl] = useState(() => {
    const base = process.env.NEXT_PUBLIC_APP_URL || "";
    return profile?.username ? `${base}/${profile.username}` : "";
  });
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleCopy = async () => {
    if (!publishedUrl) return;
    try {
      await navigator.clipboard.writeText(publishedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handlePublish = () => {
    setErrorMessage("");
    startTransition(async () => {
      const res = await publishOnboardingPortfolioAction();
      if (res.success) {
        setIsPublished(true);
        setPublishedUrl(res.data.publishedUrl);
      } else {
        setErrorMessage(res.error);
      }
    });
  };

  // Celebration state when published
  if (isPublished) {
    return (
      <div
        data-testid="publication-celebration"
        className="w-full max-w-xl mx-auto text-center py-6"
      >
        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-emerald-950 border border-emerald-500/50 flex items-center justify-center">
          <span className="text-2xl text-emerald-400">✓</span>
        </div>

        <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">
          Portfolio Is Live
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-white mt-2">
          Your Cut Is In The World
        </h1>
        <p className="text-zinc-400 text-sm mt-2 max-w-md mx-auto">
          Your editorial portfolio is live and ready to send to directors, agencies,
          and production companies.
        </p>

        {/* Live URL Card */}
        <div className="mt-8 p-4 bg-[#0A0A0A] border border-white/15 max-w-lg mx-auto text-left">
          <span className="block text-[11px] uppercase tracking-wider font-mono text-zinc-400 mb-1">
            Permanent Portfolio Link
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              data-testid="live-url-input"
              value={publishedUrl}
              className="flex-1 px-3 py-2 bg-black border border-white/10 text-white font-mono text-xs select-all focus:outline-none"
            />
            <button
              type="button"
              data-testid="copy-live-url-btn"
              onClick={handleCopy}
              className="py-2 px-3 bg-white text-black font-semibold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-colors whitespace-nowrap"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={publishedUrl || `/${profile?.username}`}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="view-live-portfolio-btn"
            className="w-full sm:w-auto px-6 py-3 bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors text-center inline-block"
          >
            View Live Portfolio ↗
          </a>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3 border border-white/20 text-zinc-300 font-semibold text-xs uppercase tracking-widest hover:border-white hover:text-white transition-colors text-center inline-block"
          >
            Open Creator Studio →
          </Link>
        </div>
      </div>
    );
  }

  // Pre-publish verification card
  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="mb-6">
        <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono">
          Step 05 / 05
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
          Review & Launch Portfolio
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Verify your portfolio setup before publishing it to the world.
        </p>
      </div>

      {/* Verification Card */}
      <div
        data-testid="verification-card"
        className="p-5 bg-[#0A0A0A] border border-white/10 space-y-4 mb-6"
      >
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <span className="text-xs font-mono uppercase text-zinc-400">
            Handle
          </span>
          <span className="text-xs font-mono text-white font-medium">
            gowider.in/{profile?.username || "—"}
          </span>
        </div>

        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <span className="text-xs font-mono uppercase text-zinc-400">
            Identity
          </span>
          <div className="text-right">
            <span className="text-xs text-white font-medium block">
              {profile?.displayName || "—"}
            </span>
            <span className="text-[11px] text-zinc-400">
              {profile?.headline || "—"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <span className="text-xs font-mono uppercase text-zinc-400">
            Works Staged
          </span>
          <span className="text-xs font-mono text-emerald-400 font-medium">
            {projectsCount} Project{projectsCount === 1 ? "" : "s"} Ready
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase text-zinc-400">
            Aesthetic Theme
          </span>
          <span className="text-xs font-mono uppercase text-white font-medium">
            {settings?.theme || "cinema"} ({settings?.motionLevel || "full"})
          </span>
        </div>
      </div>

      {errorMessage && (
        <div
          data-testid="publish-error"
          className="p-3 bg-red-950/40 border border-red-800/60 text-red-300 text-xs rounded-none mb-6"
        >
          {errorMessage}
        </div>
      )}

      <div className="flex items-center gap-3">
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
          type="button"
          onClick={handlePublish}
          disabled={isPending}
          data-testid="publish-submit"
          className="flex-1 py-3 bg-white text-black font-semibold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors disabled:opacity-50"
        >
          {isPending ? "Publishing Live..." : "Publish Portfolio Live ↗"}
        </button>
      </div>
    </div>
  );
}
