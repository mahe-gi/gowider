import "server-only";
import crypto from "crypto";
import { cookies } from "next/headers";
import { eq, and, gt, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { guestSessions, type GuestSession } from "@/db/schema";
import { GUEST_COOKIE_NAME, GUEST_SESSION_EXPIRY_DAYS } from "@/lib/constants";

export function generateGuestToken(): { rawToken: string; tokenHash: string } {
  const rawToken = `gst_raw_${crypto.randomBytes(32).toString("hex")}`;
  const tokenHash = hashGuestToken(rawToken);
  return { rawToken, tokenHash };
}

export function hashGuestToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export async function getOrCreateGuestSession(): Promise<{
  sessionId: string;
  rawToken: string;
  isNew: boolean;
}> {
  const cookieStore = await cookies();
  const existingCookie = cookieStore.get(GUEST_COOKIE_NAME)?.value;

  if (existingCookie) {
    const tokenHash = hashGuestToken(existingCookie);
    const now = new Date();

    const [session] = await db
      .select()
      .from(guestSessions)
      .where(and(eq(guestSessions.tokenHash, tokenHash), gt(guestSessions.expiresAt, now), isNull(guestSessions.claimedByUserId)))
      .limit(1);

    if (session) {
      await db
        .update(guestSessions)
        .set({ updatedAt: new Date() })
        .where(eq(guestSessions.id, session.id));

      return {
        sessionId: session.id,
        rawToken: existingCookie,
        isNew: false,
      };
    }
  }

  // Create new guest session
  const { rawToken, tokenHash } = generateGuestToken();
  const sessionId = `gst_${nanoid(16)}`;
  const expiresAt = new Date(Date.now() + GUEST_SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await db.insert(guestSessions).values({
    id: sessionId,
    tokenHash,
    expiresAt,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  cookieStore.set(GUEST_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return {
    sessionId,
    rawToken,
    isNew: true,
  };
}

export async function getCurrentGuestSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  const existingCookie = cookieStore.get(GUEST_COOKIE_NAME)?.value;
  if (!existingCookie) return null;

  const tokenHash = hashGuestToken(existingCookie);
  const now = new Date();

  const [session] = await db
    .select()
    .from(guestSessions)
    .where(and(eq(guestSessions.tokenHash, tokenHash), gt(guestSessions.expiresAt, now), isNull(guestSessions.claimedByUserId)))
    .limit(1);

  return session ? session.id : null;
}
