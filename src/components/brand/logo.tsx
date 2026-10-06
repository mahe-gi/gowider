import React from "react";
import Link from "next/link";
import clsx from "clsx";

export interface LogoMarkProps {
  className?: string;
  size?: "sm" | "md" | "lg" | number;
  withBadge?: boolean;
}

/**
 * Pure geometric logo mark for GoWider:
 * Represents the anamorphic widescreen expansion [ ▬ ]
 * Inspired by camera viewfinders and aspect ratio crop framing.
 * Zero letters, 100% minimalist geometry.
 */
export function LogoMark({
  className,
  size = "md",
  withBadge = false,
}: LogoMarkProps) {
  const pixelSize =
    typeof size === "number"
      ? size
      : size === "sm"
      ? 20
      : size === "lg"
      ? 36
      : 28;

  if (withBadge) {
    return (
      <div
        className={clsx(
          "relative flex items-center justify-center rounded-lg bg-black border border-white/15 shadow-sm overflow-hidden text-white transition-all",
          className
        )}
        style={{ width: pixelSize, height: pixelSize }}
      >
        <svg
          viewBox="0 0 32 32"
          width="70%"
          height="70%"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Left Anamorphic Widescreen Bracket */}
          <path
            d="M10.5 9.5H7.5C6.94772 9.5 6.5 9.94772 6.5 10.5V21.5C6.5 22.0523 6.94772 22.5 7.5 22.5H10.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Right Anamorphic Widescreen Bracket */}
          <path
            d="M21.5 9.5H24.5C25.0523 9.5 25.5 9.94772 25.5 10.5V21.5C25.5 22.0523 25.0523 22.5 24.5 22.5H21.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Central Cinematic Anamorphic Core (2.4:1 ratio) */}
          <rect
            x="10"
            y="13.5"
            width="12"
            height="5"
            rx="1.2"
            fill="currentColor"
          />
        </svg>
      </div>
    );
  }

  return (
    <svg
      viewBox="0 0 32 32"
      width={pixelSize}
      height={pixelSize}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={clsx("shrink-0 text-white transition-all", className)}
      aria-hidden="true"
    >
      {/* Left Anamorphic Widescreen Bracket */}
      <path
        d="M10.5 9.5H7.5C6.94772 9.5 6.5 9.94772 6.5 10.5V21.5C6.5 22.0523 6.94772 22.5 7.5 22.5H10.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right Anamorphic Widescreen Bracket */}
      <path
        d="M21.5 9.5H24.5C25.0523 9.5 25.5 9.94772 25.5 10.5V21.5C25.5 22.0523 25.0523 22.5 24.5 22.5H21.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Central Cinematic Anamorphic Core (2.4:1 ratio) */}
      <rect
        x="10"
        y="13.5"
        width="12"
        height="5"
        rx="1.2"
        fill="currentColor"
      />
    </svg>
  );
}

export interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  withBadge?: boolean;
  href?: string;
  showWordmark?: boolean;
}

/**
 * GoWider Logo Component:
 * Pairs the pure geometric mark with clean broadcast typography.
 */
export function Logo({
  className,
  size = "md",
  withBadge = false,
  href,
  showWordmark = true,
}: LogoProps) {
  const content = (
    <div className={clsx("inline-flex items-center gap-2.5 group", className)}>
      <LogoMark
        size={size}
        withBadge={withBadge}
        className="group-hover:scale-105 transition-transform"
      />
      {showWordmark && (
        <span
          className={clsx(
            "font-display font-black tracking-[0.2em] text-white uppercase group-hover:text-zinc-300 transition-colors",
            size === "sm" && "text-sm",
            size === "md" && "text-lg",
            size === "lg" && "text-xl sm:text-2xl"
          )}
        >
          GOWIDER
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="focus-visible:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
