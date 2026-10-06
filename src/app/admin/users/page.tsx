import Link from "next/link";
import { getAdminUsers } from "@/features/admin/queries";

export default async function AdminUsersPage() {
  const users = await getAdminUsers();

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
            USERS
          </span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-2">
          USER ACCOUNTS ({users.length})
        </h1>
        <p className="text-zinc-400 text-xs sm:text-sm mt-1">
          Registered authentication identities and linked creator profiles.
        </p>
      </div>

      <div className="border border-white/10 overflow-x-auto bg-black">
        <table className="w-full text-left font-mono text-xs divide-y divide-white/10">
          <thead className="bg-zinc-950 text-zinc-400 uppercase tracking-wider text-[11px]">
            <tr>
              <th scope="col" className="px-6 py-3.5">
                User
              </th>
              <th scope="col" className="px-6 py-3.5">
                Role
              </th>
              <th scope="col" className="px-6 py-3.5">
                Portfolio Profile
              </th>
              <th scope="col" className="px-6 py-3.5">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06] text-zinc-300">
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                  No user accounts registered.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.02]">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white">{u.name}</div>
                    <div className="text-zinc-500 text-[11px]">{u.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider ${
                        u.role === "admin"
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {u.profile ? (
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/${u.profile.username}`}
                          target="_blank"
                          className="text-white hover:underline decoration-dotted"
                        >
                          @{u.profile.username}
                        </Link>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 ${
                            u.profile.isPublished
                              ? "text-emerald-400 bg-emerald-950/40"
                              : "text-zinc-500 bg-zinc-900"
                          }`}
                        >
                          {u.profile.isPublished ? "LIVE" : "DRAFT"}
                        </span>
                      </div>
                    ) : (
                      <span className="text-zinc-600">No profile claimed</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-zinc-500 text-[11px]">
                    {new Date(u.createdAt).toLocaleDateString()}
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
