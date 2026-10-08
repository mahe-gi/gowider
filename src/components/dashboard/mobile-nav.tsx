"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { LogoMark } from "@/components/brand";
import { navItems } from "./sidebar";

export function MobileDashboardNav() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer when route changes
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [drawerOpen]);

  // Bottom quick links: Top 4 most frequent actions
  const primaryBottomLinks = [
    { name: "Overview", href: "/dashboard" },
    { name: "Work", href: "/dashboard/work" },
    { name: "Design", href: "/dashboard/design" },
    { name: "Profile", href: "/dashboard/profile" },
  ];

  return (
    <>
      {/* 1. Mobile Top Bar with Hamburger */}
      <div className="md:hidden flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2">
          <LogoMark withBadge size={24} />
          <span className="text-sm font-bold tracking-tight text-white">GoWider</span>
        </Link>

        <button
          type="button"
          aria-label={drawerOpen ? "Close menu" : "Open navigation menu"}
          onClick={() => setDrawerOpen(!drawerOpen)}
          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white transition"
        >
          {drawerOpen ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* 2. Slide-over Mobile Drawer Backdrop & Menu */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative ml-auto flex h-full w-4/5 max-w-xs flex-col justify-between border-l border-zinc-800 bg-zinc-950 p-5 shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">
                  Navigation
                </span>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-white"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <nav className="mt-4 space-y-1">
                {navItems.map((item) => {
                  const isActive =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={clsx(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-zinc-800/90 text-white shadow-sm"
                          : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                      )}
                    >
                      <item.icon
                        className={clsx(
                          "h-4 w-4 shrink-0",
                          isActive ? "text-white" : "text-zinc-500"
                        )}
                      />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Upgrade Banner */}
            <div className="pt-4 border-t border-zinc-800/80 space-y-3">
              <Link
                href="/dashboard/billing"
                className="group block rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 hover:bg-amber-500/10 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold tracking-widest text-amber-300 uppercase">
                    GoWider Pro
                  </span>
                  <span className="text-[10px] font-semibold text-amber-400">
                    ₹299/mo →
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-zinc-400 leading-snug">
                  Unlock unlimited works, custom booking CTAs &amp; Pro aesthetics.
                </p>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 3. Mobile Bottom Tab Bar */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex h-14 items-center justify-around border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md px-2"
      >
        {primaryBottomLinks.map((tab) => {
          const isActive =
            tab.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={clsx(
                "flex flex-1 flex-col items-center justify-center py-1 text-[11px] font-medium transition-colors",
                isActive
                  ? "text-white font-semibold"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <span className={clsx("rounded-full px-2 py-0.5 transition", isActive && "bg-zinc-800 text-white")}>
                {tab.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
