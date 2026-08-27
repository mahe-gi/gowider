import "./shims/server-only";
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { createGenerationWorker } from "./generation-worker";
import { createPaymentWorker } from "./payment-worker";
import { createMaintenanceWorker } from "./maintenance-worker";
import { setupMaintenanceSchedule } from "@/lib/queue/dispatch";
import { getRedisConnection } from "@/lib/queue/connection";

async function main() {
  console.log("🚀 Starting GoWider Background Worker Service...");

  const genWorker = createGenerationWorker();
  const payWorker = createPaymentWorker();
  const maintWorker = createMaintenanceWorker();

  await setupMaintenanceSchedule();
  console.log("✅ All GoWider workers active (generation, payments, maintenance).");

  let isShuttingDown = false;

  async function shutdown(signal: string) {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log(`\n🛑 [Shutdown] Received ${signal}. Closing workers gracefully...`);

    try {
      await Promise.all([
        genWorker.close(),
        payWorker.close(),
        maintWorker.close(),
      ]);

      const redis = getRedisConnection();
      await redis.quit();

      console.log("👋 GoWider workers closed cleanly.");
      process.exit(0);
    } catch (err: any) {
      console.error("❌ Error during worker shutdown:", err.message);
      process.exit(1);
    }
  }

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
  console.error("💥 Fatal error starting GoWider worker:", err);
  process.exit(1);
});
