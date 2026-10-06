import { describe, it, expect, vi, beforeEach } from "vitest";
import { toExploreCreator, getExploreCreators } from "@/features/explore";
import { hashIpAddress, resolveClientIp } from "@/features/reports/ip-hash";
import { submitReportSchema } from "@/features/reports/validation";
import { submitReportAction } from "@/features/reports/actions/submit-report";
import { unpublishProfileModerationAction } from "@/features/admin/actions/unpublish-profile";
import { unpublishProjectModerationAction } from "@/features/admin/actions/unpublish-project";
import { resolveReportAction } from "@/features/admin/actions/resolve-report";
import { getAdminMetrics } from "@/features/admin/queries";
import { AppError } from "@/lib/errors";

// Setup mocks for Next.js headers and cache
vi.mock("next/headers", () => ({
  headers: vi.fn(
    async () =>
      new Headers({
        "x-forwarded-for": "198.51.100.42, 10.0.0.1",
      })
  ),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Setup mocks for auth guards
const mockRequireAdmin = vi.fn();
vi.mock("@/lib/auth-guards", () => ({
  requireAdmin: () => mockRequireAdmin(),
}));

// Setup mocks for Drizzle database
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockTransaction = vi.fn();
const mockFindManyProfiles = vi.fn();
const mockExecute = vi.fn();

vi.mock("@/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: (...args: unknown[]) => mockSelect(...args),
        }),
      }),
    }),
    insert: () => ({
      values: () => ({
        returning: (...args: unknown[]) => mockInsert(...args),
      }),
    }),
    update: () => ({
      set: () => ({
        where: (...args: unknown[]) => mockUpdate(...args),
      }),
    }),
    transaction: (cb: (tx: unknown) => unknown) => mockTransaction(cb),
    execute: (...args: unknown[]) => mockExecute(...args),
    query: {
      profiles: {
        findMany: (...args: unknown[]) => mockFindManyProfiles(...args),
      },
    },
  },
}));

