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
    const eventId = req.headers.get("x-razorpay-event-id") || `evt_${nanoid(16)}`;
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

    // 2. Check Deduplication
    const [existingEvent] = await db
      .select()
      .from(paymentWebhookEvents)
      .where(and(eq(paymentWebhookEvents.provider, "razorpay"), eq(paymentWebhookEvents.providerEventId, eventId)))
      .limit(1);

    if (existingEvent) {
      return NextResponse.json({ received: true, alreadyProcessed: true });
    }

    // 3. Record event in PostgreSQL
    await db.insert(paymentWebhookEvents).values({
      id: `wevt_${nanoid(16)}`,
      provider: "razorpay",
      providerEventId: eventId,
      eventType,
      createdAt: new Date(),
    });

    // 4. If payment is captured or order paid, emit Inngest event
    if (eventType === "order.paid" || eventType === "payment.captured") {
      const paymentEntity = payload.payload?.payment?.entity || {};
      const orderEntity = payload.payload?.order?.entity || {};

      const providerOrderId = paymentEntity.order_id || orderEntity.id;
      const providerPaymentId = paymentEntity.id;
      const amountPaise = Number(paymentEntity.amount || orderEntity.amount || 0);

      if (providerOrderId && providerPaymentId) {
        await inngest.send({
          name: "payment.webhook.received",
          data: {
            providerOrderId,
            providerPaymentId,
            amountPaise,
          },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json({ error: error.message || "Webhook processing failed" }, { status: 500 });
  }
}
