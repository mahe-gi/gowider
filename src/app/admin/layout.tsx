import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guards";

export const metadata = {
  title: "Admin Command Center — GoWider",
  description: "Platform moderation, abuse reports, and system telemetry.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let authData;
  try {
    authData = await requireAdmin();
  } catch (err: unknown) {
    const error = err as { code?: string };
    if (error?.code === "UNAUTHORIZED") {
      redirect("/signin");
    }
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="border border-red-500/30 bg-red-950/20 p-8 max-w-md w-full space-y-4">
          <span className="font-mono text-xs text-red-400 uppercase tracking-widest block">
            [ 403 // FORBIDDEN ]
          </span>
          <h1 className="font-display text-2xl font-bold uppercase text-white">
            Access Denied
          </h1>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed">
            Administrative privileges are strictly required to view this area.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-block px-4 py-2 border border-white/20 font-mono text-xs uppercase text-white hover:bg-zinc-900 transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { user } = authData;

  const NAV_LINKS = [
    { label: "Overview", href: "/admin" },
    { label: "Users", href: "/admin/users" },
    { label: "Profiles", href: "/admin/profiles" },
    { label: "Projects", href: "/admin/projects" },
    { label: "Reports Queue", href: "/admin/reports" },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Top Admin Header */}
      <header className="h-16 border-b border-white/10 bg-black/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="font-display text-lg font-black tracking-widest text-white uppercase">
              GOWIDER
            </span>
            <span className="px-1.5 py-0.5 bg-red-600/90 text-white font-mono text-[10px] uppercase font-bold tracking-widest">
              ADMIN
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right font-mono text-[11px]">
            <span className="text-zinc-200">{user.name}</span>
            <span className="text-zinc-500 text-[10px]">{user.email}</span>
          </div>

          <Link
            href="/"
            className="px-3 py-1.5 border border-white/10 font-mono text-xs uppercase tracking-wider text-zinc-400 hover:text-white hover:border-white/30 transition-colors"
          >
            Site ↗
          </Link>
        </div>
      </header>

      {/* Subnav for Mobile */}
      <div className="md:hidden border-b border-white/10 bg-black px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="px-3 py-1 font-mono text-xs uppercase tracking-wider text-zinc-400 hover:text-white shrink-0"
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8">
        {children}
      </main>
    </div>
  );
}
