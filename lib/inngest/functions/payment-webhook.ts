import { inngest } from "../client";
import { finalizeCapturedPayment } from "@/lib/payments/finalize-payment";

export const paymentWebhookWorkflow = inngest.createFunction(
  { id: "gowider-payment-webhook" },
  { event: "payment.webhook.received" },
  async ({ event, step }) => {
    const { providerOrderId, providerPaymentId, amountPaise } = event.data;

    const result = await step.run("finalize-payment", async () => {
      return finalizeCapturedPayment({
        providerOrderId,
        providerPaymentId,
        amountPaise,
      });
    });

    return result;
  }
);
