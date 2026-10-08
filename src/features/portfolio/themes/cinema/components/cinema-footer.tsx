import React from "react";
import Link from "next/link";
import type { PublicSocialLink } from "../../../types";

interface CinemaFooterProps {
  displayName: string;
  username: string;
  socialLinks: PublicSocialLink[];
  hideBranding?: boolean;
}

export function CinemaFooter({
  displayName,
  username,
  socialLinks,
  hideBranding = false,
}: CinemaFooterProps) {
  // Find whatsapp link if configured
  const whatsappLink = socialLinks.find(
    (l) => l.platform === "whatsapp" && l.url
  );

  // Filter out any email links to strictly preserve public privacy
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
    <footer id="contact" data-testid="cinema-footer" className="pt-20 sm:pt-32 pb-16">
      {/* Top Section / Display Headline */}
      <div className="space-y-12">
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-500 block">
          [ GET IN TOUCH // CONTACT ]
        </span>

        <h2 className="font-display font-extrabold uppercase text-white leading-[0.92] tracking-[-0.03em] select-none text-[clamp(2.5rem,7vw,6.5rem)]">
          LET&apos;S WORK TOGETHER ON YOUR NEXT PROJECT.
        </h2>

        {/* WhatsApp Direct Action (if creator configured WhatsApp) */}
        {whatsappLink && (
          <div className="pt-4">
            <a
              href={whatsappLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 font-mono text-xs font-semibold uppercase tracking-widest text-black bg-white hover:bg-zinc-200 transition-all shadow-xl hover:scale-[1.02]"
            >
              <span>CHAT ON WHATSAPP</span>
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
              className="hover:text-white transition-colors"
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
