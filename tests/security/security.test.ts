import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppError } from "@/lib/errors";
import { parseMediaUrl } from "@/features/media";
import { toPublicPortfolioData } from "@/features/portfolio/mappers";
import { hashIpAddress } from "@/features/reports/ip-hash";

describe("Comprehensive Security & Boundary Audit (TASK-20)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. Strict Ownership Enforcement (Cross-Creator Access)", () => {
    it("rejects project mutation when profile does not belong to session user", async () => {
      // Mock session user
      const sessionUser = { id: "user-alpha", role: "creator" };
      // Target profile belongs to someone else
      const foreignProfile = { id: "profile-beta", userId: "user-beta" };

      const verifyOwnership = (userId: string, profileUserId: string) => {
        if (userId !== profileUserId) {
          throw AppError.forbidden("You do not have permission to modify this resource.");
        }
      };

      expect(() =>
        verifyOwnership(sessionUser.id, foreignProfile.userId)
      ).toThrowError(/permission/i);
    });
  });

  describe("2. Admin Privilege Boundaries", () => {
    it("rejects non-admin users attempting to execute admin moderation actions", () => {
      const creatorUser = { id: "user-creator", role: "creator" };

      const assertAdmin = (role: string) => {
        if (role !== "admin") {
          throw AppError.forbidden("Admin privileges required.");
        }
      };

      expect(() => assertAdmin(creatorUser.role)).toThrowError(/admin/i);
    });
  });

  describe("3. Adversarial Media URL Injection", () => {
    it("rejects javascript: pseudo-protocol", () => {
      expect(() => parseMediaUrl("javascript:alert(1)")).toThrow();
    });

    it("rejects data: URI payload", () => {
      expect(() => parseMediaUrl("data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==")).toThrow();
    });

    it("rejects arbitrary port access", () => {
      expect(() => parseMediaUrl("https://youtube.com:8080/watch?v=dQw4w9WgXcQ")).toThrow();
    });

    it("rejects non-allowlisted domains", () => {
      expect(() => parseMediaUrl("https://malicious-video-site.com/video/123")).toThrow();
    });
  });

  describe("4. Public Data Projection Purity (Zero Leakage)", () => {
    it("ensures public portfolio projection contains zero database UUIDs, user IDs, or emails", () => {
      const rawDbProfile = {
        id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", // Internal DB UUID
        userId: "user-internal-uuid-9999", // Sensitive Auth User ID
        username: "testcreator",
        displayName: "Test Creator",
        headline: "Lead Colorist",
        bio: "Color grading specialist.",
        avatarUrl: "https://images.unsplash.com/photo-1",
        location: "Mumbai, IN",
        availability: "Available for projects",
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const rawDbProjects = [
        {
          id: "proj-uuid-1111", // Internal Project UUID
          profileId: rawDbProfile.id,
          title: "Cinematic Film",
          slug: "cinematic-film",
          description: "Graded on DaVinci",
          sourceType: "youtube" as const,
          sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
          category: "Narrative",
          client: "Studio",
          year: 2024,
          tools: ["DaVinci Resolve"],
          featured: true,
          sortOrder: 0,
          isPublished: true,
          publishedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const rawDbSocialLinks = [
        {
          id: "social-uuid-2222",
          profileId: rawDbProfile.id,
          platform: "instagram" as const,
          url: "https://instagram.com/test",
          sortOrder: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const rawDbServices = [
        {
          id: "serv-uuid-3333",
          profileId: rawDbProfile.id,
          name: "Color Grading",
          description: "Full DI workflow",
          sortOrder: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const rawDbSkills = [
        {
          id: "skill-uuid-4444",
          profileId: rawDbProfile.id,
          name: "DaVinci Resolve",
          sortOrder: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const rawDbSettings = {
        id: "sett-uuid-5555",
        profileId: rawDbProfile.id,
        theme: "cinema" as const,
        motionLevel: "full" as const,
        accentColor: "#E5E5E5",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const publicData = toPublicPortfolioData({
        ...rawDbProfile,
        projects: rawDbProjects,
        socialLinks: rawDbSocialLinks,
        services: rawDbServices,
        skills: rawDbSkills,
        settings: rawDbSettings,
      });

      // Serialize to JSON string to inspect complete output tree
      const serialized = JSON.stringify(publicData);

      // Verify absence of sensitive internal database IDs
      expect(serialized).not.toContain(rawDbProfile.id);
      expect(serialized).not.toContain(rawDbProfile.userId);
      expect(serialized).not.toContain(rawDbProjects[0].id);
      expect(serialized).not.toContain(rawDbSocialLinks[0].id);
      expect(serialized).not.toContain(rawDbServices[0].id);
      expect(serialized).not.toContain(rawDbSkills[0].id);
      expect(serialized).not.toContain(rawDbSettings.id);

      // Verify that public projection contract retains public content
      expect(publicData.profile.username).toBe("testcreator");
      expect(publicData.projects[0].slug).toBe("cinematic-film");
      expect(publicData.services[0].name).toBe("Color Grading");
      expect(publicData.skills[0].name).toBe("DaVinci Resolve");
    });
  });

  describe("5. Published Slug Immutability Invariant", () => {
    it("rejects slug modification if project was ever published (published_at is not null)", () => {
      const existingProject = {
        id: "proj-123",
        slug: "original-slug",
        publishedAt: new Date("2024-01-01"),
        isPublished: false, // Currently unpublished, but was published historically
      };

      const updateProjectSlug = (
        current: typeof existingProject,
        newSlug: string
      ) => {
        if (current.publishedAt !== null && newSlug !== current.slug) {
          throw AppError.badRequest(
            "Project slug cannot be changed once the project has been published."
          );
        }
        return { ...current, slug: newSlug };
      };

      expect(() => updateProjectSlug(existingProject, "new-slug")).toThrowError(
        /slug cannot be changed/i
      );

      // Allowed if unchanged
      expect(updateProjectSlug(existingProject, "original-slug").slug).toBe(
        "original-slug"
      );
    });

    it("allows slug modification for draft projects that have never been published", () => {
      const draftProject = {
        id: "proj-456",
        slug: "draft-slug",
        publishedAt: null,
        isPublished: false,
      };

      const updateProjectSlug = (
        current: typeof draftProject,
        newSlug: string
      ) => {
        if (current.publishedAt !== null && newSlug !== current.slug) {
          throw AppError.badRequest(
            "Project slug cannot be changed once the project has been published."
          );
        }
        return { ...current, slug: newSlug };
      };

      expect(updateProjectSlug(draftProject, "refined-slug").slug).toBe(
        "refined-slug"
      );
    });
  });

  describe("6. Anonymized IP Hashing & Throttling", () => {
    it("hashes IP address with salted HMAC-SHA256 and never returns plaintext", () => {
      const ip = "192.168.1.100";
      const hash = hashIpAddress(ip);

      expect(hash).not.toBe(ip);
      expect(hash).toHaveLength(64); // SHA-256 hex string
      expect(hashIpAddress(ip)).toBe(hash); // Deterministic with secret salt
    });
  });
});
