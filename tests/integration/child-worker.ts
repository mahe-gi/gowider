import "@/workers/shims/server-only";
import { config } from "dotenv";
config({ path: ".env.local" });

import { createOrGetPaymentOrder } from "@/lib/payments/order-service";

process.on("message", async (msg: any) => {
  try {
    const result = await createOrGetPaymentOrder({
      userId: msg.userId,
      paymentIntentId: msg.paymentIntentId,
      amountPaise: msg.amountPaise,
    });
    if (process.send) {
      process.send({ success: true, result });
    }
  } catch (err: any) {
    if (process.send) {
      process.send({ success: false, error: err.message });
    }
  }
});
