"use client";

import React, { useState } from "react";
import Image from "next/image";
import { signOut } from "@/lib/auth-client";
import type { Profile } from "@/db/schema";

interface TopBarProps {
  profile: Profile;
  appUrl: string;
}

export function DashboardTopBar({ profile, appUrl }: TopBarProps) {
  const [copied, setCopied] = useState(false);

  // Normalize appUrl without trailing slash
  const cleanAppUrl = appUrl.replace(/\/+$/, "");
  const liveUrl = `${cleanAppUrl}/${profile.username}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(liveUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <header
      data-testid="dashboard-topbar"
      className="h-16 border-b border-zinc-800 bg-zinc-950 px-3 sm:px-6 flex items-center justify-between gap-2 overflow-x-hidden"
    >
      {/* Left: Live Status Pill & Link */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {profile.isPublished ? (
          <div
            data-testid="live-indicator"
            className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-1 text-xs font-medium text-emerald-400"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">Live at {cleanAppUrl}/{profile.username}</span>
            <span className="sm:hidden">Live</span>
          </div>
        ) : (
          <div
            data-testid="draft-indicator"
            className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-amber-950/70 border border-amber-800/50 px-2.5 py-1 text-xs font-medium text-amber-400"
          >
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="hidden sm:inline">Draft Mode (Unpublished)</span>
            <span className="sm:hidden">Draft</span>
          </div>
        )}

        <button
          onClick={handleCopyLink}
          type="button"
          data-testid="copy-link-btn"
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-2 sm:px-2.5 py-1 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
          title="Copy public link to clipboard"
        >
          {copied ? (
            <>
              <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="hidden xs:inline sm:inline">Copy Link</span>
              <span className="xs:hidden sm:hidden">Copy</span>
            </>
          )}
        </button>

        <a
          href={`/${profile.username}`}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="view-live-btn"
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-2 sm:px-2.5 py-1 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
        >
          <span>View</span>
          <svg className="h-3 w-3 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      {/* Right: User Profile & Logout */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          {profile.avatarUrl ? (
            <div className="relative h-8 w-8 overflow-hidden rounded-full border border-zinc-700">
              <Image
                src={profile.avatarUrl}
                alt={profile.displayName}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-white border border-zinc-700">
              {profile.displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-sm font-medium text-zinc-200 hidden sm:inline-block">
            {profile.displayName}
          </span>
        </div>

        <button
          onClick={handleSignOut}
          type="button"
          data-testid="sign-out-btn"
          className="rounded-lg border border-zinc-800/80 px-2.5 py-1 text-xs text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
