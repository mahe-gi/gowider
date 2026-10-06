import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  THEME_REGISTRY,
  DEFAULT_THEME,
  getTheme,
  getThemeComponent,
  getProjectThemeComponent,
} from "@/features/portfolio/registry";
import { CinemaLayout } from "@/features/portfolio/themes/cinema/cinema-layout";
import { CinemaProjectPage } from "@/features/portfolio/themes/cinema/cinema-project-page";
import { EditorialLayout } from "@/features/portfolio/themes/editorial/editorial-layout";
import { EditorialProjectPage } from "@/features/portfolio/themes/editorial/editorial-project-page";
import { StudioLayout } from "@/features/portfolio/themes/studio/studio-layout";
import { StudioProjectPage } from "@/features/portfolio/themes/studio/studio-project-page";
import { NoirLayout } from "@/features/portfolio/themes/noir/noir-layout";
import { NoirProjectPage } from "@/features/portfolio/themes/noir/noir-project-page";
import { VogueLayout } from "@/features/portfolio/themes/vogue/vogue-layout";
import { VogueProjectPage } from "@/features/portfolio/themes/vogue/vogue-project-page";
import { AtelierLayout } from "@/features/portfolio/themes/atelier/atelier-layout";
import { AtelierProjectPage } from "@/features/portfolio/themes/atelier/atelier-project-page";
import { CyberLayout } from "@/features/portfolio/themes/cyber/cyber-layout";
import { CyberProjectPage } from "@/features/portfolio/themes/cyber/cyber-project-page";
import type {
  PublicPortfolioData,
  PublicProjectDetail,
} from "@/features/portfolio/types";

describe("Theme Registry & Resolution", () => {
  it("registers all core and pro themes: cinema, editorial, studio, noir, vogue, atelier, and cyber", () => {
    expect(THEME_REGISTRY).toHaveProperty("cinema");
    expect(THEME_REGISTRY).toHaveProperty("editorial");
    expect(THEME_REGISTRY).toHaveProperty("studio");
    expect(THEME_REGISTRY).toHaveProperty("noir");
    expect(THEME_REGISTRY).toHaveProperty("vogue");
    expect(THEME_REGISTRY).toHaveProperty("atelier");
    expect(THEME_REGISTRY).toHaveProperty("cyber");
    expect(THEME_REGISTRY.noir.isPro).toBe(true);
    expect(THEME_REGISTRY.vogue.isPro).toBe(true);
    expect(THEME_REGISTRY.atelier.isPro).toBe(true);
    expect(THEME_REGISTRY.cyber.isPro).toBe(true);
  });

  it("resolves 'cinema' theme accurately", () => {
    const theme = getTheme("cinema");
    expect(theme.id).toBe("cinema");
    expect(theme.name).toBe("Cinema");
    expect(theme.component).toBe(CinemaLayout);
    expect(theme.projectComponent).toBe(CinemaProjectPage);

    expect(getThemeComponent("cinema")).toBe(CinemaLayout);
    expect(getProjectThemeComponent("cinema")).toBe(CinemaProjectPage);
  });

  it("resolves 'editorial' theme accurately", () => {
    const theme = getTheme("editorial");
    expect(theme.id).toBe("editorial");
    expect(theme.name).toBe("Editorial");
    expect(theme.component).toBe(EditorialLayout);
    expect(theme.projectComponent).toBe(EditorialProjectPage);

    expect(getThemeComponent("editorial")).toBe(EditorialLayout);
    expect(getProjectThemeComponent("editorial")).toBe(EditorialProjectPage);
  });

  it("resolves 'studio' theme accurately", () => {
    const theme = getTheme("studio");
    expect(theme.id).toBe("studio");
    expect(theme.name).toBe("Studio");
    expect(theme.component).toBe(StudioLayout);
    expect(theme.projectComponent).toBe(StudioProjectPage);

    expect(getThemeComponent("studio")).toBe(StudioLayout);
    expect(getProjectThemeComponent("studio")).toBe(StudioProjectPage);
  });

  it("resolves 'noir' Pro theme accurately", () => {
    const theme = getTheme("noir");
    expect(theme.id).toBe("noir");
    expect(theme.name).toContain("Noir");
    expect(theme.isPro).toBe(true);
    expect(theme.component).toBe(NoirLayout);
    expect(theme.projectComponent).toBe(NoirProjectPage);

    expect(getThemeComponent("noir")).toBe(NoirLayout);
    expect(getProjectThemeComponent("noir")).toBe(NoirProjectPage);
  });

  it("resolves 'vogue' Pro theme accurately", () => {
    const theme = getTheme("vogue");
    expect(theme.id).toBe("vogue");
    expect(theme.name).toContain("Vogue");
    expect(theme.isPro).toBe(true);
    expect(theme.component).toBe(VogueLayout);
    expect(theme.projectComponent).toBe(VogueProjectPage);

    expect(getThemeComponent("vogue")).toBe(VogueLayout);
    expect(getProjectThemeComponent("vogue")).toBe(VogueProjectPage);
  });

  it("resolves 'atelier' Pro theme accurately", () => {
    const theme = getTheme("atelier");
    expect(theme.id).toBe("atelier");
    expect(theme.name).toContain("Atelier");
    expect(theme.isPro).toBe(true);
    expect(theme.component).toBe(AtelierLayout);
    expect(theme.projectComponent).toBe(AtelierProjectPage);

    expect(getThemeComponent("atelier")).toBe(AtelierLayout);
    expect(getProjectThemeComponent("atelier")).toBe(AtelierProjectPage);
  });

  it("resolves 'cyber' Pro theme accurately", () => {
    const theme = getTheme("cyber");
    expect(theme.id).toBe("cyber");
    expect(theme.name).toContain("Cyber");
    expect(theme.isPro).toBe(true);
    expect(theme.component).toBe(CyberLayout);
    expect(theme.projectComponent).toBe(CyberProjectPage);

    expect(getThemeComponent("cyber")).toBe(CyberLayout);
    expect(getProjectThemeComponent("cyber")).toBe(CyberProjectPage);
  });

  it("handles case-insensitivity and whitespace in theme keys", () => {
    expect(getTheme("EDITORIAL").id).toBe("editorial");
    expect(getTheme("  StUdiO  ").id).toBe("studio");
    expect(getTheme("CINEMA").id).toBe("cinema");
  });

  it("gracefully falls back to Cinema for unknown or uninstalled themes", () => {
    expect(getTheme("unknown_theme").id).toBe(DEFAULT_THEME);
    expect(getTheme("cyberpunk_99").id).toBe(DEFAULT_THEME);
    expect(getTheme("minimalist_v2").id).toBe(DEFAULT_THEME);

    expect(getThemeComponent("non_existent")).toBe(CinemaLayout);
    expect(getProjectThemeComponent("non_existent")).toBe(CinemaProjectPage);
  });

  it("gracefully falls back to Cinema for null, undefined, or empty values", () => {
    expect(getTheme(null).id).toBe(DEFAULT_THEME);
    expect(getTheme(undefined).id).toBe(DEFAULT_THEME);
    expect(getTheme("").id).toBe(DEFAULT_THEME);
    expect(getTheme("   ").id).toBe(DEFAULT_THEME);

    expect(getThemeComponent(null)).toBe(CinemaLayout);
    expect(getProjectThemeComponent(undefined)).toBe(CinemaProjectPage);
  });
});

