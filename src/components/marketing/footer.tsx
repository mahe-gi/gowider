import Link from "next/link";
import { Logo } from "@/components/brand";

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/[0.08] bg-black text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Column 1: Brand & Status */}
          <div className="flex flex-col justify-between">
            <div>
              <Logo href="/" size="md" />
              <p className="mt-4 text-xs font-sans leading-relaxed text-zinc-400 max-w-xs">
                The editorial portfolio platform designed for video editors, motion designers, and visual storytellers.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-mono text-[11px] tracking-wider uppercase text-zinc-400">
                All systems operational
              </span>
            </div>
          </div>

          {/* Column 2: Product */}
          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.16em] text-white mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/#demo"
                  className="text-xs tracking-wider uppercase text-zinc-400 hover:text-white transition-colors"
                >
                  Work Showcase
                </Link>
              </li>
              <li>
                <Link
                  href="/#themes"
                  className="text-xs tracking-wider uppercase text-zinc-400 hover:text-white transition-colors"
                >
                  Cinema & Studio Themes
                </Link>
              </li>
              <li>
                <Link
                  href="/#how-it-works"
                  className="text-xs tracking-wider uppercase text-zinc-400 hover:text-white transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-xs tracking-wider uppercase text-zinc-400 hover:text-white transition-colors"
                >
                  ₹0 Launch Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform */}
          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.16em] text-white mb-4">
              Platform
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-xs tracking-wider uppercase text-zinc-400 hover:text-white transition-colors"
                >
                  About GoWider
                </Link>
              </li>
              <li>
                <Link
                  href="/explore"
                  className="text-xs tracking-wider uppercase text-zinc-400 hover:text-white transition-colors"
                >
                  Explore Creators
                </Link>
              </li>
              <li>
                <Link
                  href="/signin"
                  className="text-xs tracking-wider uppercase text-zinc-400 hover:text-white transition-colors"
                >
                  Creator Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/signin"
                  className="text-xs tracking-wider uppercase text-zinc-400 hover:text-white transition-colors"
                >
                  Create Portfolio
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Standards & Formats */}
          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.16em] text-white mb-4">
              Formats & Legal
            </h3>
            <ul className="space-y-3">
              <li className="text-xs tracking-wider uppercase text-zinc-500">
                YouTube 16:9 & Shorts
              </li>
              <li className="text-xs tracking-wider uppercase text-zinc-500">
                Instagram 9:16 Reels
              </li>
              <li className="text-xs tracking-wider uppercase text-zinc-500">
                Google Drive Streams
              </li>
              <li className="pt-2 border-t border-white/[0.05]">
                <span className="text-[11px] font-mono tracking-wider uppercase text-zinc-600 block">
                  Zero Video File Binaries Hosted
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
            © {new Date().getFullYear()} GoWider. Built for video editors.
          </p>
          <div className="flex items-center gap-6">
            <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-600">
              V1.0 Launch Baseline
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
