import { describe, it, expect } from "vitest";
import {
  toPublicPortfolioData,
  toPortfolioData,
  computeProjectNavigation,
} from "@/features/portfolio/mappers";
import {
  getTheme,
  getThemeComponent,
  getProjectThemeComponent,
  DEFAULT_THEME,
} from "@/features/portfolio/registry";
import { CinemaLayout } from "@/features/portfolio/themes/cinema/cinema-layout";
import { CinemaProjectPage } from "@/features/portfolio/themes/cinema/cinema-project-page";

describe("Public Portfolio Projection & Mappers", () => {
  const mockDbProfile = {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    userId: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    username: "cinematic_alex",
    displayName: "Alex Rivera",
    headline: "Commercial & Narrative Colorist",
    bio: "Crafting atmospheric grading for global brand campaigns and independent features.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
    location: "Los Angeles, CA",
    availability: "Booking Q3/Q4",
    isPublished: true,
    createdAt: new Date("2025-01-01T00:00:00Z"),
    updatedAt: new Date("2025-01-02T00:00:00Z"),
    email: "alex@secret-agency.com",
    projects: [
      {
        id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
        profileId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        slug: "neon-horizons",
        title: "Neon Horizons",
        description: "An evocative visual journey through midnight Tokyo.",
        sourceType: "youtube",
        sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
        category: "Commercial",
        client: "Sony Music",
        year: 2024,
        tools: ["DaVinci Resolve", "Dehancer", "FilmConvert"],
        featured: true,
        isPublished: true,
        publishedAt: new Date("2025-01-02T00:00:00Z"),
        sortOrder: 1,
        createdAt: new Date("2025-01-01T10:00:00Z"),
        updatedAt: new Date("2025-01-01T12:00:00Z"),
      },
      {
        id: "d4e5f6a7-b8c9-0123-def1-234567890123",
        profileId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        slug: "silent-echoes",
        title: "Silent Echoes",
        description: "Nordic drama teaser edit.",
        sourceType: "google_drive",
        sourceUrl: "https://drive.google.com/file/d/1a2b3c4d5e6f7g8h9/view",
        thumbnailUrl: null,
        category: "Narrative",
        client: "Nordic Film Fund",
        year: 2023,
        tools: ["Premiere Pro"],
        featured: false,
        isPublished: true,
        publishedAt: new Date("2025-01-03T00:00:00Z"),
        sortOrder: 2,
        createdAt: new Date("2025-01-02T10:00:00Z"),
        updatedAt: new Date("2025-01-02T12:00:00Z"),
      },
      {
        id: "e5f6a7b8-c9d0-1234-ef12-345678901234",
        profileId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        slug: "draft-reel-unreleased",
        title: "Draft Reel Unreleased",
        description: "Should never leak to public.",
        sourceType: "youtube",
        sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        thumbnailUrl: null,
        category: "Internal",
        client: "Confidential",
        year: 2025,
        tools: [],
        featured: false,
        isPublished: false, // Draft!
        publishedAt: null,
        sortOrder: 0,
        createdAt: new Date("2025-01-03T10:00:00Z"),
        updatedAt: new Date("2025-01-03T12:00:00Z"),
      },
    ],
    socialLinks: [
      {
        id: "f6a7b8c9-d0e1-2345-f123-456789012345",
        profileId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        platform: "instagram",
        url: "https://instagram.com/alexrivera_color",
        sortOrder: 1,
      },
      {
        id: "07b8c9d0-e1f2-3456-1234-567890123456",
        profileId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        platform: "email",
        url: "mailto:alex@private-domain.com",
        sortOrder: 2,
      },
      {
        id: "18c9d0e1-f2a3-4567-2345-678901234567",
        profileId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        platform: "whatsapp",
        url: "https://wa.me/15551234567",
        sortOrder: 0,
      },
    ],
    services: [
      {
        id: "29d0e1f2-a3b4-5678-3456-789012345678",
        profileId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        name: "Color Grading & Mastering",
        sortOrder: 0,
      },
    ],
    skills: [
      {
        id: "3ae1f2a3-b4c5-6789-4567-890123456789",
        profileId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        name: "DaVinci Resolve Studio",
        sortOrder: 0,
      },
    ],
    settings: {
      id: "4bf2a3b4-c5d6-7890-5678-901234567890",
      profileId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      theme: "cinema",
      motionLevel: "full",
      accentColor: "#E5E5E5",
    },
  };

  it("strictly strips all database UUIDs, user IDs, emails, and unpublished projects in toPublicPortfolioData", () => {
    const publicData = toPublicPortfolioData(mockDbProfile);

    // Draft project must be filtered out
    expect(publicData.projects.length).toBe(2);
    expect(publicData.projects.map((p) => p.slug)).toEqual([
      "neon-horizons",
      "silent-echoes",
    ]);

    // Email link must be strictly excluded
    expect(
      publicData.socialLinks.some((l) => (l.platform as string) === "email")
    ).toBe(false);
    expect(
      publicData.socialLinks.some((l) => l.url.startsWith("mailto:"))
    ).toBe(false);
    expect(publicData.socialLinks.map((l) => l.platform)).toEqual([
      "whatsapp",
      "instagram",
    ]);

    // Deep inspection verifying no UUID keys or UUID values exist anywhere in the object
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    function assertNoPrivateData(obj: unknown, path = ""): void {
      if (obj === null || obj === undefined) return;
      if (typeof obj === "string") {
        expect(
          uuidRegex.test(obj),
          `Leaked UUID found at ${path}: "${obj}"`
        ).toBe(false);
        expect(
          obj.includes("alex@"),
          `Leaked email found at ${path}: "${obj}"`
        ).toBe(false);
        return;
      }
      if (Array.isArray(obj)) {
        obj.forEach((item, idx) => assertNoPrivateData(item, `${path}[${idx}]`));
        return;
      }
      if (typeof obj === "object") {
        for (const [key, value] of Object.entries(obj)) {
          expect(
            ["id", "userId", "profileId", "email", "session", "createdAt", "updatedAt", "publishedAt"].includes(
              key
            ),
            `Private database field "${key}" leaked at ${path}`
          ).toBe(false);
          assertNoPrivateData(value, `${path}.${key}`);
        }
      }
    }

    assertNoPrivateData(publicData, "publicData");

    // Profile projection contains only public safe attributes
    expect(publicData.profile).toEqual({
      username: "cinematic_alex",
      displayName: "Alex Rivera",
      headline: "Commercial & Narrative Colorist",
      bio: "Crafting atmospheric grading for global brand campaigns and independent features.",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
      location: "Los Angeles, CA",
      availability: "Booking Q3/Q4",
      isPublished: true,
    });
  });

  it("preserves internal IDs in toPortfolioData for dashboard editing", () => {
    const internalData = toPortfolioData(mockDbProfile);

    expect(internalData.profile.id).toBe(mockDbProfile.id);
    expect(internalData.profile.userId).toBe(mockDbProfile.userId);
    expect(internalData.projects.length).toBe(3);
    expect(internalData.projects[0].id).toBe(mockDbProfile.projects[0].id);
    expect(internalData.projects[0].profileId).toBe(mockDbProfile.id);
    expect(internalData.socialLinks[0].id).toBe(mockDbProfile.socialLinks[0].id);
    expect(internalData.services[0].id).toBe(mockDbProfile.services[0].id);
    expect(internalData.skills[0].id).toBe(mockDbProfile.skills[0].id);
    expect(internalData.settings?.id).toBe(mockDbProfile.settings.id);
  });
});

