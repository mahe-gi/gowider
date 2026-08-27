"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PlusCircle, Wallet, LogOut, Film } from "lucide-react";

interface NavigationProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  walletBalancePaise?: number;
  onOpenTopup?: () => void;
  onOpenAuth?: () => void;
  onSignOut?: () => void;
}

export function Navigation({
  user,
  walletBalancePaise = 0,
  onOpenTopup,
  onOpenAuth,
  onSignOut,
}: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const formattedCredits = `₹${(walletBalancePaise / 100).toFixed(0)}`;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-[#FBF9F5]/90 backdrop-blur-md border-b border-[#121212]/05 py-3 shadow-xs"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative h-8 w-32 sm:h-9 sm:w-36">
            <Image
              src="/brand/logo.png"
              alt="GoWider"
              fill
              className="object-contain object-left transition-transform duration-300 group-hover:scale-102"
              priority
            />
          </div>
        </Link>

        {/* Center Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#55524C]">
          <a href="#how-it-works" className="hover:text-[#111111] transition-colors">
            How it works
          </a>
          <a href="#languages" className="hover:text-[#111111] transition-colors">
            Languages
          </a>
          {user && (
            <Link href="/projects" className="hover:text-[#111111] flex items-center gap-1.5 transition-colors">
              <Film className="w-4 h-4" />
              <span>My Reels</span>
            </Link>
          )}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Wallet Pill */}
              <button
                onClick={onOpenTopup}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium bg-[#FFFFFF] border border-[#121212]/10 rounded-full shadow-xs hover:border-[#FF441F]/40 hover:bg-[#FFF5F2] transition-all cursor-pointer"
                title="Click to add credits"
              >
                <Wallet className="w-3.5 h-3.5 text-[#FF441F]" />
                <span className="text-[#111111] font-semibold">{formattedCredits}</span>
                <span className="text-[#8C877D] text-xs hidden sm:inline">credits</span>
              </button>

              {/* User Avatar & Logout */}
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#121212]/15 bg-[#EAE6DD] flex items-center justify-center text-xs font-semibold">
                  {user.image ? (
                    <Image src={user.image} alt={user.name || "User"} fill className="object-cover" />
                  ) : (
                    <span>{(user.name || user.email || "U")[0].toUpperCase()}</span>
                  )}
                </div>
                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    className="p-2 text-[#8C877D] hover:text-[#111111] transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              {onOpenAuth && (
                <button
                  onClick={onOpenAuth}
                  className="px-3.5 py-1.5 text-xs sm:text-sm font-medium text-[#55524C] hover:text-[#111111] transition-colors cursor-pointer"
                >
                  Sign in
                </button>
              )}
              <a
                href="#studio"
                className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#111111] hover:bg-[#222222] rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-[#FF441F]" />
                <span>Localize a Reel</span>
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
