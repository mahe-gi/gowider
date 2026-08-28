import "@/workers/shims/server-only";
import { config } from "dotenv";
config({ path: ".env.local" });

import { fork } from "child_process";
import path from "path";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { users, wallets, paymentOrders } from "@/db/schema";
import { eq, and } from "drizzle-orm";

async function runMultiProcessTest() {
  console.log("==================================================");
  console.log("🚀 STARTING MULTI-PROCESS CONCURRENCY PROOF");
  console.log("==================================================");

  const testUserId = `usr_mp_${nanoid(8)}`;
  const paymentIntentId = `pay_intent_mp_${nanoid(12)}`;

  // 1. Seed DB
  await db.insert(users).values({
    id: testUserId,
    email: `${testUserId}@example.com`,
    displayName: "Multi-Process Test User",
    authProvider: "google",
  });

  await db.insert(wallets).values({
    id: `wal_${nanoid(16)}`,
    userId: testUserId,
    balancePaise: 50000,
    reservedPaise: 0,
  });

  console.log(`[Parent] Seeded User ${testUserId} and Wallet in PostgreSQL.`);

  const childWorkerPath = path.resolve("./tests/integration/child-worker.ts");

  // Spawn 2 independent Node processes with tsx loader
  const p1 = fork(childWorkerPath, [], {
    execArgv: ["--import=tsx"],
    env: { ...process.env },
  });

  const p2 = fork(childWorkerPath, [], {
    execArgv: ["--import=tsx"],
    env: { ...process.env },
  });

  console.log(`[Parent] Spawned Process 1 (PID: ${p1.pid}) and Process 2 (PID: ${p2.pid}).`);

  const p1Promise = new Promise((resolve) => p1.once("message", resolve));
  const p2Promise = new Promise((resolve) => p2.once("message", resolve));

  // Trigger simultaneous execution on both independent processes
  p1.send({ userId: testUserId, paymentIntentId, amountPaise: 5000 });
  p2.send({ userId: testUserId, paymentIntentId, amountPaise: 5000 });

  const [res1, res2]: any = await Promise.all([p1Promise, p2Promise]);

  console.log("[Parent] Process 1 Response:", res1);
  console.log("[Parent] Process 2 Response:", res2);

  p1.kill();
  p2.kill();

  if (!res1.success || !res2.success) {
    throw new Error(`FAIL: Process execution failed. P1: ${JSON.stringify(res1)}, P2: ${JSON.stringify(res2)}`);
  }

  // 2. Verify in PostgreSQL
  const orders = await db
    .select()
    .from(paymentOrders)
    .where(and(eq(paymentOrders.userId, testUserId), eq(paymentOrders.paymentIntentId, paymentIntentId)));

  console.log(`[Parent] Total payment_orders rows in PostgreSQL: ${orders.length}`);

  if (orders.length !== 1) {
    throw new Error(`FAIL: Multi-process concurrency failed! Expected 1 row in DB, got ${orders.length}`);
  }

  if (res1.result.providerOrderId !== res2.result.providerOrderId) {
    throw new Error(`FAIL: Multi-process results diverged! P1: ${res1.result.providerOrderId}, P2: ${res2.result.providerOrderId}`);
  }

  console.log("✅ MULTI-PROCESS CONCURRENCY PROOF PASSED!");
  console.log(`Both independent processes resolved to the same providerOrderId: ${orders[0].providerOrderId}`);

  // Cleanup
  await db.delete(paymentOrders).where(eq(paymentOrders.userId, testUserId));
  await db.delete(wallets).where(eq(wallets.userId, testUserId));
  await db.delete(users).where(eq(users.id, testUserId));
}

runMultiProcessTest().catch((err) => {
  console.error("Multi-process test failed:", err);
  process.exit(1);
});
