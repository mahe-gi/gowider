import Link from "next/link";
import { getAdminReports } from "@/features/admin/queries";
import { ReportsTable } from "./reports-table";

export default async function AdminReportsPage() {
  const reports = await getAdminReports();

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="font-mono text-xs text-zinc-500 hover:text-zinc-300"
          >
            ← COMMAND CENTER
          </Link>
          <span className="text-zinc-700">/</span>
          <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">
            REPORTS QUEUE
          </span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-2">
          ABUSE & MODERATION QUEUE ({reports.length})
        </h1>
        <p className="text-zinc-400 text-xs sm:text-sm mt-1">
          Review community reports regarding spam, copyright violations, and inappropriate content.
        </p>
      </div>

      <ReportsTable initialReports={reports} />
    </div>
  );
}
