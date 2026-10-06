import { cache } from "react";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { db } from "@/db";
import { profiles } from "@/db/schema/profiles";

/**
 * Resolves current session and user from incoming request headers.
 * Memoized per request using React cache().
 */
export const getCurrentUser = cache(async (requestHeaders?: Headers) => {
  const reqHeaders = requestHeaders ?? (await headers());
  return auth.api.getSession({
    headers: reqHeaders,
  });
});

/**
 * Asserts that the caller is authenticated with an active (non-expired) session.
 * Throws AppError.unauthorized if missing or expired.
 * Memoized per request using React cache().
 */
export const requireAuth = cache(async (requestHeaders?: Headers) => {
  const sessionData = await getCurrentUser(requestHeaders);

  if (!sessionData || !sessionData.session || !sessionData.user) {
    throw AppError.unauthorized("Authentication required");
  }

  const isExpired =
    sessionData.session.expiresAt &&
    new Date(sessionData.session.expiresAt).getTime() <= Date.now();

  if (isExpired) {
    throw AppError.unauthorized("Session expired");
  }

  const user = sessionData.user;
  const session = {
    ...sessionData.session,
    user,
  };

  return {
    user,
    session,
  };
});

/**
 * Resolves profile for a user ID, memoized per request using React cache().
 * Allows layout and pages to share the exact same profile query in 0ms.
 */
export const getCurrentProfile = cache(async (userId: string) => {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);

  return profile ?? null;
});

/**
 * Asserts that the caller has administrative privileges (role === 'admin').
 * Throws AppError.forbidden if role is 'creator'.
 */
export async function requireAdmin(requestHeaders?: Headers) {
  const authData = await requireAuth(requestHeaders);

  if (authData.user.role !== "admin") {
    throw AppError.forbidden("Admin access required");
  }

  return authData;
}

/**
 * Enforces resource ownership for a profile.
 * Verifies profile.userId === session.user.id.
 * Throws AppError.notFound if profile does not exist.
 * Throws AppError.forbidden on ownership mismatch.
 */
export async function requireProfileOwner(profileId: string, requestHeaders?: Headers) {
  const { user, session } = await requireAuth(requestHeaders);

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, profileId))
    .limit(1);

  if (!profile) {
    throw AppError.notFound("Profile not found");
  }

  if (profile.userId !== session.user.id) {
    throw AppError.forbidden("You do not own this profile");
  }

  return { user, profile };
}
