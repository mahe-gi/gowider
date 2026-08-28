"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PlusCircle, LayoutDashboard } from "lucide-react";
import { useSession, signIn } from "next-auth/react";
import { ProfileMenu } from "./profile-menu";

interface PublicNavigationProps {
  onOpenAuth?: () => void;
}

export function PublicNavigation({ onOpenAuth }: PublicNavigationProps) {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleSignInClick() {
    if (onOpenAuth) {
      onOpenAuth();
    } else {
      signIn("google", { callbackUrl: "/dashboard" });
    }
  }

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#FBF9F5]/95 backdrop-blur-md border-b border-[#121212]/08 py-3 shadow-xs"
          : "bg-transparent py-4 sm:py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo -> Links to / */}
        <Link href="/" className="flex items-center group" title="GoWider">
          <div className="relative h-[34px] w-[130px] sm:h-[38px] sm:w-[145px]">
            <Image
              src="/brand/logo-wordmark.png"
              alt="GoWider"
              fill
              className="object-contain object-left transition-transform duration-200 group-hover:scale-102"
              priority
            />
          </div>
        </Link>

        {/* Center Links (Marketing Only) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#55524C]">
          <a href="/#how-it-works" className="hover:text-[#111111] transition-colors">
            How it works
          </a>
          <a href="/#languages" className="hover:text-[#111111] transition-colors">
            Languages
          </a>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <Link
                href="/dashboard"
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#111111] text-white rounded-full hover:bg-[#222222] transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
              <ProfileMenu user={session.user} />
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleSignInClick}
                className="px-3.5 py-1.5 text-xs sm:text-sm font-medium text-[#55524C] hover:text-[#111111] transition-colors cursor-pointer"
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/studio/new" })}
                className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#FF441F] hover:bg-[#E63814] rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Get started</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
