"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlusCircle, Wallet, LayoutDashboard, Film, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import { ProfileMenu } from "./profile-menu";

interface AppNavigationProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  walletBalancePaise?: number;
  onOpenTopup?: () => void;
}

export function AppNavigation({
  user: explicitUser,
  walletBalancePaise: explicitWalletBalance,
  onOpenTopup,
}: AppNavigationProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(explicitWalletBalance ?? 0);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sync wallet balance
  useEffect(() => {
    if (explicitWalletBalance !== undefined) {
      setWalletBalance(explicitWalletBalance);
      return;
    }

    if (session?.user?.id) {
      fetch("/api/wallet")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.success) {
            setWalletBalance(data.data.availablePaise || 0);
          }
        })
        .catch(() => {});
    }
  }, [session, explicitWalletBalance]);

  const activeUser = explicitUser !== undefined ? explicitUser : session?.user;
  const formattedCredits = `₹${(walletBalance / 100).toFixed(0)}`;

  const isDashboard = pathname === "/dashboard";
  const isStudioNew = pathname === "/studio/new";
  const isProjects = pathname === "/projects";

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#FBF9F5]/95 backdrop-blur-md border-b border-[#121212]/08 py-3 shadow-xs"
          : "bg-transparent py-4 sm:py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo -> Links to /dashboard for authenticated creators */}
        <Link href="/dashboard" className="flex items-center group" title="Go to Dashboard">
          <div className="relative h-[30px] w-[120px] sm:h-[34px] sm:w-[136px]">
            <Image
              src="/brand/logo-wordmark.png"
              alt="GoWider"
              fill
              className="object-contain object-left transition-transform duration-200 group-hover:scale-102"
              priority
            />
          </div>
        </Link>

        {/* Center Primary App Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#EAE6DD]/60 p-1 rounded-full border border-[#121212]/06">
          <Link
            href="/dashboard"
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
              isDashboard
                ? "bg-white text-[#111111] shadow-2xs"
                : "text-[#55524C] hover:text-[#111111] hover:bg-white/40"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/studio/new"
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
              isStudioNew
                ? "bg-white text-[#FF441F] shadow-2xs font-bold"
                : "text-[#55524C] hover:text-[#111111] hover:bg-white/40"
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#FF441F]" />
            <span>New Reel</span>
          </Link>

          <Link
            href="/projects"
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
              isProjects
                ? "bg-white text-[#111111] shadow-2xs"
                : "text-[#55524C] hover:text-[#111111] hover:bg-white/40"
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>My Reels</span>
          </Link>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {status === "loading" ? (
            <div className="w-8 h-8 rounded-full bg-[#EAE6DD] animate-pulse" />
          ) : activeUser ? (
            <>
              {/* Wallet Pill */}
              <Link
                href={onOpenTopup ? "#" : "/billing"}
                onClick={(e) => {
                  if (onOpenTopup) {
                    e.preventDefault();
                    onOpenTopup();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium bg-white border border-[#121212]/10 rounded-full shadow-xs hover:border-[#FF441F]/40 hover:bg-[#FFF5F2] transition-all cursor-pointer"
                title="Click to view credits & billing"
              >
                <Wallet className="w-3.5 h-3.5 text-[#FF441F]" />
                <span className="text-[#111111] font-semibold">{formattedCredits}</span>
                <span className="text-[#8C877D] text-xs hidden sm:inline">credits</span>
              </Link>

              {/* Profile Dropdown Menu */}
              <ProfileMenu user={activeUser} />
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
