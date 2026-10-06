import Link from "next/link";
import { getAdminMetrics } from "@/features/admin/queries";

export default async function AdminOverviewPage() {
  const metrics = await getAdminMetrics();

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <span className="font-mono text-xs uppercase tracking-widest text-zinc-500 block mb-1">
          [ SYSTEM // TELEMETRY ]
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
          COMMAND CENTER
        </h1>
        <p className="text-zinc-400 text-sm mt-1 font-sans">
          Platform-wide operational metrics, user moderation, and abuse reporting queue.
        </p>
      </div>

      {/* Metrics 4-Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="border border-white/10 bg-black/60 p-6 flex flex-col justify-between">
          <div className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
            Registered Users
          </div>
          <div className="mt-4">
            <span className="font-mono text-3xl sm:text-4xl font-bold text-white">
              {metrics.totalUsers}
            </span>
          </div>
          <div className="mt-2 font-mono text-[10px] text-zinc-500">
            Auth identities created
          </div>
        </div>

        {/* Live Profiles */}
        <div className="border border-white/10 bg-black/60 p-6 flex flex-col justify-between">
          <div className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
            Live Profiles
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-mono text-3xl sm:text-4xl font-bold text-emerald-400">
              {metrics.liveProfiles}
            </span>
            <span className="font-mono text-xs text-zinc-500">
              / {metrics.totalProfiles} total
            </span>
          </div>
          <div className="mt-2 font-mono text-[10px] text-zinc-500">
            Publicly accessible URLs
          </div>
        </div>

        {/* Published Projects */}
        <div className="border border-white/10 bg-black/60 p-6 flex flex-col justify-between">
          <div className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
            Published Projects
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-mono text-3xl sm:text-4xl font-bold text-white">
              {metrics.publishedProjects}
            </span>
            <span className="font-mono text-xs text-zinc-500">
              / {metrics.totalProjects} total
            </span>
          </div>
          <div className="mt-2 font-mono text-[10px] text-zinc-500">
            Active portfolio case studies
          </div>
        </div>

        {/* Pending Reports */}
        <div
          className={`border p-6 flex flex-col justify-between ${
            metrics.pendingReports > 0
              ? "border-amber-500/40 bg-amber-950/20"
              : "border-white/10 bg-black/60"
          }`}
        >
          <div className="font-mono text-[11px] uppercase tracking-wider text-zinc-400 flex items-center justify-between">
            <span>Abuse Reports</span>
            {metrics.pendingReports > 0 && (
              <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 font-mono text-[10px]">
                ACTION REQUIRED
              </span>
            )}
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span
              className={`font-mono text-3xl sm:text-4xl font-bold ${
                metrics.pendingReports > 0 ? "text-amber-400" : "text-zinc-400"
              }`}
            >
              {metrics.pendingReports}
            </span>
            <span className="font-mono text-xs text-zinc-500">
              pending ({metrics.resolvedReports} resolved)
            </span>
          </div>
          <div className="mt-2 font-mono text-[10px] text-zinc-500">
            Submissions in review queue
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* Reports Queue Card */}
        <Link
          href="/admin/reports"
          className="group border border-white/10 hover:border-white/30 bg-black p-6 transition-all"
        >
          <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
            [ QUEUE ]
          </div>
          <h3 className="font-display text-lg font-bold uppercase text-white group-hover:text-zinc-300">
            Review Abuse Reports →
          </h3>
          <p className="text-xs text-zinc-400 mt-2 font-sans leading-relaxed">
            Inspect pending copyright, impersonation, and spam tickets. Dismiss or take moderation action with full audit tracking.
          </p>
        </Link>

        {/* Profiles Moderation */}
        <Link
          href="/admin/profiles"
          className="group border border-white/10 hover:border-white/30 bg-black p-6 transition-all"
        >
          <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
            [ PROFILES ]
          </div>
          <h3 className="font-display text-lg font-bold uppercase text-white group-hover:text-zinc-300">
            Manage Creator Profiles →
          </h3>
          <p className="text-xs text-zinc-400 mt-2 font-sans leading-relaxed">
            Audit creator bios, project counts, and publication statuses. Instantly unpublish violating portfolios.
          </p>
        </Link>

        {/* Project Showcase Moderation */}
        <Link
          href="/admin/projects"
          className="group border border-white/10 hover:border-white/30 bg-black p-6 transition-all"
        >
          <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
            [ PROJECTS ]
          </div>
          <h3 className="font-display text-lg font-bold uppercase text-white group-hover:text-zinc-300">
            Moderate Projects →
          </h3>
          <p className="text-xs text-zinc-400 mt-2 font-sans leading-relaxed">
            Inspect individual project case studies across YouTube, Instagram, and Drive. Unpublish non-compliant entries.
          </p>
        </Link>
      </div>

      {/* System Status Footprint */}
      <div className="border border-white/10 bg-black/40 p-6 space-y-4">
        <span className="font-mono text-xs uppercase tracking-widest text-zinc-500 block">
          [ INFRASTRUCTURE // STATUS ]
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Database: Connected (Neon)</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Auth: Better Auth Active</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Throttling: Advisory Xact Lock (5/hr)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
