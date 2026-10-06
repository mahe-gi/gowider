"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand";

export function MarketingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-20 transition-all duration-300 ${
        scrolled
          ? "bg-black/90 backdrop-blur-md border-b border-white/[0.08]"
          : "bg-black/70 backdrop-blur-sm border-b border-white/[0.05]"
      }`}
    >
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Minimal Logo Left */}
        <Logo href="/" size="md" />

        {/* Desktop Navigation Links Center */}
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

        {/* Right CTA Group */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/signin"
            className="text-xs uppercase tracking-[0.12em] font-medium text-zinc-300 hover:text-white px-3 py-2 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signin"
            className="text-xs uppercase tracking-[0.12em] font-bold bg-white text-black px-4 py-2.5 rounded-none hover:bg-zinc-200 transition-colors"
          >
            Create Portfolio
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
            className="p-2 text-zinc-400 hover:text-white focus-visible:outline-none"
          >
            {mobileMenuOpen ? (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-20 bg-black/95 backdrop-blur-xl border-b border-white/[0.1] px-6 py-8 flex flex-col gap-6 shadow-2xl">
          <nav className="flex flex-col gap-4">
            <Link
              href="/#demo"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm uppercase tracking-[0.14em] font-medium text-zinc-300 hover:text-white py-1"
            >
              Work
            </Link>
            <Link
              href="/#themes"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm uppercase tracking-[0.14em] font-medium text-zinc-300 hover:text-white py-1"
            >
              Themes
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm uppercase tracking-[0.14em] font-medium text-zinc-300 hover:text-white py-1"
            >
              Pricing
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm uppercase tracking-[0.14em] font-medium text-zinc-300 hover:text-white py-1"
            >
              About
            </Link>
          </nav>
          <div className="pt-4 border-t border-white/[0.08] flex flex-col gap-3">
            <Link
              href="/signin"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center text-xs uppercase tracking-[0.14em] font-medium text-zinc-300 hover:text-white py-3 border border-white/20"
            >
              Sign In
            </Link>
            <Link
              href="/signin"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center text-xs uppercase tracking-[0.14em] font-bold bg-white text-black py-3 hover:bg-zinc-200"
            >
              Create Portfolio
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
