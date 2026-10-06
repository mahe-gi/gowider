import React from "react";
import Link from "next/link";
import type { PublicSocialLink } from "../../../types";

interface NoirFooterProps {
  displayName: string;
  username: string;
  socialLinks: PublicSocialLink[];
  hideBranding?: boolean;
}

export function NoirFooter({
  displayName,
  username,
  socialLinks,
  hideBranding = false,
}: NoirFooterProps) {
  // Find whatsapp link if configured
  const whatsappLink = socialLinks.find(
    (l) => l.platform === "whatsapp" && l.url
  );

  // Strictly filter out email links for privacy preservation
  const visibleSocialLinks = socialLinks.filter(
    (link) =>
      link.platform !== "whatsapp" &&
      (link.platform as string) !== "email" &&
      !link.url.toLowerCase().startsWith("mailto:")
  );

  const getPlatformLabel = (platform: string) => {
    switch (platform) {
      case "instagram":
        return "INSTAGRAM";
      case "youtube":
        return "YOUTUBE";
      case "linkedin":
        return "LINKEDIN";
      case "x":
        return "X / TWITTER";
      case "website":
        return "WEBSITE";
      default:
        return platform.toUpperCase();
    }
  };

  return (
    <footer
      id="contact"
      data-testid="noir-footer"
      className="pt-24 sm:pt-36 pb-16"
    >
      {/* End Slate Header */}
      <div className="space-y-10">
        <div className="flex items-center gap-3">
          <span className="inline-block h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-amber-500/80">
            [ END SLATE // DIRECTORIAL CONTACT ]
          </span>
        </div>

        <h2 className="font-display font-extrabold uppercase text-white leading-[0.88] tracking-[-0.04em] select-none text-[clamp(2.5rem,7vw,6.5rem)] text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-amber-200/80">
          LET&apos;S CRAFT THE NEXT MASTERPIECE.
        </h2>

        {/* WhatsApp Direct Action Button */}
        {whatsappLink && (
          <div className="pt-4">
            <a
              href={whatsappLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 font-mono text-xs font-bold uppercase tracking-widest text-black bg-amber-400 hover:bg-amber-300 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-[1.02]"
            >
              <span>INITIATE PRODUCTION INQUIRY</span>
              <span>↗</span>
            </a>
          </div>
        )}
      </div>

      {/* Mid Section: Social Links */}
      <div className="mt-20 pt-10 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-wrap gap-6 sm:gap-10 font-mono text-xs uppercase tracking-widest text-zinc-400">
          {visibleSocialLinks.map((link) => (
            <a
              key={link.platform + link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-300 transition-colors"
            >
              {getPlatformLabel(link.platform)} ↗
            </a>
          ))}
        </div>

        <div className="font-mono text-xs text-zinc-500">
          © {new Date().getFullYear()} {displayName}. 2.39:1 SCOPE ARCHIVE.
        </div>
      </div>

      {/* Bottom Sub-bar: Platform Watermark & Report Trigger */}
      <div className="mt-12 pt-6 border-t border-white/[0.04] flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] tracking-wider text-zinc-600">
        {!hideBranding ? (
          <Link
            href="/"
            className="hover:text-zinc-400 transition-colors inline-flex items-center gap-1.5"
          >
            <span>POWERED BY GOWIDER</span>
            <span className="text-amber-400/60 font-semibold">[PRO]</span>
          </Link>
        ) : (
          <span />
        )}

        <a
          data-testid="report-portfolio-btn"
          href={`/report?username=${username}`}
          className="hover:text-zinc-400 transition-colors underline decoration-dotted"
        >
          Report this portfolio
        </a>
      </div>
    </footer>
  );
}
