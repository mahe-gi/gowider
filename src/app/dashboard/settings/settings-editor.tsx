"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import type { Profile } from "@/db/schema";
import {
  updateUsernameAction,
  togglePortfolioVisibilityAction,
  deleteAccountAction,
} from "@/features/design/actions";
import { signOut } from "@/lib/auth-client";

interface SettingsEditorProps {
  profile: Profile;
  appUrl: string;
}

export function SettingsEditor({ profile, appUrl }: SettingsEditorProps) {
  const router = useRouter();
  const cleanAppUrl = appUrl.replace(/\/+$/, "");

  // Username state
  const [username, setUsername] = useState(profile.username);
  const [usernameMsg, setUsernameMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Visibility state
  const [isPublished, setIsPublished] = useState(profile.isPublished);
  const [visibilityMsg, setVisibilityMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Danger zone state
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isPending, startTransition] = useTransition();

  // Save new username
  const handleUpdateUsername = (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameMsg(null);

    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) {
      setUsernameMsg({ type: "error", text: "Username cannot be empty." });
      return;
    }

    startTransition(async () => {
      const res = await updateUsernameAction(profile.id, cleanUsername);
      if (res.success) {
        setUsernameMsg({
          type: "success",
          text: `Handle updated to ${res.data.username}.`,
        });
        router.refresh();
      } else {
        setUsernameMsg({ type: "error", text: res.error });
      }
    });
  };

  // Toggle visibility
  const handleToggleVisibility = (nextValue: boolean) => {
    setVisibilityMsg(null);
    setIsPublished(nextValue);

    startTransition(async () => {
      const res = await togglePortfolioVisibilityAction(profile.id, nextValue);
      if (res.success) {
        setVisibilityMsg({
          type: "success",
          text: nextValue
            ? "Portfolio is now published and live."
            : "Portfolio is now unpublished (Draft only).",
        });
        router.refresh();
      } else {
        setIsPublished(!nextValue);
        setVisibilityMsg({ type: "error", text: res.error });
      }
    });
  };

  // Delete account
  const handleDeleteAccount = () => {
    setDeleteError(null);

    if (deleteConfirmation.trim() !== "delete my account") {
      setDeleteError('Please type "delete my account" exactly to confirm.');
      return;
    }

    setIsDeleting(true);
    startTransition(async () => {
      const res = await deleteAccountAction(profile.id);
      if (res.success) {
        await signOut();
        window.location.href = "/";
      } else {
        setDeleteError(res.error);
        setIsDeleting(false);
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* 1. Portfolio Handle & URL */}
      <form
        onSubmit={handleUpdateUsername}
        className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4"
      >
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-base font-semibold text-white">Portfolio URL & Handle</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Change the custom subdomain or URL path where clients access your work.
            </p>
          </div>
          {usernameMsg && (
            <span
              className={clsx(
                "text-xs font-medium",
                usernameMsg.type === "success" ? "text-emerald-400" : "text-red-400"
              )}
            >
              {usernameMsg.text}
            </span>
          )}
        </div>

        <div>
          <label htmlFor="handle-input" className="block text-xs font-medium text-zinc-300 mb-1.5">
            Claimed Username
          </label>
          <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-950 focus-within:border-zinc-600">
            <span className="pl-4 text-xs font-mono text-zinc-500 select-none">
              {cleanAppUrl}/
            </span>
            <input
              id="handle-input"
              type="text"
              minLength={3}
              maxLength={30}
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              className="flex-1 bg-transparent px-2 py-2.5 text-sm font-mono text-white focus:outline-none"
              required
            />
          </div>
          <p className="mt-1.5 text-xs text-zinc-500">
            Must be 3-30 characters using lowercase letters, numbers, hyphens, and underscores. Cannot start or end with a hyphen.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isPending || username === profile.username}
            className={clsx(
              "rounded-lg bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200",
              (isPending || username === profile.username) && "opacity-50 cursor-not-allowed"
            )}
          >
            {isPending ? "Updating..." : "Update Handle"}
          </button>
        </div>
      </form>

      {/* 2. Portfolio Visibility Switch */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-base font-semibold text-white">Portfolio Visibility</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Control whether your portfolio is accessible to visitors via your public URL.
            </p>
          </div>
          {visibilityMsg && (
            <span
              className={clsx(
                "text-xs font-medium",
                visibilityMsg.type === "success" ? "text-emerald-400" : "text-red-400"
              )}
            >
              {visibilityMsg.text}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <span className="text-sm font-medium text-white block">
              {isPublished ? "Public & Published" : "Private / Draft Mode"}
            </span>
            <span className="text-xs text-zinc-400 block mt-0.5 max-w-md">
              {isPublished
                ? "Your portfolio is live and visible to all visitors. Published projects will be viewable."
                : "Your portfolio is hidden. Visitors attempting to access your URL will see a private or 404 page."}
            </span>
          </div>

          <button
            type="button"
            data-testid="visibility-toggle"
            disabled={isPending}
            onClick={() => handleToggleVisibility(!isPublished)}
            className={clsx(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
              isPublished ? "bg-emerald-500" : "bg-zinc-700"
            )}
          >
            <span
              className={clsx(
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                isPublished ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
        </div>
      </div>

      {/* 3. Danger Zone: Delete Account */}
      <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-red-400">Danger Zone</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Irrevocably remove your account, profile, video projects, and all auxiliary assets.
          </p>
        </div>

        {deleteError && (
          <div className="rounded-lg border border-red-800 bg-red-950/60 p-3 text-xs text-red-300">
            {deleteError}
          </div>
        )}

        <div className="pt-2 space-y-3">
          <label htmlFor="confirm-delete" className="block text-xs text-zinc-300">
            To confirm deletion, type <span className="font-mono font-bold text-red-400">delete my account</span> below:
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="confirm-delete"
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="delete my account"
              className="flex-1 rounded-lg border border-red-900/60 bg-zinc-950 px-4 py-2 text-sm text-white focus:border-red-600 focus:outline-none"
            />
            <button
              type="button"
              data-testid="delete-account-btn"
              disabled={isDeleting || deleteConfirmation !== "delete my account"}
              onClick={handleDeleteAccount}
              className={clsx(
                "rounded-lg border border-red-800 bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700",
                (isDeleting || deleteConfirmation !== "delete my account") &&
                  "opacity-40 cursor-not-allowed"
              )}
            >
              {isDeleting ? "Deleting Account..." : "Permanently Delete Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
