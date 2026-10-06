import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/headers
vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));

// Mock auth.api.getSession
const mockGetSession = vi.fn();
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: () => mockGetSession(),
    },
  },
}));

// Mock DB
const mockExecute = vi.fn();
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockTransaction = vi.fn();

const createQueryBuilder = () => {
  const builder = {
    from: () => builder,
    where: () => builder,
    orderBy: () => Promise.resolve(mockSelect()),
    limit: (...args: unknown[]) => Promise.resolve(mockSelect(...args)),
    then: (resolve: (v: unknown) => unknown) => Promise.resolve(mockSelect()).then(resolve),
  };
  return builder;
};

vi.mock("@/db", () => ({
  db: {
    select: () => createQueryBuilder(),
    insert: () => ({
      values: () => ({
        returning: () => Promise.resolve(mockInsert()),
      }),
    }),
    update: () => ({
      set: () => ({
        where: () => ({
          returning: () => Promise.resolve(mockUpdate()),
        }),
      }),
    }),
    delete: () => ({
      where: () => Promise.resolve(mockDelete()),
    }),
    transaction: (cb: (tx: unknown) => unknown) => mockTransaction(cb),
    execute: (...args: unknown[]) => mockExecute(...args),
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

import { revalidatePath } from "next/cache";

import {
  createProjectSchema,
  isValidThumbnailHost,
} from "@/features/projects/validation";
import { generateDeterministicProjectSlug } from "@/features/projects/utils";
import {
  updateProjectAction,
  toggleProjectPublishAction,
  reorderProjectsAction,
} from "@/features/projects/actions";
import {
  updateProfileSchema,
  serviceItemSchema,
  skillItemSchema,
  socialLinkItemSchema,
  manageSocialLinksSchema,
} from "@/features/profile/validation";
import {
  portfolioSettingsSchema,
  updateUsernameSchema,
} from "@/features/design/validation";
import { requireProfileOwner } from "@/lib/auth-guards";

// Valid RFC 4122 UUID fixtures
const VALID_UUID_PROFILE = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
const VALID_UUID_PROJECT_1 = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";
const VALID_UUID_PROJECT_2 = "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33";

describe("Dashboard Management Unit Tests (TASK-10 to TASK-13)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({
      user: { id: "user-123", email: "creator@example.com", role: "creator" },
      session: {
        id: "sess-1",
        userId: "user-123",
        expiresAt: new Date(Date.now() + 100000),
      },
    });
  });

  describe("1. Validation Schemas", () => {
    describe("Projects Validation & Thumbnail Allowlist", () => {
      it("validates allowed thumbnail image hosts correctly", () => {
        expect(
          isValidThumbnailHost("https://images.unsplash.com/photo-12345")
        ).toBe(true);
        expect(
          isValidThumbnailHost("https://cdn.sanity.io/images/proj/asset.jpg")
        ).toBe(true);
        expect(
          isValidThumbnailHost("https://drive.google.com/uc?id=123")
        ).toBe(true);
        expect(
          isValidThumbnailHost("https://lh3.googleusercontent.com/abc")
        ).toBe(true);
        expect(
          isValidThumbnailHost("https://i.imgur.com/sample.png")
        ).toBe(true);
        expect(
          isValidThumbnailHost("https://res.cloudinary.com/demo/image/upload/sample.jpg")
        ).toBe(true);

        // Reject untrusted hosts
        expect(
          isValidThumbnailHost("https://malicious-site.com/image.jpg")
        ).toBe(false);
        expect(isValidThumbnailHost("http://localhost:3000/image.jpg")).toBe(
          false
        );
        expect(isValidThumbnailHost("javascript:alert(1)")).toBe(false);
      });

      it("validates createProjectSchema with supported media URL and constraints", () => {
        const valid = createProjectSchema.safeParse({
          title: "Cinematic Reel 2026",
          sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          category: "Commercial",
          thumbnailUrl: "https://images.unsplash.com/photo-test",
          year: 2024,
          tools: ["Premiere Pro", "DaVinci Resolve"],
          featured: true,
          isPublished: false,
        });

        expect(valid.success).toBe(true);
      });

      it("rejects createProjectSchema with disallowed thumbnail host", () => {
        const invalid = createProjectSchema.safeParse({
          title: "Cinematic Reel",
          sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          category: "Commercial",
          thumbnailUrl: "https://evil-cdn.org/malware.png",
        });

        expect(invalid.success).toBe(false);
        if (!invalid.success) {
          expect(invalid.error.issues[0].message).toContain(
            "Thumbnail URL must be hosted on an allowed domain"
          );
        }
      });

      it("rejects createProjectSchema with invalid media provider URL", () => {
        const invalid = createProjectSchema.safeParse({
          title: "Cinematic Reel",
          sourceUrl: "https://vimeo.com/123456", // Vimeo is prohibited in V1
          category: "Commercial",
        });

        expect(invalid.success).toBe(false);
      });

      it("enforces title length limits (1-140) and year limits (1990-2100)", () => {
        expect(
          createProjectSchema.safeParse({
            title: "",
            sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            category: "Commercial",
          }).success
        ).toBe(false);

        expect(
          createProjectSchema.safeParse({
            title: "a".repeat(141),
            sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            category: "Commercial",
          }).success
        ).toBe(false);

        expect(
          createProjectSchema.safeParse({
            title: "Valid Title",
            sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            category: "Commercial",
            year: 1980,
          }).success
        ).toBe(false);

        expect(
          createProjectSchema.safeParse({
            title: "Valid Title",
            sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            category: "Commercial",
            year: 2150,
          }).success
        ).toBe(false);
      });

      it("generates deterministic project slug with collision retry suffix", () => {
        expect(generateDeterministicProjectSlug("Autumn in Tokyo", 0)).toBe(
          "autumn-in-tokyo"
        );
        expect(generateDeterministicProjectSlug("Autumn in Tokyo", 1)).toBe(
          "autumn-in-tokyo-1"
        );
        expect(generateDeterministicProjectSlug("Autumn in Tokyo", 5)).toBe(
          "autumn-in-tokyo-5"
        );
      });
    });

    describe("Profile & Auxiliary Validation", () => {
      it("validates updateProfileSchema with valid data", () => {
        const valid = updateProfileSchema.safeParse({
          displayName: "Elena Rostova",
          headline: "Commercial Film Director & Colorist",
          location: "Berlin & London",
          bio: "10+ years directing narrative shorts and luxury commercials.",
          availability: "Booking Q3 2026",
          avatarUrl: "https://images.unsplash.com/photo-avatar",
        });
        expect(valid.success).toBe(true);
      });

      it("rejects invalid display name or headline lengths", () => {
        expect(
          updateProfileSchema.safeParse({
            displayName: "E", // min 2
            headline: "Valid headline",
          }).success
        ).toBe(false);

        expect(
          updateProfileSchema.safeParse({
            displayName: "Elena Rostova",
            headline: "a".repeat(121), // max 120
          }).success
        ).toBe(false);

        expect(
          updateProfileSchema.safeParse({
            displayName: "Elena Rostova",
            headline: "Valid headline",
            bio: "b".repeat(1001), // max 1000
          }).success
        ).toBe(false);
      });

      it("validates serviceItemSchema and skillItemSchema constraints", () => {
        expect(serviceItemSchema.safeParse({ name: "Color Grading" }).success).toBe(
          true
        );
        expect(serviceItemSchema.safeParse({ name: "" }).success).toBe(false);
        expect(serviceItemSchema.safeParse({ name: "a".repeat(81) }).success).toBe(
          false
        );

        expect(skillItemSchema.safeParse({ name: "DaVinci Resolve" }).success).toBe(
          true
        );
        expect(skillItemSchema.safeParse({ name: "" }).success).toBe(false);
        expect(skillItemSchema.safeParse({ name: "a".repeat(61) }).success).toBe(
          false
        );
      });

      it("enforces https:// protocol on social links and rejects duplicates", () => {
        const validLink = socialLinkItemSchema.safeParse({
          platform: "instagram",
          url: "https://instagram.com/elenafilms",
        });
        expect(validLink.success).toBe(true);

        const invalidProtocol = socialLinkItemSchema.safeParse({
          platform: "instagram",
          url: "http://instagram.com/elenafilms", // Must be https://
        });
        expect(invalidProtocol.success).toBe(false);

        const duplicateCheck = manageSocialLinksSchema.safeParse({
          profileId: VALID_UUID_PROFILE,
          socialLinks: [
            { platform: "instagram", url: "https://instagram.com/one" },
            { platform: "instagram", url: "https://instagram.com/two" },
          ],
        });
        expect(duplicateCheck.success).toBe(false);
        if (!duplicateCheck.success) {
          expect(duplicateCheck.error.issues[0].message).toContain(
            "Duplicate platforms are not allowed"
          );
        }
      });
    });

    describe("Design & Settings Validation", () => {
      it("validates portfolioSettingsSchema themes, motion levels, and accent colors", () => {
        expect(
          portfolioSettingsSchema.safeParse({
            theme: "cinema",
            motionLevel: "full",
            accentColor: "#E5E5E5",
          }).success
        ).toBe(true);

        expect(
          portfolioSettingsSchema.safeParse({
            theme: "editorial",
            motionLevel: "reduced",
            accentColor: "#EF4444",
          }).success
        ).toBe(true);

        expect(
          portfolioSettingsSchema.safeParse({
            theme: "studio",
            motionLevel: "full",
            accentColor: "#10B981",
          }).success
        ).toBe(true);

        // Disallowed theme
        expect(
          portfolioSettingsSchema.safeParse({
            theme: "neon_future",
            motionLevel: "full",
            accentColor: "#E5E5E5",
          }).success
        ).toBe(false);

        // Invalid hex code
        expect(
          portfolioSettingsSchema.safeParse({
            theme: "cinema",
            motionLevel: "full",
            accentColor: "red",
          }).success
        ).toBe(false);

        expect(
          portfolioSettingsSchema.safeParse({
            theme: "cinema",
            motionLevel: "full",
            accentColor: "#12345", // must be 6 hex digits
          }).success
        ).toBe(false);
      });

      it("validates updateUsernameSchema format and reserved names", () => {
        expect(updateUsernameSchema.safeParse({ username: "alexfilms" }).success).toBe(
          true
        );
        expect(updateUsernameSchema.safeParse({ username: "admin" }).success).toBe(
          false
        );
        expect(updateUsernameSchema.safeParse({ username: "dashboard" }).success).toBe(
          false
        );
        expect(updateUsernameSchema.safeParse({ username: "about" }).success).toBe(
          false
        );
        expect(updateUsernameSchema.safeParse({ username: "work" }).success).toBe(
          false
        );
        expect(updateUsernameSchema.safeParse({ username: "gowider" }).success).toBe(
          false
        );
        expect(updateUsernameSchema.safeParse({ username: "-bad-" }).success).toBe(
          false
        );
        expect(updateUsernameSchema.safeParse({ username: "ab" }).success).toBe(
          false
        );
      });
    });
  });

  describe("2. Ownership Guard Verification", () => {
    it("allows access when profile.userId matches session.user.id", async () => {
      mockSelect.mockReturnValueOnce([
        { id: VALID_UUID_PROFILE, userId: "user-123", username: "creator" },
      ]);

      const result = await requireProfileOwner(VALID_UUID_PROFILE);
      expect(result.profile.id).toBe(VALID_UUID_PROFILE);
      expect(result.profile.userId).toBe("user-123");
    });

    it("throws AppError.forbidden when profile.userId does not match session", async () => {
      mockGetSession.mockResolvedValueOnce({
        user: { id: "user-attacker", email: "hacker@example.com", role: "creator" },
        session: {
          id: "sess-2",
          userId: "user-attacker",
          expiresAt: new Date(Date.now() + 100000),
        },
      });

      mockSelect.mockReturnValueOnce([
        { id: VALID_UUID_PROFILE, userId: "user-victim", username: "victim" },
      ]);

      await expect(requireProfileOwner(VALID_UUID_PROFILE)).rejects.toThrow(
        "You do not own this profile"
      );
    });

    it("throws AppError.notFound when profile does not exist", async () => {
      mockSelect.mockReturnValueOnce([]);

      await expect(requireProfileOwner(VALID_UUID_PROFILE)).rejects.toThrow(
        "Profile not found"
      );
    });
  });

  describe("3. Published Slug Immutability & Publish Lifecycle", () => {
    it("strictly blocks slug changes when published_at IS NOT NULL", async () => {
      // Existing project is already published
      mockSelect.mockReturnValueOnce([
        {
          id: VALID_UUID_PROJECT_1,
          profileId: VALID_UUID_PROFILE,
          slug: "original-published-slug",
          publishedAt: new Date("2026-01-01"),
          isPublished: true,
        },
      ]);
      // Profile ownership lookup inside requireProfileOwner
      mockSelect.mockReturnValueOnce([
        {
          id: VALID_UUID_PROFILE,
          userId: "user-123",
          username: "creator",
        },
      ]);

      const res = await updateProjectAction({
        id: VALID_UUID_PROJECT_1,
        slug: "attempted-new-slug",
      });

      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error).toBe(
          "Published project slugs are immutable and cannot be changed"
        );
      }
    });

    it("allows slug changes when published_at is NULL (draft project)", async () => {
      // Existing project is a draft (publishedAt is null)
      mockSelect.mockReturnValueOnce([
        {
          id: VALID_UUID_PROJECT_1,
          profileId: VALID_UUID_PROFILE,
          slug: "draft-slug",
          publishedAt: null,
          isPublished: false,
        },
      ]);
      // Profile ownership lookup inside requireProfileOwner
      mockSelect.mockReturnValueOnce([
        {
          id: VALID_UUID_PROFILE,
          userId: "user-123",
          username: "creator",
        },
      ]);
      // Slug collision check
      mockSelect.mockReturnValueOnce([]);
      // Update returning
      mockUpdate.mockReturnValueOnce([
        {
          id: VALID_UUID_PROJECT_1,
          slug: "new-draft-slug",
          publishedAt: null,
          isPublished: false,
        },
      ]);

      const res = await updateProjectAction({
        id: VALID_UUID_PROJECT_1,
        slug: "new-draft-slug",
      });

      expect(res.success).toBe(true);
    });

    it("stamps published_at = now() on first publication and never resets to null on unpublish", async () => {
      // First publication: existing publishedAt is null
      mockSelect.mockReturnValueOnce([
        {
          id: VALID_UUID_PROJECT_1,
          profileId: VALID_UUID_PROFILE,
          slug: "showreel-2026",
          isPublished: false,
          publishedAt: null,
        },
      ]);
      // Profile check
      mockSelect.mockReturnValueOnce([
        {
          id: VALID_UUID_PROFILE,
          userId: "user-123",
          username: "creator",
        },
      ]);
      // Published count check (1 published)
      mockSelect.mockReturnValueOnce([{ count: 1 }]);
      // Subscription check (Free tier)
      mockSelect.mockReturnValueOnce([]);

      const stampedDate = new Date();
      mockUpdate.mockReturnValueOnce([
        {
          id: VALID_UUID_PROJECT_1,
          slug: "showreel-2026",
          isPublished: true,
          publishedAt: stampedDate,
        },
      ]);

      const pubRes = await toggleProjectPublishAction(VALID_UUID_PROJECT_1);
      expect(pubRes.success).toBe(true);
      if (pubRes.success) {
        expect(pubRes.data.isPublished).toBe(true);
        expect(pubRes.data.publishedAt).toBeDefined();
        expect(revalidatePath).toHaveBeenCalledWith("/creator/work/showreel-2026");
      }

      // Second toggle: unpublishing. publishedAt must NOT be set to null.
      mockSelect.mockReturnValueOnce([
        {
          id: VALID_UUID_PROJECT_1,
          profileId: VALID_UUID_PROFILE,
          isPublished: true,
          publishedAt: stampedDate,
        },
      ]);
      mockSelect.mockReturnValueOnce([
        {
          id: VALID_UUID_PROFILE,
          userId: "user-123",
          username: "creator",
        },
      ]);
      mockUpdate.mockReturnValueOnce([
        {
          id: VALID_UUID_PROJECT_1,
          isPublished: false,
          publishedAt: stampedDate, // preserved!
        },
      ]);

      const unpubRes = await toggleProjectPublishAction(VALID_UUID_PROJECT_1);
      expect(unpubRes.success).toBe(true);
      if (unpubRes.success) {
        expect(unpubRes.data.isPublished).toBe(false);
        expect(unpubRes.data.publishedAt).toEqual(stampedDate);
      }
    });
  });

  describe("4. Advisory Lock Project Reordering Logic", () => {
    it("calls pg_advisory_xact_lock and updates dense 0..N-1 sort orders", async () => {
      // Profile ownership lookup inside requireProfileOwner
      mockSelect.mockReturnValueOnce([
        { id: VALID_UUID_PROFILE, userId: "user-123", username: "creator" },
      ]);

      // Mock transaction execution
      mockTransaction.mockImplementation(async (callback) => {
        const txMockExecute = vi.fn();
        const txMockSelect = vi.fn().mockResolvedValue([
          { id: VALID_UUID_PROJECT_1 },
          { id: VALID_UUID_PROJECT_2 },
        ]);
        const txMockUpdate = vi.fn().mockReturnValue({
          set: () => ({
            where: () => Promise.resolve(),
          }),
        });

        const tx = {
          execute: txMockExecute,
          select: () => ({
            from: () => ({
              where: () => txMockSelect(),
            }),
          }),
          update: txMockUpdate,
        };

        const result = await callback(tx);
        expect(txMockExecute).toHaveBeenCalled();
        return result;
      });

      const res = await reorderProjectsAction({
        profileId: VALID_UUID_PROFILE,
        projectIds: [VALID_UUID_PROJECT_2, VALID_UUID_PROJECT_1], // reordered
      });

      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.reordered).toBe(true);
        expect(res.data.count).toBe(2);
      }
    });

    it("rejects reordering when projectIds do not match profile projects count", async () => {
      mockSelect.mockReturnValueOnce([
        { id: VALID_UUID_PROFILE, userId: "user-123", username: "creator" },
      ]);

      mockTransaction.mockImplementation(async (callback) => {
        const tx = {
          execute: vi.fn(),
          select: () => ({
            from: () => ({
              where: () =>
                Promise.resolve([
                  { id: VALID_UUID_PROJECT_1 },
                  { id: VALID_UUID_PROJECT_2 },
                ]),
            }),
          }),
        };
        return await callback(tx);
      });

      const res = await reorderProjectsAction({
        profileId: VALID_UUID_PROFILE,
        projectIds: [VALID_UUID_PROJECT_1], // only 1 id passed, expected 2
      });

      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error).toContain("does not match");
      }
    });
  });
});