describe("Project Navigation Bridge", () => {
  const projects = [
    { slug: "alpha-project", title: "Alpha Project" },
    { slug: "beta-project", title: "Beta Project" },
    { slug: "gamma-project", title: "Gamma Project" },
  ];

  it("returns null prev for the first project and points next to the second", () => {
    const nav = computeProjectNavigation(projects, "alpha-project");
    expect(nav.prev).toBeNull();
    expect(nav.next).toEqual({
      slug: "beta-project",
      title: "Beta Project",
    });
  });

  it("returns both prev and next for middle project", () => {
    const nav = computeProjectNavigation(projects, "beta-project");
    expect(nav.prev).toEqual({
      slug: "alpha-project",
      title: "Alpha Project",
    });
    expect(nav.next).toEqual({
      slug: "gamma-project",
      title: "Gamma Project",
    });
  });

  it("returns null next for the last project and points prev to the middle", () => {
    const nav = computeProjectNavigation(projects, "gamma-project");
    expect(nav.prev).toEqual({
      slug: "beta-project",
      title: "Beta Project",
    });
    expect(nav.next).toBeNull();
  });

  it("returns null for both when single project exists", () => {
    const single = [{ slug: "solo", title: "Solo Project" }];
    const nav = computeProjectNavigation(single, "solo");
    expect(nav.prev).toBeNull();
    expect(nav.next).toBeNull();
  });

  it("returns null for both when slug does not exist", () => {
    const nav = computeProjectNavigation(projects, "non-existent-slug");
    expect(nav.prev).toBeNull();
    expect(nav.next).toBeNull();
  });
});

describe("Theme Registry & Dispatcher Fallbacks", () => {
  it("resolves registered 'cinema' theme layout and project page", () => {
    const theme = getTheme("cinema");
    expect(theme.id).toBe("cinema");
    expect(theme.name).toBe("Cinema");
    expect(theme.component).toBe(CinemaLayout);
    expect(theme.projectComponent).toBe(CinemaProjectPage);

    expect(getThemeComponent("cinema")).toBe(CinemaLayout);
    expect(getProjectThemeComponent("cinema")).toBe(CinemaProjectPage);
  });

  it("gracefully falls back to Cinema for unknown or uninstalled themes", () => {
    const fallbackForUnknown = getTheme("unknown_theme");
    expect(fallbackForUnknown.id).toBe(DEFAULT_THEME);
    expect(fallbackForUnknown.component).toBe(CinemaLayout);

    const fallbackForCustom = getTheme("cyberpunk_99");
    expect(fallbackForCustom.id).toBe(DEFAULT_THEME);
    expect(fallbackForCustom.component).toBe(CinemaLayout);
  });

  it("gracefully falls back to Cinema for null, undefined, or empty theme keys", () => {
    expect(getTheme(null).id).toBe(DEFAULT_THEME);
    expect(getTheme(undefined).id).toBe(DEFAULT_THEME);
    expect(getTheme("").id).toBe(DEFAULT_THEME);
    expect(getTheme("   ").id).toBe(DEFAULT_THEME);

    expect(getThemeComponent(null)).toBe(CinemaLayout);
    expect(getProjectThemeComponent(undefined)).toBe(CinemaProjectPage);
  });
});
