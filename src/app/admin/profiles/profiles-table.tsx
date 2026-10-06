"use client";

import { useState } from "react";
import Link from "next/link";
import { unpublishProfileModerationAction } from "@/features/admin/actions/unpublish-profile";
import type { AdminProfile } from "@/features/admin/types";

interface ProfilesTableProps {
  initialProfiles: AdminProfile[];
}

export function ProfilesTable({ initialProfiles }: ProfilesTableProps) {
  const [profilesList, setProfilesList] = useState(initialProfiles);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const handleUnpublish = async (profileId: string, username: string) => {
    if (!confirm(`Are you sure you want to unpublish @${username}? The public portfolio will immediately return 404.`)) {
      return;
    }

    setLoadingId(profileId);
    setMessage(null);

    try {
      const res = await unpublishProfileModerationAction(profileId);
      if (res.success) {
        setProfilesList((prev) =>
          prev.map((p) => (p.id === profileId ? { ...p, isPublished: false } : p))
        );
        setMessage({ text: `@${username} successfully unpublished.` });
      } else {
        setMessage({ text: res.error, error: true });
      }
    } catch {
      setMessage({ text: "Failed to unpublish profile.", error: true });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {message && (
        <div
          data-testid="admin-profiles-feedback"
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
                Profile
              </th>
              <th scope="col" className="px-6 py-3.5">
                User Email
              </th>
              <th scope="col" className="px-6 py-3.5">
                Projects
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
            {profilesList.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                  No creator profiles created.
                </td>
              </tr>
            ) : (
              profilesList.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02]">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white">{p.displayName}</div>
                    <Link
                      href={`/${p.username}`}
                      target="_blank"
                      className="text-zinc-400 hover:text-white underline decoration-dotted text-[11px]"
                    >
                      @{p.username} ↗
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">
                    {p.userEmail || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-zinc-200 font-bold">{p.projectCount}</span>{" "}
                    <span className="text-zinc-500 text-[10px]">items</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      data-testid={`profile-status-${p.username}`}
                      className={`inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider ${
                        p.isPublished
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-zinc-800 text-zinc-500"
                      }`}
                    >
                      {p.isPublished ? "PUBLISHED" : "DRAFT"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500 text-[11px]">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {p.isPublished ? (
                      <button
                        type="button"
                        data-testid={`unpublish-profile-${p.username}`}
                        disabled={loadingId === p.id}
                        onClick={() => handleUnpublish(p.id, p.username)}
                        className="px-3 py-1 bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-200 text-[11px] uppercase tracking-wider transition-colors disabled:opacity-50"
                      >
                        {loadingId === p.id ? "Unpublishing..." : "Unpublish"}
                      </button>
                    ) : (
                      <span className="text-zinc-600 text-[11px]">—</span>
                    )}
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