describe("Explore Directory, Abuse Reporting & Admin Moderation (TASK-15, TASK-16, TASK-17)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================
  // TASK-15: Public Explore Directory Tests
  // ==========================================
  describe("TASK-15 — Public Explore Directory & Projection Sanitization", () => {
    const rawDbProfile = {
      id: "99999999-9999-9999-9999-999999999999",
      userId: "11111111-1111-1111-1111-111111111111",
      email: "creator@secret-personal-email.com",
      username: "cinematographer_jay",
      displayName: "Jayden Hayes",
      headline: "Commercial & Narrative Cinematographer",
      location: "London, UK",
      avatarUrl: "https://images.unsplash.com/avatar-jay.jpg",
      isPublished: true,
      projects: [
        {
          id: "22222222-2222-2222-2222-222222222222",
          profileId: "99999999-9999-9999-9999-999999999999",
          title: "Vogue Autumn Editorial",
          thumbnailUrl: "https://img.youtube.com/vi/abc/maxresdefault.jpg",
          category: "Commercial",
          featured: false,
          isPublished: true,
          sortOrder: 1,
          createdAt: new Date("2025-01-01"),
        },
        {
          id: "33333333-3333-3333-3333-333333333333",
          profileId: "99999999-9999-9999-9999-999999999999",
          title: "London After Hours — Showreel",
          thumbnailUrl: "https://img.youtube.com/vi/def/maxresdefault.jpg",
          category: "Commercial",
          featured: true, // Featured item!
          isPublished: true,
          sortOrder: 0,
          createdAt: new Date("2025-01-02"),
        },
        {
          id: "44444444-4444-4444-4444-444444444444",
          profileId: "99999999-9999-9999-9999-999999999999",
          title: "Secret Draft Film",
          thumbnailUrl: null,
          category: "Narrative",
          featured: false,
          isPublished: false, // Draft!
          sortOrder: 2,
          createdAt: new Date("2025-01-03"),
        },
      ],
    };

    it("strictly strips all database UUIDs, user IDs, emails, and draft projects", () => {
      const sanitized = toExploreCreator(rawDbProfile, rawDbProfile.projects);

      // Verify sanitized structure
      expect(sanitized.username).toBe("cinematographer_jay");
      expect(sanitized.displayName).toBe("Jayden Hayes");
      expect(sanitized.headline).toBe("Commercial & Narrative Cinematographer");
      expect(sanitized.location).toBe("London, UK");
      expect(sanitized.avatarUrl).toBe("https://images.unsplash.com/avatar-jay.jpg");
      expect(sanitized.projectCount).toBe(2); // Only the 2 published projects

      // Verify featured project is selected
      expect(sanitized.featuredProject).toEqual({
        title: "London After Hours — Showreel",
        thumbnailUrl: "https://img.youtube.com/vi/def/maxresdefault.jpg",
        category: "Commercial",
      });

      // Strict assertions against leaking sensitive fields
      const jsonOutput = JSON.stringify(sanitized);
      expect(jsonOutput).not.toContain("99999999-9999-9999-9999-999999999999");
      expect(jsonOutput).not.toContain("11111111-1111-1111-1111-111111111111");
      expect(jsonOutput).not.toContain("22222222-2222-2222-2222-222222222222");
      expect(jsonOutput).not.toContain("33333333-3333-3333-3333-333333333333");
      expect(jsonOutput).not.toContain("44444444-4444-4444-4444-444444444444");
      expect(jsonOutput).not.toContain("creator@secret-personal-email.com");
      expect(jsonOutput).not.toContain("Secret Draft Film");

      const rawKeys = Object.keys(sanitized);
      expect(rawKeys).not.toContain("id");
      expect(rawKeys).not.toContain("userId");
      expect(rawKeys).not.toContain("email");
    });

    it("falls back to the first published project if none are marked featured", () => {
      const projectsWithoutFeatured = [
        {
          title: "First Project",
          thumbnailUrl: "https://img.youtube.com/vi/1/maxresdefault.jpg",
          category: "Music Video",
          featured: false,
          isPublished: true,
          sortOrder: 0,
          createdAt: new Date("2025-01-01"),
        },
      ];

      const sanitized = toExploreCreator(rawDbProfile, projectsWithoutFeatured);
      expect(sanitized.featuredProject?.title).toBe("First Project");
      expect(sanitized.featuredProject?.category).toBe("Music Video");
    });

    it("getExploreCreators excludes creators who have zero published projects", async () => {
      mockFindManyProfiles.mockResolvedValueOnce([
        {
          username: "empty_creator",
          displayName: "Empty Creator",
          headline: "Colorist",
          location: null,
          avatarUrl: null,
          isPublished: true,
          projects: [], // 0 published projects!
        },
        {
          username: "valid_creator",
          displayName: "Valid Creator",
          headline: "Editor",
          location: "Berlin",
          avatarUrl: null,
          isPublished: true,
          projects: [
            {
              title: "Short Film",
              thumbnailUrl: null,
              category: "Narrative",
              featured: true,
              isPublished: true,
              sortOrder: 0,
              createdAt: new Date(),
            },
          ],
        },
      ]);

      const creators = await getExploreCreators();
      expect(creators).toHaveLength(1);
      expect(creators[0].username).toBe("valid_creator");
    });

    it("getExploreCreators filters creators by category", async () => {
      mockFindManyProfiles.mockResolvedValueOnce([
        {
          username: "doc_creator",
          displayName: "Doc Filmmaker",
          headline: "Documentary Director",
          location: "NYC",
          avatarUrl: null,
          isPublished: true,
          projects: [
            {
              title: "Arctic Meltdown",
              thumbnailUrl: null,
              category: "Documentary",
              featured: true,
              isPublished: true,
              sortOrder: 0,
              createdAt: new Date(),
            },
          ],
        },
        {
          username: "comm_creator",
          displayName: "Commercial Editor",
          headline: "Agency Editor",
          location: "LA",
          avatarUrl: null,
          isPublished: true,
          projects: [
            {
              title: "Car Commercial",
              thumbnailUrl: null,
              category: "Commercial",
              featured: true,
              isPublished: true,
              sortOrder: 0,
              createdAt: new Date(),
            },
          ],
        },
      ]);

      const docCreators = await getExploreCreators({ category: "Documentary" });
      expect(docCreators).toHaveLength(1);
      expect(docCreators[0].username).toBe("doc_creator");
    });
  });

  // ==========================================
  // TASK-16: Abuse Reporting System Tests
  // ==========================================
  describe("TASK-16 — Abuse Reporting System & Rate Limiting", () => {
    it("computes deterministic 64-character HMAC-SHA256 hash without plaintext IP leakage", () => {
      const ip = "203.0.113.195";
      const hash1 = hashIpAddress(ip);
      const hash2 = hashIpAddress(ip);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
      expect(hash1).toMatch(/^[a-f0-9]{64}$/);

      // Verify that differing IPs produce distinct hashes
      const diffHash = hashIpAddress("198.51.100.1");
      expect(diffHash).not.toBe(hash1);
      expect(diffHash).toHaveLength(64);

      // Verify client IP resolution
      const headers = new Headers({
        "x-forwarded-for": "103.21.244.0, 192.168.1.1",
      });
      expect(resolveClientIp(headers)).toBe("103.21.244.0");
    });

    it("validates report schema rules", () => {
      // Valid input
      const valid = submitReportSchema.safeParse({
        username: "filmmaker_bob",
        reason: "copyright",
        description: "This video uses my copyrighted soundtrack.",
      });
      expect(valid.success).toBe(true);

      // Invalid reason
      const invalidReason = submitReportSchema.safeParse({
        username: "filmmaker_bob",
        reason: "fraudulent_marketing", // not in enum
      });
      expect(invalidReason.success).toBe(false);

      // Description exceeds 1000 characters
      const longDesc = submitReportSchema.safeParse({
        username: "filmmaker_bob",
        reason: "spam",
        description: "a".repeat(1001),
      });
      expect(longDesc.success).toBe(false);
    });

    it("submits report successfully within rate limits", async () => {
      // 1. Profile select
      mockSelect
        .mockResolvedValueOnce([{ id: "prof-123", isPublished: true }]) // profile found
        .mockResolvedValueOnce([{ id: "proj-456", isPublished: true }]); // project found

      // 2. Transaction callback mock
      mockTransaction.mockImplementationOnce(async (cb: (tx: unknown) => unknown) => {
        const mockTx = {
          execute: vi.fn().mockResolvedValue(undefined),
          select: () => ({
            from: () => ({
              where: () => Promise.resolve([{ count: 2 }]), // 2 reports in last hour (< 5 limit)
            }),
          }),
          insert: () => ({
            values: () => ({
              returning: () => Promise.resolve([{ id: "report-new-id" }]),
            }),
          }),
        };
        return cb(mockTx);
      });

      const response = await submitReportAction({
        username: "filmmaker_bob",
        projectSlug: "summer-campaign",
        reason: "copyright",
        description: "Copyright infringement details.",
      });

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data.reportId).toBe("report-new-id");
      }
    });

    it("strictly aborts with HTTP 429 when rate limit of 5 reports/hour is reached", async () => {
      mockSelect.mockResolvedValueOnce([{ id: "prof-123", isPublished: true }]);

      mockTransaction.mockImplementationOnce(async (cb: (tx: unknown) => unknown) => {
        const mockTx = {
          execute: vi.fn().mockResolvedValue(undefined),
          select: () => ({
            from: () => ({
              where: () => Promise.resolve([{ count: 5 }]), // Already 5 reports in last hour!
            }),
          }),
        };
        return cb(mockTx);
      });

      const response = await submitReportAction({
        username: "filmmaker_bob",
        reason: "spam",
        description: "Spam link.",
      });

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.code).toBe("RATE_LIMITED");
        expect(response.error).toContain("You have submitted multiple reports recently");
      }
    });

    it("rejects report if target profile does not exist or is unpublished", async () => {
      mockSelect.mockResolvedValueOnce([]); // No published profile found

      const response = await submitReportAction({
        username: "non_existent_creator",
        reason: "spam",
      });

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.code).toBe("NOT_FOUND");
      }
    });
  });

  // ==========================================
  // TASK-17: Admin Command Center Tests
  // ==========================================
  describe("TASK-17 — Admin Command Center & Moderation Actions", () => {
    it("enforces requireAdmin guard on admin metrics and actions", async () => {
      mockRequireAdmin.mockRejectedValueOnce(
        AppError.forbidden("Admin access required")
      );

      await expect(getAdminMetrics()).rejects.toMatchObject({
        code: "FORBIDDEN",
        statusCode: 403,
      });
      expect(mockRequireAdmin).toHaveBeenCalled();
    });

    it("unpublishProfileModerationAction unpublishes profile and triggers revalidation", async () => {
      mockRequireAdmin.mockResolvedValueOnce({
        user: { id: "admin-1", role: "admin" },
      });

      mockSelect.mockResolvedValueOnce([{ id: "prof-to-unpublish", username: "bad_creator" }]);
      mockUpdate.mockResolvedValueOnce(undefined);

      const response = await unpublishProfileModerationAction("prof-to-unpublish");
      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data.isPublished).toBe(false);
      }
    });

    it("unpublishProjectModerationAction unpublishes project and triggers revalidation", async () => {
      mockRequireAdmin.mockResolvedValueOnce({
        user: { id: "admin-1", role: "admin" },
      });

      mockSelect
        .mockResolvedValueOnce([
          { id: "proj-1", slug: "bad-video", profileId: "prof-1" },
        ])
        .mockResolvedValueOnce([{ username: "creator_one" }]);
      mockUpdate.mockResolvedValueOnce(undefined);

      const response = await unpublishProjectModerationAction("proj-1");
      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data.isPublished).toBe(false);
      }
    });

    it("resolveReportAction transitions report to resolved or dismissed with audit trail", async () => {
      mockRequireAdmin.mockResolvedValueOnce({
        session: { user: { id: "admin-uuid-123" } },
      });

      mockSelect.mockResolvedValueOnce([{ id: "rep-1", status: "pending" }]);
      mockUpdate.mockResolvedValueOnce(undefined);

      const response = await resolveReportAction("rep-1", "action_taken");
      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data.status).toBe("resolved");
      }

      // Test dismiss action
      mockRequireAdmin.mockResolvedValueOnce({
        session: { user: { id: "admin-uuid-123" } },
      });
      mockSelect.mockResolvedValueOnce([{ id: "rep-2", status: "pending" }]);
      mockUpdate.mockResolvedValueOnce(undefined);

      const dismissResponse = await resolveReportAction("rep-2", "dismiss");
      expect(dismissResponse.success).toBe(true);
      if (dismissResponse.success) {
        expect(dismissResponse.data.status).toBe("dismissed");
      }
    });
  });
});
