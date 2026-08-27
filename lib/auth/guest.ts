import "server-only";
import crypto from "crypto";
import { cookies } from "next/headers";
import { eq, gt } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { guestSessions } from "@/db/schema";
import { GUEST_COOKIE_NAME, GUEST_SESSION_MAX_AGE } from "@/lib/constants";

export function generateGuestToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashGuestToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function getOrCreateGuestSession(): Promise<{ sessionId: string; token: string; isNew: boolean }> {
  const cookieStore = await cookies();
  const existingToken = cookieStore.get(GUEST_COOKIE_NAME)?.value;

  if (existingToken) {
    const tokenHash = hashGuestToken(existingToken);
    const now = new Date();

    const [existingSession] = await db
      .select()
      .from(guestSessions)
      .where(eq(guestSessions.tokenHash, tokenHash))
      .limit(1);

    if (existingSession && existingSession.expiresAt > now) {
      // Update last seen
      await db
        .update(guestSessions)
        .set({ lastSeenAt: now })
        .where(eq(guestSessions.id, existingSession.id));

      return { sessionId: existingSession.id, token: existingToken, isNew: false };
    }
  }

  // Create fresh guest session
  const newToken = generateGuestToken();
  const tokenHash = hashGuestToken(newToken);
  const sessionId = `guest_${nanoid(16)}`;
  const expiresAt = new Date(Date.now() + GUEST_SESSION_MAX_AGE * 1000);

  await db.insert(guestSessions).values({
    id: sessionId,
    tokenHash,
    expiresAt,
    createdAt: new Date(),
    lastSeenAt: new Date(),
  });

  cookieStore.set(GUEST_COOKIE_NAME, newToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: GUEST_SESSION_MAX_AGE,
  });

  return { sessionId, token: newToken, isNew: true };
}

export async function getCurrentGuestSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(GUEST_COOKIE_NAME)?.value;
  if (!token) return null;

  const tokenHash = hashGuestToken(token);
  const now = new Date();

  const [session] = await db
    .select()
    .from(guestSessions)
    .where(eq(guestSessions.tokenHash, tokenHash))
    .limit(1);

  if (!session || session.expiresAt <= now) {
    return null;
  }

  return session.id;
}
