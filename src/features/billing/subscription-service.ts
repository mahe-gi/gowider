import { eq } from "drizzle-orm";
import { db } from "@/db";
import { subscriptions, type Subscription } from "@/db/schema/subscriptions";
import { RAZORPAY_PLANS } from "@/lib/razorpay";

/**
 * Retrieves the current subscription record for a profile
 */
export async function getProfileSubscription(
  profileId: string
): Promise<Subscription | null> {
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.profileId, profileId))
    .limit(1);

  return sub || null;
}

/**
 * Checks whether a profile has an active Pro subscription
 */
export async function isProProfile(profileId: string): Promise<boolean> {
  const sub = await getProfileSubscription(profileId);
  if (!sub) return false;

  const isActive = sub.status === "active" || sub.status === "authenticated";
  const isPro = sub.plan === "pro";

  // If subscription has a period end, verify it hasn't expired
  if (sub.currentPeriodEnd) {
    const isExpired = new Date(sub.currentPeriodEnd).getTime() < Date.now();
    if (isExpired && sub.status !== "active") return false;
  }

  return isPro && isActive;
}

/**
 * Evaluates whether a profile can publish another project based on their plan limit
 */
export async function canPublishMoreProjects(
  profileId: string,
  currentPublishedCount: number
): Promise<{ allowed: boolean; maxAllowed: number; isPro: boolean; message?: string }> {
  const isPro = await isProProfile(profileId);

  if (isPro) {
    return {
      allowed: true,
      maxAllowed: Infinity,
      isPro: true,
    };
  }

  const maxAllowed = RAZORPAY_PLANS.FREE.maxProjects;
  if (currentPublishedCount >= maxAllowed) {
    return {
      allowed: false,
      maxAllowed,
      isPro: false,
      message: `Free plan is limited to ${maxAllowed} published projects. Upgrade to GoWider Pro for unlimited projects.`,
    };
  }

  return {
    allowed: true,
    maxAllowed,
    isPro: false,
  };
}

/**
 * Evaluates whether a profile is allowed to hide GoWider branding
 */
export async function canHideBranding(
  profileId: string
): Promise<{ allowed: boolean; isPro: boolean }> {
  const isPro = await isProProfile(profileId);
  return {
    allowed: isPro,
    isPro,
  };
}

/**
 * Upserts a subscription to active Pro tier upon successful checkout or webhook activation
 */
export async function activateProSubscription(
  profileId: string,
  details: {
    razorpayCustomerId?: string;
    razorpaySubscriptionId?: string;
    razorpayPlanId?: string;
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
  }
): Promise<Subscription> {
  const existing = await getProfileSubscription(profileId);

  if (existing) {
    const [updated] = await db
      .update(subscriptions)
      .set({
        plan: "pro",
        status: "active",
        razorpayCustomerId: details.razorpayCustomerId ?? existing.razorpayCustomerId,
        razorpaySubscriptionId:
          details.razorpaySubscriptionId ?? existing.razorpaySubscriptionId,
        razorpayPlanId: details.razorpayPlanId ?? existing.razorpayPlanId,
        currentPeriodStart: details.currentPeriodStart ?? existing.currentPeriodStart,
        currentPeriodEnd: details.currentPeriodEnd ?? existing.currentPeriodEnd,
        cancelAtPeriodEnd: false,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.profileId, profileId))
      .returning();

    return updated;
  }

  const [created] = await db
    .insert(subscriptions)
    .values({
      profileId,
      plan: "pro",
      status: "active",
      razorpayCustomerId: details.razorpayCustomerId,
      razorpaySubscriptionId: details.razorpaySubscriptionId,
      razorpayPlanId: details.razorpayPlanId,
      currentPeriodStart: details.currentPeriodStart,
      currentPeriodEnd: details.currentPeriodEnd,
      cancelAtPeriodEnd: false,
    })
    .returning();

  return created;
}

/**
 * Marks subscription as canceled
 */
export async function cancelProSubscription(
  profileId: string
): Promise<Subscription | null> {
  const existing = await getProfileSubscription(profileId);
  if (!existing) return null;

  const [updated] = await db
    .update(subscriptions)
    .set({
      plan: "free",
      status: "canceled",
      cancelAtPeriodEnd: true,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.profileId, profileId))
    .returning();

  return updated;
}
