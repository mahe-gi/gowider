// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import React from "react";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  parseMediaUrl,
  tryParseMediaUrl,
  isValidMediaUrl,
  ALLOWED_MEDIA_HOSTS,
  YouTubePlayer,
  InstagramCard,
  DrivePlayer,
  TypographicPoster,
} from "@/features/media";
import { AppError } from "@/lib/errors";

describe("Media Engine & Provider Resolvers (TASK-05)", () => {
  describe("ALLOWED_MEDIA_HOSTS Allowlist", () => {
    it("exports comprehensive media host allowlist", () => {
      expect(ALLOWED_MEDIA_HOSTS).toContain("youtube.com");
      expect(ALLOWED_MEDIA_HOSTS).toContain("www.youtube.com");
      expect(ALLOWED_MEDIA_HOSTS).toContain("m.youtube.com");
      expect(ALLOWED_MEDIA_HOSTS).toContain("youtu.be");
      expect(ALLOWED_MEDIA_HOSTS).toContain("youtube-nocookie.com");
      expect(ALLOWED_MEDIA_HOSTS).toContain("instagram.com");
      expect(ALLOWED_MEDIA_HOSTS).toContain("www.instagram.com");
      expect(ALLOWED_MEDIA_HOSTS).toContain("instagr.am");
      expect(ALLOWED_MEDIA_HOSTS).toContain("drive.google.com");
      expect(ALLOWED_MEDIA_HOSTS).toContain("docs.google.com");
    });
  });

  describe("YouTube Provider", () => {
    const validId = "dQw4w9WgXcQ";

    it("parses standard youtube.com watch URLs", () => {
      const parsed = parseMediaUrl(`https://www.youtube.com/watch?v=${validId}`);
      expect(parsed.sourceType).toBe("youtube");
      expect(parsed.id).toBe(validId);
      expect(parsed.subtype).toBe("standard");
      expect(parsed.canonicalUrl).toBe(`https://www.youtube.com/watch?v=${validId}`);
      expect(parsed.embedUrl).toBe(`https://www.youtube-nocookie.com/embed/${validId}`);
      expect(parsed.thumbnailUrl).toBe(`https://img.youtube.com/vi/${validId}/maxresdefault.jpg`);
    });

    it("parses watch URLs with extra query parameters", () => {
      const parsed = parseMediaUrl(
        `https://youtube.com/watch?v=${validId}&t=2m10s&feature=share`
      );
      expect(parsed.id).toBe(validId);
      expect(parsed.canonicalUrl).toBe(`https://www.youtube.com/watch?v=${validId}`);
    });

    it("parses shortened youtu.be URLs", () => {
      const parsed = parseMediaUrl(`https://youtu.be/${validId}?si=xyz123`);
      expect(parsed.sourceType).toBe("youtube");
      expect(parsed.id).toBe(validId);
      expect(parsed.canonicalUrl).toBe(`https://www.youtube.com/watch?v=${validId}`);
      expect(parsed.embedUrl).toBe(`https://www.youtube-nocookie.com/embed/${validId}`);
    });

    it("parses YouTube Shorts URLs and marks subtype as shorts", () => {
      const parsed = parseMediaUrl(`https://www.youtube.com/shorts/${validId}`);
      expect(parsed.sourceType).toBe("youtube");
      expect(parsed.id).toBe(validId);
      expect(parsed.subtype).toBe("shorts");
      expect(parsed.canonicalUrl).toBe(`https://www.youtube.com/watch?v=${validId}`);
    });

    it("parses embed and privacy embed URLs", () => {
      const parsed1 = parseMediaUrl(`https://www.youtube.com/embed/${validId}`);
      expect(parsed1.id).toBe(validId);

      const parsed2 = parseMediaUrl(`https://www.youtube-nocookie.com/embed/${validId}`);
      expect(parsed2.id).toBe(validId);
    });

    it("parses mobile m.youtube.com URLs", () => {
      const parsed = parseMediaUrl(`https://m.youtube.com/watch?v=${validId}`);
      expect(parsed.id).toBe(validId);
    });

    it("throws AppError.validation when YouTube URL is missing video ID", () => {
      expect(() => parseMediaUrl("https://www.youtube.com/watch")).toThrow(AppError);
      expect(() => parseMediaUrl("https://youtu.be/")).toThrow(AppError);
    });
  });

  describe("Instagram Provider", () => {
    const reelCode = "DAxyz987_";
    const postCode = "B123abc45";
    const tvCode = "C999zzz11";

    it("parses /reel/ preserving subtype reel without converting", () => {
      const parsed = parseMediaUrl(`https://www.instagram.com/reel/${reelCode}/?igsh=abc`);
      expect(parsed.sourceType).toBe("instagram");
      expect(parsed.id).toBe(reelCode);
      expect(parsed.subtype).toBe("reel");
      expect(parsed.canonicalUrl).toBe(`https://www.instagram.com/reel/${reelCode}/`);
      expect(parsed.embedUrl).toBeNull();
      expect(parsed.thumbnailUrl).toBeNull();
    });

    it("parses plural /reels/ path mapping to reel subtype with query parameters", () => {
      const parsed = parseMediaUrl(
        `https://www.instagram.com/reels/${reelCode}/?igsh=MXR1MjZwaTFp&utm_source=qr`
      );
      expect(parsed.sourceType).toBe("instagram");
      expect(parsed.id).toBe(reelCode);
      expect(parsed.subtype).toBe("reel");
      expect(parsed.canonicalUrl).toBe(`https://www.instagram.com/reel/${reelCode}/`);
    });

    it("parses /p/ preserving subtype p without converting", () => {
      const parsed = parseMediaUrl(`https://www.instagram.com/p/${postCode}/`);
      expect(parsed.sourceType).toBe("instagram");
      expect(parsed.id).toBe(postCode);
      expect(parsed.subtype).toBe("p");
      expect(parsed.canonicalUrl).toBe(`https://www.instagram.com/p/${postCode}/`);
    });

    it("parses /tv/ preserving subtype tv without converting", () => {
      const parsed = parseMediaUrl(`https://www.instagram.com/tv/${tvCode}/`);
      expect(parsed.sourceType).toBe("instagram");
      expect(parsed.id).toBe(tvCode);
      expect(parsed.subtype).toBe("tv");
      expect(parsed.canonicalUrl).toBe(`https://www.instagram.com/tv/${tvCode}/`);
    });

    it("parses instagr.am short domain", () => {
      const parsed = parseMediaUrl(`https://instagr.am/p/${postCode}`);
      expect(parsed.id).toBe(postCode);
      expect(parsed.subtype).toBe("p");
    });

    it("throws AppError.validation on non-post Instagram paths (stories, explore)", () => {
      expect(() => parseMediaUrl("https://www.instagram.com/stories/username/12345/")).toThrow(
        AppError
      );
      expect(() => parseMediaUrl("https://www.instagram.com/explore/")).toThrow(AppError);
    });
  });

  describe("Google Drive Provider", () => {
    const fileId = "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OlvE";

    it("parses shareable /file/d/{id}/view URLs", () => {
      const parsed = parseMediaUrl(
        `https://drive.google.com/file/d/${fileId}/view?usp=sharing`
      );
      expect(parsed.sourceType).toBe("google_drive");
      expect(parsed.id).toBe(fileId);
      expect(parsed.canonicalUrl).toBe(`https://drive.google.com/file/d/${fileId}/view`);
      expect(parsed.embedUrl).toBe(`https://drive.google.com/file/d/${fileId}/preview`);
      expect(parsed.thumbnailUrl).toBe(
        `https://drive.google.com/thumbnail?id=${fileId}&sz=w1280`
      );
    });

    it("parses /file/d/{id}/edit URLs", () => {
      const parsed = parseMediaUrl(`https://drive.google.com/file/d/${fileId}/edit`);
      expect(parsed.id).toBe(fileId);
      expect(parsed.canonicalUrl).toBe(`https://drive.google.com/file/d/${fileId}/view`);
      expect(parsed.embedUrl).toBe(`https://drive.google.com/file/d/${fileId}/preview`);
    });

    it("parses /open?id={id} query parameter URLs", () => {
      const parsed = parseMediaUrl(`https://drive.google.com/open?id=${fileId}`);
      expect(parsed.id).toBe(fileId);
      expect(parsed.embedUrl).toBe(`https://drive.google.com/file/d/${fileId}/preview`);
    });

    it("parses docs.google.com file URLs", () => {
      const parsed = parseMediaUrl(`https://docs.google.com/file/d/${fileId}/preview`);
      expect(parsed.id).toBe(fileId);
      expect(parsed.sourceType).toBe("google_drive");
    });

    it("throws AppError.validation when file ID cannot be extracted", () => {
      expect(() => parseMediaUrl("https://drive.google.com/drive/my-drive")).toThrow(AppError);
    });
  });

  describe("Security & Protocol/Port Rejection", () => {
    it("rejects javascript: protocol", () => {
      expect(() => parseMediaUrl("javascript:alert(1)")).toThrow(/Invalid media URL protocol/);
    });

    it("rejects data: protocol", () => {
      expect(() => parseMediaUrl("data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==")).toThrow(
        /Invalid media URL protocol/
      );
    });

    it("rejects file: protocol", () => {
      expect(() => parseMediaUrl("file:///etc/passwd")).toThrow(/Invalid media URL protocol/);
    });

    it("rejects arbitrary ports on media URLs", () => {
      expect(() =>
        parseMediaUrl("https://www.youtube.com:8080/watch?v=dQw4w9WgXcQ")
      ).toThrow(/Arbitrary ports are not allowed: 8080/);

      expect(() =>
        parseMediaUrl("https://drive.google.com:3000/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OlvE/view")
      ).toThrow(/Arbitrary ports are not allowed: 3000/);
    });

    it("permits standard default ports (80 for http, 443 for https)", () => {
      expect(() =>
        parseMediaUrl("https://www.youtube.com:443/watch?v=dQw4w9WgXcQ")
      ).not.toThrow();
    });

    it("rejects disallowed hosts outside ALLOWED_MEDIA_HOSTS (including V2 providers like Vimeo)", () => {
      expect(() => parseMediaUrl("https://vimeo.com/123456789")).toThrow(
        /Disallowed or unsupported media host/
      );
      expect(() => parseMediaUrl("https://attacker.evil.com/video")).toThrow(
        /Disallowed or unsupported media host/
      );
    });

    it("rejects empty or malformed strings", () => {
      expect(() => parseMediaUrl("")).toThrow(/Media URL cannot be empty/);
      expect(() => parseMediaUrl("not-a-valid-url")).toThrow(/Invalid URL format/);
    });

    it("tryParseMediaUrl returns null on failure and ParsedMedia on success", () => {
      expect(tryParseMediaUrl("javascript:void(0)")).toBeNull();
      expect(tryParseMediaUrl("https://vimeo.com/999")).toBeNull();
      const valid = tryParseMediaUrl("https://youtu.be/dQw4w9WgXcQ");
      expect(valid).not.toBeNull();
      expect(valid?.id).toBe("dQw4w9WgXcQ");
    });

    it("isValidMediaUrl returns boolean status correctly", () => {
      expect(isValidMediaUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(true);
      expect(isValidMediaUrl("https://evil.com/malware")).toBe(false);
    });
  });
});

describe("Poster-First Media UI Components (TASK-06)", () => {
  describe("TypographicPoster", () => {
    it("renders charcoal container with index, title, category, client, and year", () => {
      render(
        React.createElement(TypographicPoster, {
          index: 1,
          title: "Cinematic Brand Manifesto",
          category: "Commercial",
          client: "Nike Vision",
          year: 2024,
        })
      );

      expect(screen.getByTestId("typographic-poster")).toBeInTheDocument();
      expect(screen.getByTestId("poster-index")).toHaveTextContent("01");
      expect(screen.getByTestId("poster-title")).toHaveTextContent("Cinematic Brand Manifesto");
      expect(screen.getByTestId("poster-category")).toHaveTextContent("COMMERCIAL");
      expect(screen.getByTestId("poster-client")).toHaveTextContent("Nike Vision");
      expect(screen.getByTestId("poster-year")).toHaveTextContent("2024");
    });

    it("applies 16:9 aspect class by default", () => {
      render(React.createElement(TypographicPoster, { title: "Test Film" }));
      expect(screen.getByTestId("typographic-poster")).toHaveClass("aspect-video");
    });
  });

  describe("YouTubePlayer (Poster-First)", () => {
    it("renders poster image first with ZERO iframes initially", () => {
      render(
        React.createElement(YouTubePlayer, {
          videoId: "dQw4w9WgXcQ",
          title: "Rick Astley - Never Gonna Give You Up",
        })
      );

      // Verify ZERO iframes on initial load
      expect(screen.queryByTestId("youtube-iframe")).not.toBeInTheDocument();

      // Verify poster image is present
      const img = screen.getByTestId("youtube-poster-img");
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute(
        "src",
        "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
      );

      // Verify play button exists
      expect(screen.getByTestId("youtube-play-btn")).toBeInTheDocument();
    });

    it("mounts privacy embed iframe with autoplay=1 upon user click", () => {
      render(
        React.createElement(YouTubePlayer, {
          videoId: "dQw4w9WgXcQ",
          title: "Rick Astley - Never Gonna Give You Up",
        })
      );

      // Click the poster button to trigger play
      const trigger = screen.getByRole("button", {
        name: /Play video: Rick Astley - Never Gonna Give You Up/i,
      });
      fireEvent.click(trigger);

      // Now iframe is mounted
      const iframe = screen.getByTestId("youtube-iframe");
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute(
        "src",
        "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0"
      );
      expect(iframe).toHaveAttribute("allowFullScreen");
    });

    it("falls back to TypographicPoster when thumbnail fails to load", () => {
      render(
        React.createElement(YouTubePlayer, {
          videoId: "dQw4w9WgXcQ",
          title: "Fallback Video Title",
          fallbackIndex: 3,
          category: "Editorial",
        })
      );

      const img = screen.getByTestId("youtube-poster-img");
      // Trigger error on maxres
      fireEvent.error(img);
      // Trigger error on hqdefault
      fireEvent.error(img);

      // Typographic fallback poster is rendered
      expect(screen.getByTestId("typographic-poster")).toBeInTheDocument();
      expect(screen.getByTestId("poster-title")).toHaveTextContent("Fallback Video Title");
      expect(screen.getByTestId("poster-index")).toHaveTextContent("03");
    });
  });

  describe("InstagramCard", () => {
    it("renders 9:16 vertical card with typographic badge and direct WATCH REEL link", () => {
      render(
        React.createElement(InstagramCard, {
          canonicalUrl: "https://www.instagram.com/reel/DAxyz987_/",
          subtype: "reel",
          title: "High Fashion Editorial Reel",
          index: 4,
          category: "Fashion",
          client: "Vogue",
          year: 2025,
        })
      );

      expect(screen.getByTestId("instagram-card")).toBeInTheDocument();
      expect(screen.getByTestId("instagram-card")).toHaveClass("aspect-[9/16]");
      expect(screen.getByTestId("instagram-badge")).toHaveTextContent("REEL");
      expect(screen.getByTestId("instagram-index")).toHaveTextContent("04");
      expect(screen.getByTestId("instagram-title")).toHaveTextContent("High Fashion Editorial Reel");

      const link = screen.getByTestId("instagram-cta-btn");
      expect(link).toHaveTextContent("WATCH REEL ↗");
      expect(link).toHaveAttribute("href", "https://www.instagram.com/reel/DAxyz987_/");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  describe("DrivePlayer (Poster-First & Action Bar)", () => {
    it("renders permanent direct action bar [ OPEN IN GOOGLE DRIVE ↗ ] and zero iframes initially", () => {
      render(
        React.createElement(DrivePlayer, {
          fileId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OlvE",
          title: "Raw Director Cut Footage",
          autoLoadOnIntersect: false,
        })
      );

      // Zero iframes initially
      expect(screen.queryByTestId("drive-iframe")).not.toBeInTheDocument();

      // Permanent action bar exists
      const actionBar = screen.getByTestId("drive-action-bar");
      expect(actionBar).toBeInTheDocument();

      const actionLink = screen.getByTestId("drive-action-link");
      expect(actionLink).toHaveTextContent("OPEN IN GOOGLE DRIVE ↗");
      expect(actionLink).toHaveAttribute(
        "href",
        "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OlvE/view"
      );
      expect(actionLink).toHaveAttribute("target", "_blank");
    });

    it("mounts preview iframe when clicked", () => {
      render(
        React.createElement(DrivePlayer, {
          fileId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OlvE",
          title: "Raw Director Cut Footage",
          autoLoadOnIntersect: false,
        })
      );

      const playTrigger = screen.getByRole("button", {
        name: /Preview media: Raw Director Cut Footage/i,
      });
      fireEvent.click(playTrigger);

      // Now iframe is mounted with preview URL
      const iframe = screen.getByTestId("drive-iframe");
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute(
        "src",
        "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OlvE/preview"
      );

      // Permanent action bar is STILL rendered
      expect(screen.getByTestId("drive-action-bar")).toBeInTheDocument();
    });
  });
});

