"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, Film, CreditCard, User, LogOut, ChevronDown } from "lucide-react";
import { signOut } from "next-auth/react";

interface ProfileMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function ProfileMenu({ user }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const initials = (user.name || user.email || "U")[0].toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full border border-[#121212]/15 bg-white hover:border-[#121212]/30 shadow-2xs hover:shadow-xs transition-all cursor-pointer select-none"
      >
        <div className="relative w-7 h-7 rounded-full overflow-hidden bg-[#EAE6DD] flex items-center justify-center text-xs font-bold text-[#111111] shrink-0">
          {user.image && !imgError ? (
            <Image
              src={user.image}
              alt={user.name || "Profile"}
              fill
              unoptimized
              onError={() => setImgError(true)}
              className="object-cover"
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <span className="text-xs font-semibold text-[#111111] max-w-[100px] truncate hidden sm:inline">
          {user.name || user.email?.split("@")[0] || "Account"}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#8C877D] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#FAF8F5] border border-[#121212]/12 shadow-2xl p-2 space-y-1.5 z-[60] animate-in fade-in zoom-in-95 duration-150"
        >
          {/* User Header Profile */}
          <div className="px-3 py-2.5 rounded-xl bg-white border border-[#121212]/06 space-y-0.5">
            <p className="text-xs font-bold text-[#111111] truncate">{user.name || "Creator"}</p>
            <p className="text-[11px] font-mono text-[#8C877D] truncate">{user.email || ""}</p>
          </div>

          {/* Nav Items */}
          <div className="space-y-0.5 pt-1">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#55524C] hover:text-[#111111] hover:bg-[#121212]/05 rounded-xl transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-[#8C877D]" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/projects"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#55524C] hover:text-[#111111] hover:bg-[#121212]/05 rounded-xl transition-colors"
            >
              <Film className="w-4 h-4 text-[#8C877D]" />
              <span>My Reels</span>
            </Link>

            <Link
              href="/billing"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#55524C] hover:text-[#111111] hover:bg-[#121212]/05 rounded-xl transition-colors"
            >
              <CreditCard className="w-4 h-4 text-[#8C877D]" />
              <span>Credits & billing</span>
            </Link>

            <Link
              href="/account"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#55524C] hover:text-[#111111] hover:bg-[#121212]/05 rounded-xl transition-colors"
            >
              <User className="w-4 h-4 text-[#8C877D]" />
              <span>Account</span>
            </Link>
          </div>

          {/* Sign Out Divider */}
          <div className="pt-1 border-t border-[#121212]/08">
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#EF4444] hover:bg-[#FEF2F2] rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-[#EF4444]" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
