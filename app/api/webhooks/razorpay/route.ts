import { NextResponse } from "next/server";
import crypto from "crypto";
import { nanoid } from "nanoid";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { paymentWebhookEvents } from "@/db/schema";
import { env } from "@/lib/env";
import { inngest } from "@/lib/inngest/client";

export async function POST(req: Request) {
  try {
    const signature = req.headers.get("x-razorpay-signature");
    const secret = env.RAZORPAY_WEBHOOK_SECRET || env.RAZORPAY_KEY_SECRET;

    if (!signature || !secret) {
      return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
    }

    const rawBody = await req.text();

    // 1. Verify HMAC SHA-256 Signature
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.warn("⚠️ Invalid Razorpay webhook signature.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event;
    const paymentEntity = payload.payload?.payment?.entity || {};
    const orderEntity = payload.payload?.order?.entity || {};

    // 2. Deterministic Event ID (Header or Payload-Derived)
    const providerPaymentId = paymentEntity.id;
    const providerOrderId = paymentEntity.order_id || orderEntity.id;
    const rawHeaderEventId = req.headers.get("x-razorpay-event-id");

    const deterministicEventId =
      rawHeaderEventId ||
      (providerPaymentId ? `${eventType}_${providerPaymentId}` : `${eventType}_${providerOrderId}_${payload.created_at || Date.now()}`);

    // 3. Webhook Deduplication & State Check
    const [existingEvent] = await db
      .select()
      .from(paymentWebhookEvents)
      .where(
        and(
          eq(paymentWebhookEvents.provider, "razorpay"),
          eq(paymentWebhookEvents.providerEventId, deterministicEventId)
        )
      )
      .limit(1);

    if (existingEvent) {
      if (existingEvent.status === "processed") {
        return NextResponse.json({ received: true, alreadyProcessed: true });
      }
      // If previously received or failed, we re-attempt Inngest dispatch
    } else {
      // Record new event receipt
      await db.insert(paymentWebhookEvents).values({
        id: `wevt_${nanoid(16)}`,
        provider: "razorpay",
        providerEventId: deterministicEventId,
        eventType,
        status: "received",
        payload,
        createdAt: new Date(),
      });
    }

    // 4. Dispatch Durable Inngest Work for Payment Capture
    if (eventType === "order.paid" || eventType === "payment.captured") {
      const amountPaise = Number(paymentEntity.amount || orderEntity.amount || 0);

      if (providerOrderId && providerPaymentId) {
        try {
          await inngest.send({
            name: "payment.webhook.received",
            data: {
              providerOrderId,
              providerPaymentId,
              amountPaise,
              webhookEventId: deterministicEventId,
            },
          });

          await db
            .update(paymentWebhookEvents)
            .set({
              status: "dispatched",
              dispatchAttempts: (existingEvent?.dispatchAttempts || 0) + 1,
            })
            .where(
              and(
                eq(paymentWebhookEvents.provider, "razorpay"),
                eq(paymentWebhookEvents.providerEventId, deterministicEventId)
              )
            );
        } catch (dispatchErr: any) {
          console.error("❌ Failed to dispatch Inngest payment webhook event:", dispatchErr);
          await db
            .update(paymentWebhookEvents)
            .set({
              status: "dispatch_pending",
              lastError: dispatchErr.message,
              dispatchAttempts: (existingEvent?.dispatchAttempts || 0) + 1,
            })
            .where(
              and(
                eq(paymentWebhookEvents.provider, "razorpay"),
                eq(paymentWebhookEvents.providerEventId, deterministicEventId)
              )
            );
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json({ error: error.message || "Webhook processing failed" }, { status: 500 });
  }
}
