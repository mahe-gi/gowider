import { describe, it, expect, vi } from "vitest";
import { assertProjectAccess } from "@/lib/auth/ownership";

// Mock DB
vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            {
              id: "proj_alice_123",
              userId: "usr_alice",
              displayName: "Alice Reel",
              status: "ready",
              sourceR2Key: "sources/usr_alice/proj_alice_123/video.mp4",
            },
          ]),
        }),
      }),
    }),
  },
}));

describe("Strict User Isolation & IDOR Protection", () => {
  it("grants access when project belongs to authenticated user", async () => {
    const result = await assertProjectAccess("proj_alice_123", "usr_alice");
    expect(result.hasAccess).toBe(true);
    expect(result.isOwner).toBe(true);
    expect(result.project?.id).toBe("proj_alice_123");
  });

  it("denies access when another authenticated user attempts to access project", async () => {
    const result = await assertProjectAccess("proj_alice_123", "usr_bob_attacker");
    expect(result.hasAccess).toBe(false);
    expect(result.isOwner).toBe(false);
  });

  it("denies access when unauthenticated (null userId)", async () => {
    const result = await assertProjectAccess("proj_alice_123", null);
    expect(result.hasAccess).toBe(false);
    expect(result.isOwner).toBe(false);
  });

  it("denies access when unauthenticated (undefined userId)", async () => {
    const result = await assertProjectAccess("proj_alice_123", undefined);
    expect(result.hasAccess).toBe(false);
    expect(result.isOwner).toBe(false);
  });
});
