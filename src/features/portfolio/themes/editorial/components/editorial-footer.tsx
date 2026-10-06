import React from "react";
import Link from "next/link";
import type { PublicSocialLink } from "../../../types";

interface EditorialFooterProps {
  displayName: string;
  username: string;
  socialLinks: PublicSocialLink[];
  hideBranding?: boolean;
}

export function EditorialFooter({
  displayName,
  username,
  socialLinks,
  hideBranding = false,
}: EditorialFooterProps) {
  // Find whatsapp link if configured
  const whatsappLink = socialLinks.find(
    (l) => l.platform === "whatsapp" && l.url
  );

  // Strictly filter out email links for public privacy protection
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
      data-testid="editorial-footer"
      className="pt-20 sm:pt-32 pb-16"
    >
      {/* Typography-focused sign-off */}
      <div className="space-y-10">
        <div className="flex items-center gap-3">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#FF3B30]" />
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-400">
            [ INQUIRIES & COLLABORATION ]
          </span>
        </div>

        <h2 className="font-serif italic font-normal text-white leading-[0.95] tracking-[-0.02em] select-none text-[clamp(2.5rem,6.5vw,6rem)]">
          Open for editorial commissions, commercial narratives, & select direction.
        </h2>

        {/* WhatsApp Direct Action */}
        {whatsappLink && (
          <div className="pt-4">
            <a
              href={whatsappLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 font-mono text-xs font-semibold uppercase tracking-widest text-white bg-[#FF3B30] hover:bg-[#E03429] transition-all shadow-xl hover:scale-[1.02]"
            >
              <span>CONNECT VIA WHATSAPP</span>
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
              className="hover:text-[#FF3B30] transition-colors"
            >
              {getPlatformLabel(link.platform)} ↗
            </a>
          ))}
        </div>

        <div className="font-mono text-xs text-zinc-500">
          © {new Date().getFullYear()} {displayName}. ALL RIGHTS RESERVED.
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
