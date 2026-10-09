import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  isReservedUsername,
  normalizeUsername,
  isValidUsernameFormat,
} from "@/features/onboarding/constants";
import {
  claimUsernameSchema,
  updateIdentitySchema,
  createFirstProjectSchema,
  setAestheticSchema,
} from "@/features/onboarding/validation";
import { enforceRateLimit, resetRateLimits } from "@/features/onboarding/rate-limit";
import { AppError } from "@/lib/errors";

// Mock DB and Auth for testing progress derivation and actions
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockTransaction = vi.fn();

vi.mock("@/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: (...args: unknown[]) => mockSelect(...args),
          then: (resolve: (v: unknown) => unknown) => Promise.resolve(mockSelect()).then(resolve),
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
        where: () => ({
          returning: (...args: unknown[]) => mockUpdate(...args),
        }),
      }),
    }),
    transaction: (cb: (tx: unknown) => unknown) => mockTransaction(cb),
  },
}));

const mockRequireAuth = vi.fn();
vi.mock("@/lib/auth-guards", () => ({
  requireAuth: () => mockRequireAuth(),
}));

import { getOnboardingProgress } from "@/features/onboarding/progress";
import { generateDeterministicProjectSlug } from "@/features/onboarding/utils";
import {
  claimUsernameAction,
  checkUsernameAvailabilityAction,
} from "@/features/onboarding/actions/claim-username";
import {
  getDbErrorCode,
  getDbErrorConstraint,
  isUniqueConstraintError,
} from "@/lib/db-errors";

