import { describe, it, expect } from "vitest";

describe("Project Ownership & Access Policy Invariants", () => {
  interface MockProject {
    id: string;
    userId: string | null;
    guestSessionId: string | null;
  }

  function checkAccess(
    project: MockProject,
    currentUserId: string | undefined,
    currentGuestSessionId: string | undefined
  ): { hasAccess: boolean; isOwner: boolean } {
    // If project is claimed by an authenticated user
    if (project.userId) {
      if (currentUserId && project.userId === currentUserId) {
        return { hasAccess: true, isOwner: true };
      }
      // Old guest tokens or different users cannot access claimed project
      return { hasAccess: false, isOwner: false };
    }

    // If project belongs to a guest session
    if (project.guestSessionId) {
      if (currentGuestSessionId && project.guestSessionId === currentGuestSessionId) {
        return { hasAccess: true, isOwner: true };
      }
      return { hasAccess: false, isOwner: false };
    }

    return { hasAccess: false, isOwner: false };
  }

  it("permits guest access when guest session matches", () => {
    const project: MockProject = { id: "proj_1", userId: null, guestSessionId: "gst_123" };
    const access = checkAccess(project, undefined, "gst_123");
    expect(access.hasAccess).toBe(true);
  });

  it("denies access when guest session does not match", () => {
    const project: MockProject = { id: "proj_1", userId: null, guestSessionId: "gst_123" };
    const access = checkAccess(project, undefined, "gst_456");
    expect(access.hasAccess).toBe(false);
  });

  it("permits user access when user ID matches", () => {
    const project: MockProject = { id: "proj_2", userId: "usr_abc", guestSessionId: "gst_123" };
    const access = checkAccess(project, "usr_abc", undefined);
    expect(access.hasAccess).toBe(true);
  });

  it("denies access from old guest token once project is claimed by user", () => {
    const project: MockProject = { id: "proj_2", userId: "usr_abc", guestSessionId: "gst_123" };
    // Old guest tries to access claimed project without being logged in as usr_abc
    const access = checkAccess(project, undefined, "gst_123");
    expect(access.hasAccess).toBe(false);
  });
});