describe("Multi-Theme Contract Parity", () => {
  const mockPublicPortfolio: PublicPortfolioData = {
    profile: {
      username: "elena_director",
      displayName: "Elena Vance",
      headline: "Commercial Director & Visual Stylist",
      bio: "Crafting distinct visual worlds for global brands and independent music artists.",
      avatarUrl: "https://example.com/avatar.jpg",
      location: "London, UK",
      availability: "Available for Commissions",
      isPublished: true,
    },
    projects: [
      {
        slug: "neon-drift",
        title: "Neon Drift",
        description: "An evocative night drive narrative.",
        sourceType: "youtube",
        sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        thumbnailUrl: "https://example.com/thumb1.jpg",
        category: "Commercial",
        client: "Aura Motor Corp",
        year: 2024,
        tools: ["DaVinci Resolve", "Arri Alexa Mini"],
        featured: true,
        sortOrder: 1,
      },
      {
        slug: "midnight-echo",
        title: "Midnight Echo",
        description: "Documentary short on electronic music producers.",
        sourceType: "google_drive",
        sourceUrl: "https://drive.google.com/file/d/1a2b3c4d5e6f7g8h9/view",
        thumbnailUrl: null,
        category: "Documentary",
        client: "Soundscape Records",
        year: 2023,
        tools: ["Premiere Pro"],
        featured: false,
        sortOrder: 2,
      },
      {
        slug: "social-promo",
        title: "Social Fashion Promo",
        description: "Fast-paced editorial cut for autumn collection.",
        sourceType: "instagram",
        sourceUrl: "https://www.instagram.com/reel/C3b4c5d6e7f/",
        thumbnailUrl: null,
        category: "Fashion",
        client: "Atelier V",
        year: 2025,
        tools: ["After Effects"],
        featured: false,
        sortOrder: 3,
      },
    ],
    socialLinks: [
      {
        platform: "instagram",
        url: "https://instagram.com/elenavance",
      },
      {
        platform: "whatsapp",
        url: "https://wa.me/447123456789",
      },
      {
        platform: "website",
        url: "https://elenavance.com",
      },
    ],
    services: [
      { name: "Directing" },
      { name: "Color Grading" },
      { name: "Creative Direction" },
    ],
    skills: [
      { name: "DaVinci Resolve Studio" },
      { name: "Adobe Premiere Pro" },
      { name: "Cinematography" },
    ],
    settings: {
      theme: "editorial",
      motionLevel: "full",
      accentColor: "#FF3B30",
    },
  };

  const mockProjectDetail: PublicProjectDetail = {
    project: mockPublicPortfolio.projects[0],
    profile: mockPublicPortfolio.profile,
    settings: mockPublicPortfolio.settings,
    navigation: {
      prev: null,
      next: {
        slug: "midnight-echo",
        title: "Midnight Echo",
      },
    },
  };

  it("renders CinemaLayout with standard PublicPortfolioData without error", () => {
    const html = renderToStaticMarkup(
      React.createElement(CinemaLayout, { portfolio: mockPublicPortfolio })
    );

    expect(html).toContain("Elena Vance");
    expect(html).toContain("Neon Drift");
    expect(html).toContain("data-testid=\"cinema-theme-layout\"");
    expect(html).toContain("data-testid=\"cinema-header\"");
  });

  it("renders EditorialLayout with standard PublicPortfolioData without error", () => {
    const html = renderToStaticMarkup(
      React.createElement(EditorialLayout, { portfolio: mockPublicPortfolio })
    );

    expect(html).toContain("Elena Vance");
    expect(html).toContain("Neon Drift");
    expect(html).toContain("data-testid=\"editorial-theme-layout\"");
    expect(html).toContain("data-testid=\"editorial-header\"");
    expect(html).toContain("data-testid=\"editorial-index\"");
    expect(html).toContain("data-testid=\"editorial-about\"");
    expect(html).toContain("data-testid=\"editorial-footer\"");
  });

  it("renders StudioLayout with standard PublicPortfolioData without error", () => {
    const html = renderToStaticMarkup(
      React.createElement(StudioLayout, { portfolio: mockPublicPortfolio })
    );

    expect(html).toContain("Elena Vance");
    expect(html).toContain("Neon Drift");
    expect(html).toContain("data-testid=\"studio-theme-layout\"");
    expect(html).toContain("data-testid=\"studio-header\"");
    expect(html).toContain("data-testid=\"studio-showcase\"");
    expect(html).toContain("data-testid=\"studio-about\"");
    expect(html).toContain("data-testid=\"studio-footer\"");
  });

  it("renders CinemaProjectPage with standard PublicProjectDetail without error", () => {
    const html = renderToStaticMarkup(
      React.createElement(CinemaProjectPage, mockProjectDetail)
    );

    expect(html).toContain("Neon Drift");
    expect(html).toContain("Elena Vance");
    expect(html).toContain("Aura Motor Corp");
    expect(html).toContain("data-testid=\"cinema-project-page\"");
    expect(html).toContain("data-testid=\"project-navigation-bridge\"");
  });

  it("renders EditorialProjectPage with standard PublicProjectDetail without error", () => {
    const html = renderToStaticMarkup(
      React.createElement(EditorialProjectPage, mockProjectDetail)
    );

    expect(html).toContain("Neon Drift");
    expect(html).toContain("Elena Vance");
    expect(html).toContain("Aura Motor Corp");
    expect(html).toContain("data-testid=\"editorial-project-page\"");
    expect(html).toContain("data-testid=\"project-navigation-bridge\"");
  });

  it("renders StudioProjectPage with standard PublicProjectDetail without error", () => {
    const html = renderToStaticMarkup(
      React.createElement(StudioProjectPage, mockProjectDetail)
    );

    expect(html).toContain("Neon Drift");
    expect(html).toContain("Elena Vance");
    expect(html).toContain("Aura Motor Corp");
    expect(html).toContain("data-testid=\"studio-project-page\"");
    expect(html).toContain("data-testid=\"project-navigation-bridge\"");
  });

  it("renders NoirLayout with standard PublicPortfolioData without error", () => {
    const html = renderToStaticMarkup(
      React.createElement(NoirLayout, { portfolio: mockPublicPortfolio })
    );

    expect(html).toContain("Elena Vance");
    expect(html).toContain("Neon Drift");
    expect(html).toContain("data-testid=\"noir-theme-layout\"");
    expect(html).toContain("[2.39:1 NOIR]");
  });

  it("renders NoirProjectPage with standard PublicProjectDetail without error", () => {
    const html = renderToStaticMarkup(
      React.createElement(NoirProjectPage, mockProjectDetail)
    );

    expect(html).toContain("Neon Drift");
    expect(html).toContain("Elena Vance");
    expect(html).toContain("Aura Motor Corp");
    expect(html).toContain("data-testid=\"noir-project-page\"");
    expect(html).toContain("data-testid=\"project-navigation-bridge\"");
  });

  it("renders VogueLayout with standard PublicPortfolioData without error", () => {
    const html = renderToStaticMarkup(
      React.createElement(VogueLayout, { portfolio: mockPublicPortfolio })
    );

    expect(html).toContain("Elena Vance");
    expect(html).toContain("Neon Drift");
    expect(html).toContain("data-testid=\"vogue-theme-layout\"");
  });

  it("renders VogueProjectPage with standard PublicProjectDetail without error", () => {
    const html = renderToStaticMarkup(
      React.createElement(VogueProjectPage, mockProjectDetail)
    );

    expect(html).toContain("Neon Drift");
    expect(html).toContain("Elena Vance");
    expect(html).toContain("Aura Motor Corp");
    expect(html).toContain("data-testid=\"vogue-project-page\"");
    expect(html).toContain("data-testid=\"project-navigation-bridge\"");
  });

  it("renders AtelierLayout with standard PublicPortfolioData without error", () => {
    const html = renderToStaticMarkup(
      React.createElement(AtelierLayout, { portfolio: mockPublicPortfolio })
    );

    expect(html).toContain("Elena Vance");
    expect(html).toContain("Neon Drift");
    expect(html).toContain("data-testid=\"atelier-theme-layout\"");
    expect(html).toContain("data-testid=\"atelier-header\"");
    expect(html).toContain("data-testid=\"atelier-hero\"");
    expect(html).toContain("data-testid=\"atelier-showcase\"");
    expect(html).toContain("data-testid=\"atelier-about\"");
    expect(html).toContain("data-testid=\"atelier-footer\"");
  });

  it("renders AtelierProjectPage with standard PublicProjectDetail without error", () => {
    const html = renderToStaticMarkup(
      React.createElement(AtelierProjectPage, mockProjectDetail)
    );

    expect(html).toContain("Neon Drift");
    expect(html).toContain("Elena Vance");
    expect(html).toContain("Aura Motor Corp");
    expect(html).toContain("data-testid=\"atelier-project-page\"");
    expect(html).toContain("data-testid=\"project-navigation-bridge\"");
  });

  it("renders CyberLayout with standard PublicPortfolioData without error", () => {
    const html = renderToStaticMarkup(
      React.createElement(CyberLayout, { portfolio: mockPublicPortfolio })
    );

    expect(html).toContain("Elena Vance");
    expect(html).toContain("Neon Drift");
    expect(html).toContain("data-testid=\"cyber-theme-layout\"");
    expect(html).toContain("data-testid=\"cyber-header\"");
    expect(html).toContain("data-testid=\"cyber-hero\"");
    expect(html).toContain("data-testid=\"cyber-showcase\"");
    expect(html).toContain("data-testid=\"cyber-about\"");
    expect(html).toContain("data-testid=\"cyber-footer\"");
  });

  it("renders CyberProjectPage with standard PublicProjectDetail without error", () => {
    const html = renderToStaticMarkup(
      React.createElement(CyberProjectPage, mockProjectDetail)
    );

    expect(html).toContain("Neon Drift");
    expect(html).toContain("Elena Vance");
    expect(html).toContain("Aura Motor Corp");
    expect(html).toContain("data-testid=\"cyber-project-page\"");
    expect(html).toContain("data-testid=\"project-navigation-bridge\"");
  });

  it("renders spotlight showreel and booking CTA button when configured", () => {
    const portfolioWithProSuite: PublicPortfolioData = {
      ...mockPublicPortfolio,
      settings: {
        ...mockPublicPortfolio.settings,
        theme: "atelier",
        spotlightProject: mockPublicPortfolio.projects[0],
        cta: {
          enabled: true,
          label: "Inquire for Commercial Commissions",
          url: "https://calendly.com/elenavance/commercial",
        },
      },
    };

    const atelierHtml = renderToStaticMarkup(
      React.createElement(AtelierLayout, { portfolio: portfolioWithProSuite })
    );
    expect(atelierHtml).toContain("SIGNATURE SHOWREEL SPOTLIGHT");
    expect(atelierHtml).toContain("Inquire for Commercial Commissions");
    expect(atelierHtml).toContain("https://calendly.com/elenavance/commercial");

    const cyberHtml = renderToStaticMarkup(
      React.createElement(CyberLayout, { portfolio: { ...portfolioWithProSuite, settings: { ...portfolioWithProSuite.settings, theme: "cyber" } } })
    );
    expect(cyberHtml).toContain("SIGNATURE SHOWREEL // ACTIVE GPU PIPELINE");
    expect(cyberHtml).toContain("Inquire for Commercial Commissions");
    expect(cyberHtml).toContain("https://calendly.com/elenavance/commercial");
  });

  it("handles zero projects gracefully across all layouts", () => {
    const emptyPortfolio: PublicPortfolioData = {
      ...mockPublicPortfolio,
      projects: [],
    };

    const cinemaHtml = renderToStaticMarkup(
      React.createElement(CinemaLayout, { portfolio: emptyPortfolio })
    );
    expect(cinemaHtml).toContain("No published projects available yet");

    const editorialHtml = renderToStaticMarkup(
      React.createElement(EditorialLayout, { portfolio: emptyPortfolio })
    );
    expect(editorialHtml).toContain("No published projects in the editorial index yet");

    const studioHtml = renderToStaticMarkup(
      React.createElement(StudioLayout, { portfolio: emptyPortfolio })
    );
    expect(studioHtml).toContain("No projects available in the studio showcase");

    const noirHtml = renderToStaticMarkup(
      React.createElement(NoirLayout, { portfolio: emptyPortfolio })
    );
    expect(noirHtml).toContain("[ ARCHIVE EMPTY // NO PUBLISHED WORKS RECORDED ]");

    const vogueHtml = renderToStaticMarkup(
      React.createElement(VogueLayout, { portfolio: emptyPortfolio })
    );
    expect(vogueHtml).toContain("No works documented in this issue.");

    const atelierHtml = renderToStaticMarkup(
      React.createElement(AtelierLayout, { portfolio: emptyPortfolio })
    );
    expect(atelierHtml).toContain("No works documented in this exhibition.");

    const cyberHtml = renderToStaticMarkup(
      React.createElement(CyberLayout, { portfolio: emptyPortfolio })
    );
    expect(cyberHtml).toContain("[ NO ACTIVE GPU NODES DETECTED IN PIPELINE ]");
  });

  it("verifies public data purity across theme footers (no email exposed)", () => {
    const portfolioWithEmailSocial: PublicPortfolioData = {
      ...mockPublicPortfolio,
      socialLinks: [
        ...mockPublicPortfolio.socialLinks,
        {
          platform: "website",
          url: "mailto:secret_owner@company.com",
        },
      ],
    };

    const editorialHtml = renderToStaticMarkup(
      React.createElement(EditorialLayout, { portfolio: portfolioWithEmailSocial })
    );
    expect(editorialHtml).not.toContain("secret_owner@company.com");
    expect(editorialHtml).not.toContain("mailto:");

    const studioHtml = renderToStaticMarkup(
      React.createElement(StudioLayout, { portfolio: portfolioWithEmailSocial })
    );
    expect(studioHtml).not.toContain("secret_owner@company.com");
    expect(studioHtml).not.toContain("mailto:");

    const noirHtml = renderToStaticMarkup(
      React.createElement(NoirLayout, { portfolio: portfolioWithEmailSocial })
    );
    expect(noirHtml).not.toContain("secret_owner@company.com");
    expect(noirHtml).not.toContain("mailto:");

    const vogueHtml = renderToStaticMarkup(
      React.createElement(VogueLayout, { portfolio: portfolioWithEmailSocial })
    );
    expect(vogueHtml).not.toContain("secret_owner@company.com");
    expect(vogueHtml).not.toContain("mailto:");

    const atelierHtml = renderToStaticMarkup(
      React.createElement(AtelierLayout, { portfolio: portfolioWithEmailSocial })
    );
    expect(atelierHtml).not.toContain("secret_owner@company.com");
    expect(atelierHtml).not.toContain("mailto:");

    const cyberHtml = renderToStaticMarkup(
      React.createElement(CyberLayout, { portfolio: portfolioWithEmailSocial })
    );
    expect(cyberHtml).not.toContain("secret_owner@company.com");
    expect(cyberHtml).not.toContain("mailto:");
  });
});