describe("Onboarding Engine & First Publication (TASK-04)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimits();
  });

  describe("Username Normalization & Reserved Names Checking", () => {
    it("normalizes username by trimming whitespace and converting to lowercase", () => {
      expect(normalizeUsername("  AlexEditor  ")).toBe("alexeditor");
      expect(normalizeUsername("CREATOR_99")).toBe("creator_99");
    });

    it("identifies reserved system usernames correctly", () => {
      expect(isReservedUsername("admin")).toBe(true);
      expect(isReservedUsername("ADMIN")).toBe(true);
      expect(isReservedUsername("api")).toBe(true);
      expect(isReservedUsername("dashboard")).toBe(true);
      expect(isReservedUsername("onboarding")).toBe(true);
      expect(isReservedUsername("settings")).toBe(true);
      expect(isReservedUsername("about")).toBe(true);
      expect(isReservedUsername("work")).toBe(true);
      expect(isReservedUsername("gowider")).toBe(true);
      expect(isReservedUsername("mycustomportfolio")).toBe(false);
    });

    it("validates regex format ^[a-z0-9][a-z0-9_-]{1,28}[a-z0-9]$", () => {
      expect(isValidUsernameFormat("ab")).toBe(false); // min length 3 in regex
      expect(isValidUsernameFormat("abc")).toBe(true);
      expect(isValidUsernameFormat("alex_editor-99")).toBe(true);
      expect(isValidUsernameFormat("-invalid")).toBe(false); // cannot start with hyphen
      expect(isValidUsernameFormat("invalid-")).toBe(false); // cannot end with hyphen
      expect(isValidUsernameFormat("invalid_")).toBe(false); // cannot end with underscore
      expect(isValidUsernameFormat("invalid@name")).toBe(false); // no special characters
      expect(isValidUsernameFormat("a".repeat(31))).toBe(false); // max 30 chars
    });
  });

  describe("Action Validation Schemas", () => {
    describe("claimUsernameSchema", () => {
      it("accepts valid non-reserved username", () => {
        const result = claimUsernameSchema.safeParse({ username: "alexcuts" });
        expect(result.success).toBe(true);
      });

      it("rejects reserved username with custom error message", () => {
        const result = claimUsernameSchema.safeParse({ username: "admin" });
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toMatch(/reserved/i);
        }
      });

      it("rejects invalid characters in username", () => {
        const result = claimUsernameSchema.safeParse({ username: "alex.cuts!" });
        expect(result.success).toBe(false);
      });
    });

    describe("updateIdentitySchema", () => {
      it("validates required display name and headline with length bounds", () => {
        expect(
          updateIdentitySchema.safeParse({
            displayName: "A",
            headline: "Valid headline",
          }).success
        ).toBe(false);

        expect(
          updateIdentitySchema.safeParse({
            displayName: "Alex Morgan",
            headline: "H",
          }).success
        ).toBe(false);

        expect(
          updateIdentitySchema.safeParse({
            displayName: "Alex Morgan",
            headline: "Commercial Film & Music Video Lead Editor",
            location: "London, UK",
            bio: "Experienced editor with 8+ years cutting commercial spots.",
          }).success
        ).toBe(true);
      });

      it("allows empty location and bio", () => {
        const result = updateIdentitySchema.safeParse({
          displayName: "Alex Morgan",
          headline: "Film Editor",
          location: "",
          bio: "",
        });
        expect(result.success).toBe(true);
      });
    });

    describe("createFirstProjectSchema", () => {
      it("validates project fields and required media source URL", () => {
        const valid = createFirstProjectSchema.safeParse({
          title: "Nike Brand Manifesto",
          sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          category: "Commercial",
          client: "Nike Vision",
          year: 2024,
          tools: ["Premiere", "After Effects"],
        });
        expect(valid.success).toBe(true);
      });

      it("rejects empty title or sourceUrl", () => {
        expect(
          createFirstProjectSchema.safeParse({
            title: "",
            sourceUrl: "https://youtube.com/watch?v=xyz",
            category: "Commercial",
          }).success
        ).toBe(false);

        expect(
          createFirstProjectSchema.safeParse({
            title: "Valid Title",
            sourceUrl: "",
            category: "Commercial",
          }).success
        ).toBe(false);
      });
    });

    describe("setAestheticSchema", () => {
      it("validates allowed theme enums and motion levels", () => {
        expect(
          setAestheticSchema.safeParse({
            theme: "cinema",
            motionLevel: "full",
          }).success
        ).toBe(true);

        expect(
          setAestheticSchema.safeParse({
            theme: "editorial",
            motionLevel: "reduced",
          }).success
        ).toBe(true);

        expect(
          setAestheticSchema.safeParse({
            theme: "invalid-theme",
            motionLevel: "full",
          }).success
        ).toBe(false);
      });
    });
  });

  describe("Deterministic Project Slug Generation", () => {
    it("generates clean URL-friendly slugs", () => {
      expect(generateDeterministicProjectSlug("My Commercial Reel 2025")).toBe(
        "my-commercial-reel-2025"
      );
    });

    it("appends numeric attempt index on collision retry", () => {
      expect(generateDeterministicProjectSlug("Nike Campaign", 1)).toBe("nike-campaign-1");
      expect(generateDeterministicProjectSlug("Nike Campaign", 2)).toBe("nike-campaign-2");
    });
  });

  describe("Server-Side Rate Limiter", () => {
    it("enforces max 30 requests per minute and throws AppError.rateLimited", () => {
      const key = "user-test-rate-limit";
      for (let i = 0; i < 30; i++) {
        expect(() => enforceRateLimit(key, 30, 60000)).not.toThrow();
      }

      expect(() => enforceRateLimit(key, 30, 60000)).toThrow(AppError);
      expect(() => enforceRateLimit(key, 30, 60000)).toThrow(/Rate limit exceeded/);
    });
  });

  describe("Server-Side Onboarding Step Derivation (5 States)", () => {
    it("derives Step 1: No profile record exists -> Claim username", async () => {
      mockSelect.mockResolvedValueOnce([]); // no profile

      const progress = await getOnboardingProgress("user-1");
      expect(progress.currentStep).toBe(1);
      expect(progress.isComplete).toBe(false);
      expect(progress.profile).toBeNull();
    });

    it("derives Step 2: Profile exists but missing displayName or headline -> Identity setup", async () => {
      mockSelect.mockResolvedValueOnce([
        {
          id: "prof-1",
          userId: "user-1",
          username: "alexcuts",
          displayName: "", // missing
          headline: "",
          isPublished: false,
        },
      ]);

      const progress = await getOnboardingProgress("user-1");
      expect(progress.currentStep).toBe(2);
      expect(progress.isComplete).toBe(false);
      expect(progress.profile?.username).toBe("alexcuts");
    });

    it("derives Step 3: Zero projects for profile -> First work creation", async () => {
      mockSelect
        .mockResolvedValueOnce([
          {
            id: "prof-1",
            userId: "user-1",
            username: "alexcuts",
            displayName: "Alex Cuts",
            headline: "Editor",
            isPublished: false,
          },
        ]) // profile found
        .mockResolvedValueOnce([{ count: 0 }]); // 0 projects

      const progress = await getOnboardingProgress("user-1");
      expect(progress.currentStep).toBe(3);
      expect(progress.isComplete).toBe(false);
      expect(progress.projectsCount).toBe(0);
    });

    it("derives Step 4: Settings record missing or unconfigured -> Aesthetic theme selection", async () => {
      mockSelect
        .mockResolvedValueOnce([
          {
            id: "prof-1",
            userId: "user-1",
            username: "alexcuts",
            displayName: "Alex Cuts",
            headline: "Editor",
            isPublished: false,
          },
        ]) // profile
        .mockResolvedValueOnce([{ count: 1 }]) // 1 project
        .mockResolvedValueOnce([]); // no settings

      const progress = await getOnboardingProgress("user-1");
      expect(progress.currentStep).toBe(4);
      expect(progress.isComplete).toBe(false);
      expect(progress.projectsCount).toBe(1);
      expect(progress.settings).toBeNull();
    });

    it("derives Step 5: Profile exists with all above but is_published = false -> Preview & Publish", async () => {
      mockSelect
        .mockResolvedValueOnce([
          {
            id: "prof-1",
            userId: "user-1",
            username: "alexcuts",
            displayName: "Alex Cuts",
            headline: "Editor",
            isPublished: false, // not published
          },
        ]) // profile
        .mockResolvedValueOnce([{ count: 2 }]) // 2 projects
        .mockResolvedValueOnce([
          {
            id: "set-1",
            profileId: "prof-1",
            theme: "cinema",
            motionLevel: "full",
          },
        ]); // settings

      const progress = await getOnboardingProgress("user-1");
      expect(progress.currentStep).toBe(5);
      expect(progress.isComplete).toBe(false);
      expect(progress.settings?.theme).toBe("cinema");
    });

    it("derives Completed: Profile isPublished = true", async () => {
      mockSelect
        .mockResolvedValueOnce([
          {
            id: "prof-1",
            userId: "user-1",
            username: "alexcuts",
            displayName: "Alex Cuts",
            headline: "Editor",
            isPublished: true, // published!
          },
        ])
        .mockResolvedValueOnce([{ count: 2 }])
        .mockResolvedValueOnce([
          {
            id: "set-1",
            profileId: "prof-1",
            theme: "editorial",
            motionLevel: "full",
          },
        ]);

      const progress = await getOnboardingProgress("user-1");
      expect(progress.currentStep).toBe(5);
      expect(progress.isComplete).toBe(true);
    });
  });

  describe("Database Error Inspection & 23505 Collision Handling", () => {
    it("extracts error code and constraint from driver error wrapped by Drizzle", () => {
      // Drizzle wraps driver error in .cause
      const drizzleQueryError = new Error(
        'Failed query: insert into "profiles" ("id", "user_id", "username") values ($1, $2, $3)'
      );
      (drizzleQueryError as unknown as { cause: unknown }).cause = {
        name: "DatabaseError",
        code: "23505",
        constraint: "profiles_username_unique",
        detail: "Key (username)=(neeraja) already exists.",
      };

      expect(getDbErrorCode(drizzleQueryError)).toBe("23505");
      expect(getDbErrorConstraint(drizzleQueryError)).toBe("profiles_username_unique");
      expect(isUniqueConstraintError(drizzleQueryError)).toBe(true);
      expect(isUniqueConstraintError(drizzleQueryError, "profiles_username_unique")).toBe(true);
      expect(isUniqueConstraintError(drizzleQueryError, "other_constraint")).toBe(false);
    });

    it("returns false for unrelated errors", () => {
      const unrelatedError = new Error("Connection timed out");
      expect(getDbErrorCode(unrelatedError)).toBeUndefined();
      expect(isUniqueConstraintError(unrelatedError)).toBe(false);
    });
  });

  describe("claimUsernameAction Collision & Sanitization", () => {
    it("catches Drizzle-wrapped 23505 unique collision and returns safe conflict response without query leakage", async () => {
      mockRequireAuth.mockResolvedValueOnce({
        user: { id: "user-123", name: "Alex Morgan" },
      });

      // No existing profile for user-123
      mockSelect.mockResolvedValueOnce([]);

      // Insert fails with wrapped Drizzle unique constraint error
      const drizzleError = new Error(
        'Failed query: insert into "profiles" ("id", "user_id", "username") values ($1, $2, $3) params: user-123,neeraja,Alex Morgan'
      );
      (drizzleError as unknown as { cause: unknown }).cause = {
        code: "23505",
        constraint: "profiles_username_unique",
      };
      mockInsert.mockRejectedValueOnce(drizzleError);

      const result = await claimUsernameAction("neeraja");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe("CONFLICT");
        expect(result.error).toBe("Username is already taken. Please choose another.");
        // Crucial security check: zero query or internal ID leakage
        expect(result.error).not.toContain("Failed query");
        expect(result.error).not.toContain("insert into");
        expect(result.error).not.toContain("user-123");
      }
    });

    it("allows user to keep/re-verify their own handle in checkUsernameAvailabilityAction", async () => {
      mockRequireAuth.mockResolvedValueOnce({
        user: { id: "user-owner" },
      });

      // Profile exists and belongs to current user
      mockSelect.mockResolvedValueOnce([
        { id: "prof-1", userId: "user-owner" },
      ]);

      const result = await checkUsernameAvailabilityAction("myhandle");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.available).toBe(true);
      }
    });

    it("reports taken when handle belongs to another user in checkUsernameAvailabilityAction", async () => {
      mockRequireAuth.mockResolvedValueOnce({
        user: { id: "user-different" },
      });

      // Profile exists and belongs to someone else
      mockSelect.mockResolvedValueOnce([
        { id: "prof-2", userId: "user-original-owner" },
      ]);

      const result = await checkUsernameAvailabilityAction("myhandle");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.available).toBe(false);
        expect(result.data.reason).toBe("Username is already taken");
      }
    });
  });
});
