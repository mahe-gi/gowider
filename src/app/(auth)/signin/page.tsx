"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Logo } from "@/components/brand";
import { signIn } from "@/lib/auth-client";

function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signIn.social({
        provider: "google",
        callbackURL: callbackUrl,
      });
    } catch (err: unknown) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Failed to initiate Google sign-in. Please try again.");
    }
  };

  return (
    <div className="border border-white/10 bg-[#0A0A0A]/90 p-8 sm:p-10 shadow-2xl backdrop-blur-md">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 border border-white/10 bg-white/[0.03]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400">
              CREATOR ACCESS
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white leading-tight mb-3">
            YOUR REEL DESERVES BETTER THAN A CHAT THREAD.
          </h1>

          <p className="text-zinc-400 text-sm font-sans leading-relaxed mb-8">
            Connect your YouTube, Instagram, and Drive edits into an Awwwards-grade portfolio in minutes.
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
              {error}
            </div>
          )}

          {/* Google Sign In CTA */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full h-14 bg-white text-black font-mono text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-zinc-200 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg"
          >
            {loading ? (
              <span className="animate-pulse">CONNECTING TO GOOGLE...</span>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                CONTINUE WITH GOOGLE ↗
              </>
            )}
          </button>

          {/* Micro Guarantee */}
          <div className="mt-6 pt-6 border-t border-white/[0.06] text-center">
            <p className="text-[11px] text-zinc-500 font-mono leading-relaxed">
              Zero passwords to remember. By signing in, you agree to our free launch terms. We never post to your account.
            </p>
          </div>
        </div>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden">
      {/* Background Subtle Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-white/[0.04] to-transparent blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="flex items-center justify-between z-10">
        <Logo href="/" size="sm" />
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
        >
          ← Back to home
        </Link>
      </header>

      {/* Main Card */}
      <main className="max-w-md w-full mx-auto my-auto z-10">
        <Suspense fallback={<div className="text-center font-mono text-xs text-zinc-500">Loading sign-in...</div>}>
          <SignInForm />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="z-10 text-center">
        <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
          GOWIDER // BROADCAST-GRADE PORTFOLIO ARCHITECTURE
        </p>
      </footer>
    </div>
  );
}

