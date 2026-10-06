"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { submitReportAction } from "../actions/submit-report";
import type { ReportReason } from "../types";

interface ReportModalProps {
  username: string;
  projectSlug?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const REASONS: { label: string; value: ReportReason }[] = [
  { label: "Spam or Scam", value: "spam" },
  { label: "Copyright Violation", value: "copyright" },
  { label: "Inappropriate Content", value: "inappropriate" },
  { label: "Impersonation", value: "impersonation" },
  { label: "Other Violation", value: "other" },
];

export function ReportModal({
  username,
  projectSlug,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: ReportModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = setControlledOpen || setInternalOpen;

  const [reason, setReason] = useState<ReportReason>("spam");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const resetForm = () => {
    setReason("spam");
    setDescription("");
    setErrorMessage(null);
    setIsSuccess(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    setIsOpen(newOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await submitReportAction({
        username,
        projectSlug,
        reason,
        description: description.trim() || undefined,
      });

      if (!response.success) {
        setErrorMessage(response.error);
      } else {
        setIsSuccess(true);
      }
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      {trigger ? (
        <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      ) : (
        <Dialog.Trigger asChild>
          <button
            type="button"
            data-testid="report-portfolio-trigger"
            className="hover:text-zinc-400 transition-colors underline decoration-dotted text-xs font-mono"
          >
            Report this portfolio
          </button>
        </Dialog.Trigger>
      )}

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-describedby="report-modal-description"
          className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] border border-white/10 bg-zinc-950 p-6 sm:p-8 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 focus:outline-none"
        >
          <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase block mb-1">
                [ TRUST & SAFETY ]
              </span>
              <Dialog.Title className="font-display text-lg sm:text-xl font-bold uppercase tracking-wider text-white">
                Report {projectSlug ? "Project" : "Portfolio"}
              </Dialog.Title>
            </div>
            <Dialog.Close
              data-testid="close-report-modal"
              aria-label="Close dialog"
              className="text-zinc-400 hover:text-white p-1 transition-colors focus:outline-none"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Dialog.Close>
          </div>

          <p id="report-modal-description" className="mt-3 text-xs text-zinc-400 leading-relaxed font-sans">
            Submit a report regarding violations of our terms, copyright infringement, or inappropriate content on{" "}
            <span className="font-mono text-zinc-200">@{username}</span>
            {projectSlug && (
              <>
                {" "}
                (project: <span className="font-mono text-zinc-200">{projectSlug}</span>)
              </>
            )}
            . All reports are confidential and reviewed by administrators.
          </p>

          {isSuccess ? (
            <div data-testid="report-success-state" className="mt-6 space-y-4 py-4 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="font-display font-semibold text-white uppercase tracking-wider text-sm">
                Report Received
              </h4>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Thank you for helping keep the GoWider community safe. Our team has queued this item for administrative review.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  data-testid="report-done-btn"
                  onClick={() => handleOpenChange(false)}
                  className="px-6 py-2.5 bg-white text-black font-mono text-xs uppercase font-bold hover:bg-zinc-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {errorMessage && (
                <div
                  data-testid="report-error-message"
                  className="p-3 bg-red-950/40 border border-red-500/30 text-red-200 text-xs font-mono"
                >
                  {errorMessage}
                </div>
              )}

              <div className="space-y-1.5">
                <label
                  htmlFor="report-reason"
                  className="font-mono text-xs uppercase tracking-wider text-zinc-300 block"
                >
                  Reason for Report *
                </label>
                <select
                  id="report-reason"
                  data-testid="report-reason-select"
                  value={reason}
                  onChange={(e) => setReason(e.target.value as ReportReason)}
                  required
                  className="w-full bg-zinc-900 border border-white/10 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-white/30"
                >
                  {REASONS.map((r) => (
                    <option key={r.value} value={r.value} className="bg-zinc-900 text-white">
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="report-description"
                    className="font-mono text-xs uppercase tracking-wider text-zinc-300 block"
                  >
                    Additional Details
                  </label>
                  <span className="font-mono text-[10px] text-zinc-500">
                    {description.length} / 1000
                  </span>
                </div>
                <textarea
                  id="report-description"
                  data-testid="report-description-textarea"
                  rows={4}
                  maxLength={1000}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide any relevant context or links that substantiate the violation..."
                  className="w-full bg-zinc-900 border border-white/10 p-3 text-xs text-white placeholder-zinc-500 font-sans focus:outline-none focus:border-white/30 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => handleOpenChange(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 font-mono text-xs uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  data-testid="submit-report-btn"
                  disabled={isSubmitting}
                  className="px-5 py-2 font-mono text-xs uppercase tracking-wider font-bold bg-white text-black hover:bg-zinc-200 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
