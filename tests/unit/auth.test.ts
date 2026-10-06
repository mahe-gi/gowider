import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppError } from "@/lib/errors";
import { assertSameOrigin } from "@/lib/csrf";
import { env } from "@/env";

// Setup mocks
const mockGetSession = vi.fn();
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));

const mockDbSelect = vi.fn();
const mockDbUpdate = vi.fn();

vi.mock("@/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: (...args: unknown[]) => mockDbSelect(...args),
        }),
      }),
    }),
    update: () => ({
      set: () => ({
        where: () => ({
          returning: (...args: unknown[]) => mockDbUpdate(...args),
        }),
      }),
    }),
  },
}));

// Import guards after mocking
import {
  getCurrentUser,
  requireAuth,
  requireAdmin,
  requireProfileOwner,
} from "@/lib/auth-guards";
import { promoteUserToAdmin } from "@/scripts/seed-admin";

describe("Auth Guards & Security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCurrentUser()", () => {
    it("returns null when no active session exists", async () => {
      mockGetSession.mockResolvedValueOnce(null);

      const result = await getCurrentUser();
      expect(result).toBeNull();
      expect(mockGetSession).toHaveBeenCalled();
    });

    it("returns session and user when session is valid", async () => {
      const mockData = {
        user: { id: "user-1", email: "user@example.com", role: "creator" },
        session: { id: "sess-1", userId: "user-1", expiresAt: new Date(Date.now() + 3600000) },
      };
      mockGetSession.mockResolvedValueOnce(mockData);

      const result = await getCurrentUser();
      expect(result).toEqual(mockData);
    });
  });

  describe("requireAuth()", () => {
    it("throws AppError.unauthorized if session is missing", async () => {
      mockGetSession.mockResolvedValueOnce(null);

      await expect(requireAuth()).rejects.toThrow(AppError);
      mockGetSession.mockResolvedValueOnce(null);
      await expect(requireAuth()).rejects.toMatchObject({
        code: "UNAUTHORIZED",
        statusCode: 401,
      });
    });

    it("throws AppError.unauthorized if session is expired", async () => {
      const expiredData = {
        user: { id: "user-1", email: "user@example.com", role: "creator" },
        session: {
          id: "sess-1",
          userId: "user-1",
          expiresAt: new Date(Date.now() - 10000), // in the past
        },
      };
      mockGetSession.mockResolvedValueOnce(expiredData);

      await expect(requireAuth()).rejects.toMatchObject({
        code: "UNAUTHORIZED",
        statusCode: 401,
      });
    });

    it("returns user and session when active session is present", async () => {
      const activeData = {
        user: { id: "user-1", email: "user@example.com", role: "creator" },
        session: {
          id: "sess-1",
          userId: "user-1",
          expiresAt: new Date(Date.now() + 3600000),
        },
      };
      mockGetSession.mockResolvedValueOnce(activeData);

      const result = await requireAuth();
      expect(result.user.id).toBe("user-1");
      expect(result.session.id).toBe("sess-1");
      expect(result.session.user.id).toBe("user-1");
    });
  });

  describe("requireAdmin()", () => {
    it("throws AppError.unauthorized if user is not authenticated", async () => {
      mockGetSession.mockResolvedValueOnce(null);

      await expect(requireAdmin()).rejects.toMatchObject({
        code: "UNAUTHORIZED",
        statusCode: 401,
      });
    });

    it("throws AppError.forbidden if user role is 'creator'", async () => {
      const creatorData = {
        user: { id: "user-1", email: "creator@example.com", role: "creator" },
        session: {
          id: "sess-1",
          userId: "user-1",
          expiresAt: new Date(Date.now() + 3600000),
        },
      };
      mockGetSession.mockResolvedValueOnce(creatorData);

      await expect(requireAdmin()).rejects.toMatchObject({
        code: "FORBIDDEN",
        statusCode: 403,
      });
    });

    it("returns auth data if user role is 'admin'", async () => {
      const adminData = {
        user: { id: "admin-1", email: "admin@example.com", role: "admin" },
        session: {
          id: "sess-2",
          userId: "admin-1",
          expiresAt: new Date(Date.now() + 3600000),
        },
      };
      mockGetSession.mockResolvedValueOnce(adminData);

      const result = await requireAdmin();
      expect(result.user.role).toBe("admin");
      expect(result.user.id).toBe("admin-1");
    });
  });

  describe("requireProfileOwner()", () => {
    it("throws AppError.unauthorized when unauthenticated", async () => {
      mockGetSession.mockResolvedValueOnce(null);

      await expect(requireProfileOwner("profile-1")).rejects.toMatchObject({
        code: "UNAUTHORIZED",
        statusCode: 401,
      });
    });

    it("throws AppError.notFound when profile does not exist", async () => {
      const sessionData = {
        user: { id: "user-1", email: "owner@example.com", role: "creator" },
        session: {
          id: "sess-1",
          userId: "user-1",
          expiresAt: new Date(Date.now() + 3600000),
        },
      };
      mockGetSession.mockResolvedValueOnce(sessionData);
      mockDbSelect.mockResolvedValueOnce([]); // no profile found

      await expect(requireProfileOwner("non-existent-profile")).rejects.toMatchObject({
        code: "NOT_FOUND",
        statusCode: 404,
      });
    });

    it("throws AppError.forbidden on ownership mismatch (profile.userId !== session.user.id)", async () => {
      const sessionData = {
        user: { id: "user-1", email: "user1@example.com", role: "creator" },
        session: {
          id: "sess-1",
          userId: "user-1",
          expiresAt: new Date(Date.now() + 3600000),
        },
      };
      mockGetSession.mockResolvedValueOnce(sessionData);
      mockDbSelect.mockResolvedValueOnce([
        {
          id: "profile-2",
          userId: "user-2", // Different user!
          username: "othercreator",
        },
      ]);

      await expect(requireProfileOwner("profile-2")).rejects.toMatchObject({
        code: "FORBIDDEN",
        statusCode: 403,
      });
    });

    it("returns user and profile when profile.userId === session.user.id", async () => {
      const sessionData = {
        user: { id: "user-1", email: "user1@example.com", role: "creator" },
        session: {
          id: "sess-1",
          userId: "user-1",
          expiresAt: new Date(Date.now() + 3600000),
        },
      };
      const mockProfile = {
        id: "profile-1",
        userId: "user-1",
        username: "myportfolio",
      };
      mockGetSession.mockResolvedValueOnce(sessionData);
      mockDbSelect.mockResolvedValueOnce([mockProfile]);

      const result = await requireProfileOwner("profile-1");
      expect(result.user.id).toBe("user-1");
      expect(result.profile.id).toBe("profile-1");
      expect(result.profile.userId).toBe(result.user.id);
    });
  });

  describe("CSRF Protection: assertSameOrigin()", () => {
    const validOrigin = new URL(env.NEXT_PUBLIC_APP_URL).origin;

    it("throws AppError.forbidden when Sec-Fetch-Site is 'cross-site'", () => {
      const request = new Request("http://localhost:3000/api/projects", {
        headers: {
          "sec-fetch-site": "cross-site",
          origin: validOrigin,
        },
      });

      expect(() => assertSameOrigin(request)).toThrow(AppError);
      expect(() => assertSameOrigin(request)).toThrowError(/Cross-site request blocked/);
    });

    it("throws AppError.forbidden when Origin does not match NEXT_PUBLIC_APP_URL", () => {
      const request = new Request("http://localhost:3000/api/projects", {
        headers: {
          origin: "https://malicious-site.com",
        },
      });

      expect(() => assertSameOrigin(request)).toThrow(AppError);
      expect(() => assertSameOrigin(request)).toThrowError(/Origin mismatch/);
    });

    it("throws AppError.forbidden when Referer origin does not match and Origin is missing", () => {
      const request = new Request("http://localhost:3000/api/projects", {
        headers: {
          referer: "https://malicious-site.com/attack",
        },
      });

      expect(() => assertSameOrigin(request)).toThrow(AppError);
      expect(() => assertSameOrigin(request)).toThrowError(/Referer origin mismatch/);
    });

    it("passes when Origin matches expected origin and Sec-Fetch-Site is 'same-origin'", () => {
      const request = new Request("http://localhost:3000/api/projects", {
        headers: {
          origin: validOrigin,
          "sec-fetch-site": "same-origin",
        },
      });

      expect(() => assertSameOrigin(request)).not.toThrow();
    });

    it("passes when Origin matches and Sec-Fetch-Site is 'same-site'", () => {
      const request = new Request("http://localhost:3000/api/projects", {
        headers: {
          origin: validOrigin,
          "sec-fetch-site": "same-site",
        },
      });

      expect(() => assertSameOrigin(request)).not.toThrow();
    });

    it("passes when Sec-Fetch-Site is 'same-origin' and Origin is omitted", () => {
      const request = new Request("http://localhost:3000/api/projects", {
        headers: {
          "sec-fetch-site": "same-origin",
        },
      });

      expect(() => assertSameOrigin(request)).not.toThrow();
    });
  });

  describe("Admin Promotion CLI: promoteUserToAdmin()", () => {
    it("throws an error when email is empty", async () => {
      await expect(promoteUserToAdmin("   ")).rejects.toThrow(/cannot be empty/);
    });

    it("throws an error when target user is not found in database", async () => {
      mockDbSelect.mockResolvedValueOnce([]); // no user returned

      await expect(promoteUserToAdmin("nonexistent@example.com")).rejects.toThrow(
        /was not found in the database/
      );
    });

    it("promotes registered user to admin role", async () => {
      const existing = {
        id: "user-123",
        email: "user@example.com",
        role: "creator",
      };
      mockDbSelect.mockResolvedValueOnce([existing]);
      mockDbUpdate.mockResolvedValueOnce([{ ...existing, role: "admin" }]);

      const result = await promoteUserToAdmin("user@example.com");
      expect(result.role).toBe("admin");
      expect(result.id).toBe("user-123");
    });
  });
});
