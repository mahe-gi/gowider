"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema/profiles";
import { requireAuth, requireProfileOwner } from "@/lib/auth-guards";
import { AppError } from "@/lib/errors";
import { actionSuccess, actionError, type ActionResponse } from "@/lib/types";
import {
  getRazorpayClient,
  verifyRazorpayPaymentSignature,
  RAZORPAY_PLANS,
} from "@/lib/razorpay";
import {
  activateProSubscription,
  cancelProSubscription,
  getProfileSubscription,
} from "../subscription-service";
import { env } from "@/env";

/**
 * Creates a Razorpay checkout subscription/order session for Pro upgrade
 */
export async function createCheckoutSubscriptionAction(
  profileId: string,
  planInterval: "monthly" | "yearly" = "monthly"
): Promise<
  ActionResponse<{
    subscriptionId?: string;
    orderId?: string;
    keyId: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
  }>
> {
  try {
    const { session } = await requireAuth();
    await requireProfileOwner(profileId);

    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, profileId))
      .limit(1);

    if (!profile) {
      throw AppError.notFound("Profile not found");
    }

    const plan =
      planInterval === "yearly"
        ? RAZORPAY_PLANS.PRO_ANNUAL
        : RAZORPAY_PLANS.PRO_MONTHLY;

    const razorpay = getRazorpayClient();

    // If Razorpay keys are placeholder/mock, return mock session for development/testing
    if (
      env.RAZORPAY_KEY_ID === "rzp_test_placeholder_key_id" ||
      !env.RAZORPAY_KEY_SECRET ||
      env.RAZORPAY_KEY_SECRET === "placeholder_secret"
    ) {
      const mockSubId = `sub_mock_${Date.now()}`;
      return actionSuccess({
        subscriptionId: mockSubId,
        keyId: env.RAZORPAY_KEY_ID,
        amount: plan.priceInPaise,
        currency: "INR",
        name: "GoWider",
        description: `Upgrade to ${plan.name}`,
      });
    }

    // Create Razorpay Order / Subscription
    try {
      const order = await razorpay.orders.create({
        amount: plan.priceInPaise,
        currency: "INR",
        receipt: `rcpt_${profile.id.slice(0, 8)}_${Date.now()}`,
        notes: {
          profileId: profile.id,
          userId: session.user.id,
          plan: "pro",
        },
      });

      return actionSuccess({
        orderId: order.id,
        keyId: env.RAZORPAY_KEY_ID,
        amount: Number(order.amount),
        currency: order.currency,
        name: "GoWider",
        description: `Upgrade to ${plan.name}`,
      });
    } catch (razorpayErr: unknown) {
      console.error("Razorpay order creation error:", razorpayErr);
      throw AppError.badRequest("Could not initiate Razorpay checkout. Please check payment keys.");
    }
  } catch (error) {
    return actionError(error);
  }
}

/**
 * Verifies Razorpay payment signature and activates Pro subscription
 */
export async function verifyPaymentAndActivateAction(params: {
  profileId: string;
  razorpayPaymentId: string;
  razorpaySubscriptionId?: string;
  razorpayOrderId?: string;
  razorpaySignature: string;
  interval?: "monthly" | "yearly";
}): Promise<ActionResponse<{ activated: boolean; plan: string }>> {
  try {
    await requireAuth();
    await requireProfileOwner(params.profileId);

    // If using mock credentials in development/testing, allow mock activation
    const isMock =
      env.RAZORPAY_KEY_ID === "rzp_test_placeholder_key_id" ||
      env.RAZORPAY_KEY_SECRET === "placeholder_secret";

    if (!isMock) {
      const isValid = verifyRazorpayPaymentSignature({
        razorpayPaymentId: params.razorpayPaymentId,
        razorpaySubscriptionId: params.razorpaySubscriptionId,
        razorpayOrderId: params.razorpayOrderId,
        razorpaySignature: params.razorpaySignature,
      });

      if (!isValid) {
        throw AppError.forbidden("Invalid payment signature verification");
      }
    }

    const interval = params.interval || "monthly";
    const durationDays = interval === "yearly" ? 365 : 30;
    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

    await activateProSubscription(params.profileId, {
      razorpaySubscriptionId: params.razorpaySubscriptionId || params.razorpayOrderId,
      currentPeriodStart,
      currentPeriodEnd,
    });

    revalidatePath("/dashboard/billing");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/design");
    revalidatePath("/dashboard/work");

    return actionSuccess({
      activated: true,
      plan: "pro",
    });
  } catch (error) {
    return actionError(error);
  }
}

/**
 * Cancels active subscription
 */
export async function cancelSubscriptionAction(
  profileId: string
): Promise<ActionResponse<{ canceled: boolean }>> {
  try {
    await requireAuth();
    await requireProfileOwner(profileId);

    const sub = await getProfileSubscription(profileId);
    if (!sub || sub.plan !== "pro") {
      throw AppError.badRequest("No active Pro subscription found to cancel");
    }

    await cancelProSubscription(profileId);

    revalidatePath("/dashboard/billing");
    revalidatePath("/dashboard");

    return actionSuccess({ canceled: true });
  } catch (error) {
    return actionError(error);
  }
}
