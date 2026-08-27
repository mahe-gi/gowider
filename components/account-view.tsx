"use client";

import { useState } from "react";
import Image from "next/image";
import { User, Mail, Shield, Calendar, Check, Loader2, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

interface AccountViewProps {
  user: {
    id: string;
    displayName: string;
    email: string;
    avatarUrl?: string | null;
    authProvider: string;
    createdAt: string | Date;
  };
}

export function AccountView({ user }: AccountViewProps) {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSaveName() {
    if (!displayName.trim()) return;
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: displayName.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to update display name.");
      }

      setIsEditing(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save.");
    } finally {
      setIsSaving(false);
    }
  }

  const memberSinceFormatted = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#111111]">
          Account Settings
        </h1>
        <p className="text-sm text-[#55524C]">
          Manage your creator profile and connected Google identity.
        </p>
      </div>

      {/* Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#121212]/10 shadow-sm space-y-6">
        {/* Avatar & Identifiers */}
        <div className="flex items-center gap-4 pb-6 border-b border-[#121212]/08">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-[#EAE6DD] flex items-center justify-center text-xl font-bold text-[#111111] shrink-0 border border-[#121212]/15">
            {user.avatarUrl && !imgError ? (
              <Image
                src={user.avatarUrl}
                alt={user.displayName}
                fill
                unoptimized
                onError={() => setImgError(true)}
                className="object-cover"
              />
            ) : (
              <span>{(user.displayName || "U")[0].toUpperCase()}</span>
            )}
          </div>
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold text-[#111111]">{user.displayName}</h2>
            <p className="text-xs font-mono text-[#8C877D]">{user.email}</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-5">
          {/* Display Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#8C877D] font-semibold">
              Display Name
            </label>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#121212]/20 focus:border-[#FF441F] focus:outline-hidden text-sm font-medium"
                  placeholder="Your Name"
                />
                <button
                  type="button"
                  disabled={isSaving || !displayName.trim()}
                  onClick={handleSaveName}
                  className="px-4 py-2.5 rounded-xl bg-[#FF441F] hover:bg-[#E63814] text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save</span>
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => {
                    setDisplayName(user.displayName);
                    setIsEditing(false);
                  }}
                  className="px-3 py-2.5 rounded-xl border border-[#121212]/15 hover:bg-[#121212]/05 text-xs font-medium text-[#55524C] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#121212]/06">
                <span className="text-sm font-medium text-[#111111]">{displayName}</span>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-xs font-semibold text-[#FF441F] hover:text-[#E63814] cursor-pointer"
                >
                  Edit
                </button>
              </div>
            )}
            {savedSuccess && (
              <p className="text-xs text-[#16A34A] font-medium animate-in fade-in">
                Display name updated.
              </p>
            )}
            {errorMessage && (
              <p className="text-xs text-[#DC2626] font-medium">{errorMessage}</p>
            )}
          </div>

          {/* Email (Read-Only) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#8C877D] font-semibold">
              Email Address
            </label>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#121212]/06 text-sm text-[#55524C]">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#8C877D]" />
                <span className="font-mono">{user.email}</span>
              </div>
              <span className="text-[11px] text-[#8C877D] font-mono">Read-only</span>
            </div>
          </div>

          {/* Connected Identity */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#8C877D] font-semibold">
              Connected Account
            </label>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#121212]/06 text-sm text-[#111111]">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#22C55E]" />
                <span className="font-medium capitalize">{user.authProvider} OAuth</span>
              </div>
              <span className="text-xs text-[#22C55E] font-semibold font-mono">Connected</span>
            </div>
          </div>

          {/* Member Since */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#8C877D] font-semibold">
              Member Since
            </label>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FAF8F5] border border-[#121212]/06 text-sm text-[#55524C]">
              <Calendar className="w-4 h-4 text-[#8C877D]" />
              <span>{memberSinceFormatted}</span>
            </div>
          </div>
        </div>

        {/* Sign Out Action */}
        <div className="pt-6 border-t border-[#121212]/08 flex justify-end">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#EF4444]/30 text-[#EF4444] hover:bg-[#FEF2F2] text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out of GoWider</span>
          </button>
        </div>
      </div>
    </div>
  );
}
