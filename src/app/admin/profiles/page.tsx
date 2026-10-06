import Link from "next/link";
import { getAdminProfiles } from "@/features/admin/queries";
import { ProfilesTable } from "./profiles-table";

export default async function AdminProfilesPage() {
  const profiles = await getAdminProfiles();

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
            PROFILES
          </span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-2">
          CREATOR PROFILES ({profiles.length})
        </h1>
        <p className="text-zinc-400 text-xs sm:text-sm mt-1">
          Review live creator portfolios and immediately unpublish violating creators.
        </p>
      </div>

      <ProfilesTable initialProfiles={profiles} />
    </div>
  );
}
