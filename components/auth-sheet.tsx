"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { X, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";

interface AuthSheetProps {
  isOpen: boolean;
  onClose: () => void;
  callbackUrl?: string;
}

export function AuthSheet({ isOpen, onClose, callbackUrl = "/dashboard" }: AuthSheetProps) {
  const [isLoading, setIsLoading] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const signInButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const isLoadingRef = useRef(isLoading);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  // Modal open/close lifecycle effect
  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current = document.activeElement as HTMLElement;
      setIsLoading(false);

      // Lock body scroll
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      // Initial focus inside modal
      const timer = setTimeout(() => {
        if (signInButtonRef.current) {
          signInButtonRef.current.focus();
        } else if (dialogRef.current) {
          const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length > 0) focusable[0].focus();
        }
      }, 50);

      function handleKeyDown(e: KeyboardEvent) {
        if (e.key === "Escape" && !isLoadingRef.current) {
          e.preventDefault();
          onCloseRef.current();
          return;
        }

        // Tab / Shift+Tab Focus Trap
        if (e.key === "Tab" && dialogRef.current) {
          const focusable = Array.from(
            dialogRef.current.querySelectorAll<HTMLElement>(
              'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
          );

          if (focusable.length === 0) return;

          const firstElement = focusable[0];
          const lastElement = focusable[focusable.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      }

      window.addEventListener("keydown", handleKeyDown);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        clearTimeout(timer);
        document.body.style.overflow = originalOverflow;
        if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === "function") {
          previousActiveElementRef.current.focus();
        }
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleGoogleSignIn() {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl });
    } catch (err) {
      console.error("Sign-in error:", err);
      setIsLoading(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-dialog-title"
      aria-describedby="auth-dialog-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        ref={dialogRef}
        className="relative w-full max-w-sm bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#121212]/10 space-y-6 animate-in zoom-in-95 duration-150"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-5 right-5 p-2 rounded-full text-[#8C877D] hover:text-[#111111] hover:bg-[#121212]/05 transition-colors disabled:opacity-50 cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* GoWider Brand Logo */}
        <div className="flex items-center">
          <div className="relative h-[32px] w-[125px] sm:h-[36px] sm:w-[140px]">
            <Image
              src="/brand/logo-wordmark.png"
              alt="GoWider"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </div>

        {/* Clean Auth Copy */}
        <div className="space-y-1.5">
          <h2 id="auth-dialog-title" className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
            Continue to GoWider
          </h2>
          <p id="auth-dialog-desc" className="text-xs sm:text-sm text-[#55524C] leading-relaxed">
            Sign in with Google to continue.
          </p>
        </div>

        {/* Google Sign-in Button */}
        <div className="pt-1">
          <button
            ref={signInButtonRef}
            type="button"
            disabled={isLoading}
            onClick={handleGoogleSignIn}
            className="w-full py-3 px-4 rounded-2xl bg-white border border-[#121212]/15 hover:border-[#121212]/30 shadow-xs hover:shadow-md text-[#111111] font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#FF441F]" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>{isLoading ? "Signing in…" : "Continue with Google"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
