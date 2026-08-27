import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { generationWorkflow } from "@/lib/inngest/functions/generation";
import { paymentWebhookWorkflow } from "@/lib/inngest/functions/payment-webhook";
import { mediaCleanupWorkflow } from "@/lib/inngest/functions/cleanup";
import { reconciliationWorkflow } from "@/lib/inngest/functions/reconciliation";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    generationWorkflow,
    paymentWebhookWorkflow,
    mediaCleanupWorkflow,
    reconciliationWorkflow,
  ],
});
