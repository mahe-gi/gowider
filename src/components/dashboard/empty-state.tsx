import React from "react";
import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  actionText,
  actionHref,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div
      data-testid="empty-state"
      className="flex flex-col items-center justify-center rounded-xl border border-zinc-800/80 bg-zinc-900/40 px-6 py-14 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 mb-4">
        {icon || (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        )}
      </div>
      <h3 className="text-base font-medium text-white">{title}</h3>
      <p className="mt-1 text-sm text-zinc-400 max-w-sm">{description}</p>
      {actionText && (actionHref || onAction) && (
        <div className="mt-5">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              <span>+</span>
              <span>{actionText}</span>
            </Link>
          ) : (
            <button
              onClick={onAction}
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              <span>+</span>
              <span>{actionText}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
