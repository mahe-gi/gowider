"use client";

import { useState } from "react";
import Link from "next/link";
import { resolveReportAction } from "@/features/admin/actions/resolve-report";
import { unpublishProfileModerationAction } from "@/features/admin/actions/unpublish-profile";
import { unpublishProjectModerationAction } from "@/features/admin/actions/unpublish-project";
import type { AdminReport } from "@/features/admin/types";

interface ReportsTableProps {
  initialReports: AdminReport[];
}

export function ReportsTable({ initialReports }: ReportsTableProps) {
  const [reportsList, setReportsList] = useState(initialReports);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "resolved" | "dismissed">("all");
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const handleResolve = async (
    reportId: string,
    action: "dismiss" | "action_taken"
  ) => {
    setLoadingId(reportId);
    setMessage(null);

    try {
      const res = await resolveReportAction(reportId, action);
      if (res.success) {
        setReportsList((prev) =>
          prev.map((r) =>
            r.id === reportId
              ? {
                  ...r,
                  status: res.data.status,
                  resolvedAt: new Date(),
                }
              : r
          )
        );
        setMessage({
          text: `Report marked as ${res.data.status}.`,
        });
      } else {
        setMessage({ text: res.error, error: true });
      }
    } catch {
      setMessage({ text: "Failed to update report status.", error: true });
    } finally {
      setLoadingId(null);
    }
  };

  const handleUnpublishProfile = async (profileId: string, username: string) => {
    if (!confirm(`Unpublish @${username}?`)) return;
    setLoadingId(`profile-${profileId}`);
    try {
      const res = await unpublishProfileModerationAction(profileId);
      if (res.success) {
        setMessage({ text: `@${username} unpublished successfully.` });
        setReportsList((prev) =>
          prev.map((r) =>
            r.targetProfile.id === profileId
              ? {
                  ...r,
                  targetProfile: { ...r.targetProfile, isPublished: false },
                }
              : r
          )
        );
      } else {
        setMessage({ text: res.error, error: true });
      }
    } finally {
      setLoadingId(null);
    }
  };

  const handleUnpublishProject = async (projectId: string, title: string) => {
    if (!confirm(`Unpublish project "${title}"?`)) return;
    setLoadingId(`project-${projectId}`);
    try {
      const res = await unpublishProjectModerationAction(projectId);
      if (res.success) {
        setMessage({ text: `Project "${title}" unpublished successfully.` });
        setReportsList((prev) =>
          prev.map((r) =>
            r.targetProject?.id === projectId
              ? {
                  ...r,
                  targetProject: { ...r.targetProject, isPublished: false },
                }
              : r
          )
        );
      } else {
        setMessage({ text: res.error, error: true });
      }
    } finally {
      setLoadingId(null);
    }
  };

  const filteredReports = reportsList.filter((r) => {
    if (statusFilter === "all") return true;
    return r.status === statusFilter;
  });

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {(["all", "pending", "resolved", "dismissed"] as const).map((filter) => (
          <button
            key={filter}
            type="button"
            data-testid={`report-filter-${filter}`}
            onClick={() => setStatusFilter(filter)}
            className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
              statusFilter === filter
                ? "bg-white text-black font-bold"
                : "bg-zinc-900 text-zinc-400 hover:text-white border border-white/5"
            }`}
          >
            {filter} (
            {filter === "all"
              ? reportsList.length
              : reportsList.filter((r) => r.status === filter).length}
            )
          </button>
        ))}
      </div>

      {message && (
        <div
          data-testid="admin-reports-feedback"
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
                Target Entity
              </th>
              <th scope="col" className="px-6 py-3.5">
                Reason & Details
              </th>
              <th scope="col" className="px-6 py-3.5">
                Reporter Hash
              </th>
              <th scope="col" className="px-6 py-3.5">
                Status
              </th>
              <th scope="col" className="px-6 py-3.5">
                Reported
              </th>
              <th scope="col" className="px-6 py-3.5 text-right">
                Moderation Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06] text-zinc-300">
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                  No abuse reports found in this view.
                </td>
              </tr>
            ) : (
              filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-white/[0.02]">
                  {/* Target Entity */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/${report.targetProfile.username}`}
                        target="_blank"
                        className="font-bold text-white hover:underline decoration-dotted"
                      >
                        @{report.targetProfile.username}
                      </Link>
                      <span
                        className={`text-[9px] px-1 py-0.2 ${
                          report.targetProfile.isPublished
                            ? "bg-emerald-950 text-emerald-400"
                            : "bg-zinc-900 text-zinc-500"
                        }`}
                      >
                        {report.targetProfile.isPublished ? "LIVE" : "UNPUBLISHED"}
                      </span>
                    </div>

                    {report.targetProject && (
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-zinc-400">
                        <span>Project:</span>
                        <Link
                          href={`/${report.targetProfile.username}/work/${report.targetProject.slug}`}
                          target="_blank"
                          className="text-zinc-200 hover:underline decoration-dotted truncate max-w-[150px]"
                        >
                          /{report.targetProject.slug}
                        </Link>
                        <span
                          className={`text-[9px] px-1 py-0.2 ${
                            report.targetProject.isPublished
                              ? "bg-emerald-950 text-emerald-400"
                              : "bg-zinc-900 text-zinc-500"
                          }`}
                        >
                          {report.targetProject.isPublished ? "LIVE" : "UNPUBLISHED"}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Reason & Details */}
                  <td className="px-6 py-4 max-w-xs">
                    <span
                      data-testid={`report-reason-badge-${report.id}`}
                      className="inline-block px-2 py-0.5 bg-red-950/40 border border-red-500/30 text-red-300 text-[10px] uppercase font-bold tracking-wider mb-1"
                    >
                      {report.reason}
                    </span>
                    {report.description ? (
                      <p className="text-zinc-400 font-sans text-xs line-clamp-3 leading-relaxed">
                        {report.description}
                      </p>
                    ) : (
                      <span className="text-zinc-600 italic font-sans text-xs">
                        No description provided.
                      </span>
                    )}
                  </td>

                  {/* Reporter IP Hash */}
                  <td className="px-6 py-4">
                    <span
                      data-testid={`reporter-ip-hash-${report.id}`}
                      className="font-mono text-[11px] text-zinc-500"
                      title={report.reporterIpHash}
                    >
                      {report.reporterIpHash.slice(0, 12)}...
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      data-testid={`report-status-${report.id}`}
                      className={`inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider ${
                        report.status === "pending"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : report.status === "resolved"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {report.status}
                    </span>
                    {report.resolvedAt && (
                      <div className="text-[10px] text-zinc-500 mt-1">
                        {new Date(report.resolvedAt).toLocaleDateString()}
                      </div>
                    )}
                  </td>

                  {/* Reported Date */}
                  <td className="px-6 py-4 text-zinc-500 text-[11px]">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </td>

                  {/* Moderation Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end gap-1.5">
                      {report.status === "pending" && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            data-testid={`dismiss-report-${report.id}`}
                            disabled={loadingId === report.id}
                            onClick={() => handleResolve(report.id, "dismiss")}
                            className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 text-[10px] uppercase tracking-wider transition-colors disabled:opacity-50"
                          >
                            Dismiss
                          </button>
                          <button
                            type="button"
                            data-testid={`resolve-report-${report.id}`}
                            disabled={loadingId === report.id}
                            onClick={() => handleResolve(report.id, "action_taken")}
                            className="px-2.5 py-1 bg-white text-black hover:bg-zinc-200 text-[10px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                          >
                            Action Taken
                          </button>
                        </div>
                      )}

                      {/* Direct Unpublish Shortcut */}
                      {report.targetProfile.isPublished && (
                        <button
                          type="button"
                          data-testid={`unpublish-target-profile-${report.id}`}
                          disabled={loadingId === `profile-${report.targetProfile.id}`}
                          onClick={() =>
                            handleUnpublishProfile(
                              report.targetProfile.id,
                              report.targetProfile.username
                            )
                          }
                          className="text-[10px] font-mono uppercase text-red-400 hover:text-red-300 underline decoration-dotted"
                        >
                          Unpublish Portfolio
                        </button>
                      )}

                      {report.targetProject && report.targetProject.isPublished && (
                        <button
                          type="button"
                          data-testid={`unpublish-target-project-${report.id}`}
                          disabled={loadingId === `project-${report.targetProject.id}`}
                          onClick={() =>
                            handleUnpublishProject(
                              report.targetProject!.id,
                              report.targetProject!.title
                            )
                          }
                          className="text-[10px] font-mono uppercase text-red-400 hover:text-red-300 underline decoration-dotted"
                        >
                          Unpublish Project
                        </button>
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
