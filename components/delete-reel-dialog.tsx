"use client";

import { useState, useRef, useEffect } from "react";
import { Trash2, AlertTriangle, Loader2, X } from "lucide-react";

interface DeleteReelDialogProps {
  isOpen: boolean;
  projectId: string;
  reelName?: string;
  onClose: () => void;
  onDeleted: (projectId: string) => void;
}

export function DeleteReelDialog({
  isOpen,
  projectId,
  reelName = "this Reel",
  onClose,
  onDeleted,
}: DeleteReelDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const deleteInFlightRef = useRef(false);
  const isDeletingRef = useRef(isDeleting);
  const onCloseRef = useRef(onClose);
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // Keep refs synchronized with latest props/state
  useEffect(() => {
    isDeletingRef.current = isDeleting;
  }, [isDeleting]);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Modal open/close lifecycle effect: strictly depends on isOpen
  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current = document.activeElement as HTMLElement;
      setErrorMessage(null);
      deleteInFlightRef.current = false;
      setIsDeleting(false);

      // Lock body scroll
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      // Initial focus inside modal
      const timer = setTimeout(() => {
        if (cancelButtonRef.current) {
          cancelButtonRef.current.focus();
        } else if (dialogRef.current) {
          const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
          if (focusable.length > 0) focusable[0].focus();
        }
      }, 50);

      function handleKeyDown(e: KeyboardEvent) {
        if (e.key === "Escape" && !isDeletingRef.current) {
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

  async function handleDelete() {
    if (deleteInFlightRef.current || isDeleting) return;
    deleteInFlightRef.current = true;
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 202 || (data && data.status === "deletion_in_progress")) {
        setErrorMessage("Deletion is currently in progress. Please check back in a few moments.");
        deleteInFlightRef.current = false;
        setIsDeleting(false);
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to delete Reel.");
      }

      onDeleted(projectId);
      onClose();
    } catch (err: any) {
      console.error("Delete Reel error:", err);
      setErrorMessage(err.message || "Failed to delete Reel. Please try again.");
      deleteInFlightRef.current = false;
      setIsDeleting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        ref={dialogRef}
        className="relative w-full max-w-md bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#121212]/10 space-y-6 animate-in zoom-in-95 duration-150"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-5 right-5 p-2 rounded-full text-[#8C877D] hover:text-[#111111] hover:bg-[#121212]/05 transition-colors disabled:opacity-50 cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF1EE] border border-[#FF441F]/20 flex items-center justify-center text-[#FF441F] shrink-0">
            <Trash2 className="w-6 h-6" />
          </div>
          <div className="space-y-1 pr-6">
            <h3 id="delete-dialog-title" className="text-xl font-bold text-[#111111]">
              Delete this Reel?
            </h3>
            <p id="delete-dialog-desc" className="text-xs text-[#55524C] leading-relaxed">
              This will permanently remove <span className="font-semibold text-[#111111]">“{reelName}”</span> and its localized versions from GoWider. This action cannot be undone.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] flex items-start gap-2.5 text-xs text-[#DC2626] font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#55524C] hover:text-[#111111] hover:bg-[#121212]/05 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold shadow-sm hover:shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting…</span>
              </>
            ) : (
              <span>Delete Reel</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
