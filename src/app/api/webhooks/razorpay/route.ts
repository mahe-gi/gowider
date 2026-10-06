import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { subscriptions } from "@/db/schema/subscriptions";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-razorpay-signature");
    if (!signature) {
      return NextResponse.json(
        { error: "Missing x-razorpay-signature header" },
        { status: 400 }
      );
    }

    const rawBody = await req.text();
    const isValid = verifyRazorpayWebhookSignature(rawBody, signature);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const entity = payload.payload?.subscription?.entity || payload.payload?.payment?.entity;

    if (!entity) {
      return NextResponse.json({ received: true });
    }

    const razorpaySubscriptionId = entity.id || entity.subscription_id;
    const razorpayCustomerId = entity.customer_id;
    const razorpayPlanId = entity.plan_id;

    if (!razorpaySubscriptionId) {
      return NextResponse.json({ received: true });
    }

    // Lookup existing subscription by subscription ID
    const [existingSub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.razorpaySubscriptionId, razorpaySubscriptionId))
      .limit(1);

    switch (event) {
      case "subscription.activated":
      case "subscription.charged": {
        const periodStart = entity.current_start
          ? new Date(entity.current_start * 1000)
          : new Date();
        const periodEnd = entity.current_end
          ? new Date(entity.current_end * 1000)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        if (existingSub) {
          await db
            .update(subscriptions)
            .set({
              plan: "pro",
              status: "active",
              razorpayCustomerId: razorpayCustomerId || existingSub.razorpayCustomerId,
              razorpayPlanId: razorpayPlanId || existingSub.razorpayPlanId,
              currentPeriodStart: periodStart,
              currentPeriodEnd: periodEnd,
              cancelAtPeriodEnd: false,
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.id, existingSub.id));
        }
        break;
      }

      case "subscription.cancelled": {
        if (existingSub) {
          await db
            .update(subscriptions)
            .set({
              status: "canceled",
              cancelAtPeriodEnd: true,
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.id, existingSub.id));
        }
        break;
      }

      case "subscription.pending":
      case "subscription.halted": {
        if (existingSub) {
          await db
            .update(subscriptions)
            .set({
              status: "past_due",
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.id, existingSub.id));
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing Razorpay webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing error" },
      { status: 500 }
    );
  }
}
