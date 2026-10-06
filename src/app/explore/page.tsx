import Link from "next/link";
import { getExploreCreators } from "@/features/explore/queries";
import { ExploreClientGrid } from "./explore-client-grid";

interface ExplorePageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
  }>;
}

export const metadata = {
  title: "Explore Creators — GoWider",
  description:
    "Discover world-class video editors, colorists, and post-production filmmakers showcasing their best work.",
};

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const resolvedParams = await searchParams;
  const initialSearch = resolvedParams?.q || "";
  const initialCategory = resolvedParams?.category || "all";

  const creators = await getExploreCreators({
    search: initialSearch,
    category: initialCategory === "all" ? undefined : initialCategory,
  });

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* Editorial Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-20 bg-black/80 backdrop-blur-md border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 group focus-visible:outline-none"
          >
            <span className="font-display text-xl sm:text-2xl font-black tracking-[0.2em] text-white uppercase group-hover:text-zinc-300 transition-colors">
              GOWIDER
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-white opacity-60" />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/#demo"
              className="text-xs uppercase tracking-[0.14em] font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Work
            </Link>
            <Link
              href="/#themes"
              className="text-xs uppercase tracking-[0.14em] font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Themes
            </Link>
            <Link
              href="/explore"
              className="text-xs uppercase tracking-[0.14em] font-bold text-white transition-colors"
            >
              Explore
            </Link>
            <Link
              href="/pricing"
              className="text-xs uppercase tracking-[0.14em] font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className="text-xs uppercase tracking-[0.14em] font-medium text-zinc-400 hover:text-white transition-colors"
            >
              About
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/signin"
              className="hidden sm:inline-block text-xs uppercase tracking-[0.12em] font-medium text-zinc-300 hover:text-white px-3 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/onboarding"
              className="text-xs uppercase tracking-[0.12em] font-bold bg-white text-black px-4 py-2.5 hover:bg-zinc-200 transition-colors"
            >
              Create Portfolio
            </Link>
          </div>
        </div>
      </header>

      {/* Hero & Directory Container */}
      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Section Tag & Headline */}
        <div className="space-y-4 mb-12">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-500 block">
            [ DIRECTORY // PUBLIC SHOWCASE ]
          </span>
          <h1 className="font-display text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-white leading-none">
            EXPLORE CREATORS
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base max-w-2xl font-sans leading-relaxed">
            Discover independent video editors, colorists, and post-production filmmakers showcasing verified portfolio work.
          </p>
        </div>

        {/* Client interactive search, filter pills, and responsive 3-column grid */}
        <ExploreClientGrid
          initialCreators={creators}
          initialSearch={initialSearch}
          initialCategory={initialCategory}
        />
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-white/[0.08] py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-zinc-500">
        <div>© {new Date().getFullYear()} GOWIDER. ALL RIGHTS RESERVED.</div>
        <div className="flex items-center gap-6">
          <Link href="/pricing" className="hover:text-zinc-300 transition-colors">
            PRICING
          </Link>
          <Link href="/about" className="hover:text-zinc-300 transition-colors">
            ABOUT
          </Link>
          <Link href="/onboarding" className="hover:text-zinc-300 transition-colors">
            CREATE PORTFOLIO
          </Link>
        </div>
      </footer>
    </div>
  );
}
