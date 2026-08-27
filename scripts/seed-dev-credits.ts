import { eq, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, wallets } from "@/db/schema";
import { seedDevCredits, getUserWallet } from "@/lib/wallet/service";

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_DEV_CREDIT_SEED !== "true") {
    console.error("❌ ERROR: Manual dev credit seeding is disabled in production.");
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const identifier = args[0]; // Email or User ID
  const amountPaise = args[1] ? parseInt(args[1], 10) : 50000;

  if (!identifier) {
    console.error("Usage: npm run dev:seed-credits -- <user-email-or-id> [amountPaise]");
    process.exit(1);
  }

  console.log(`🔍 Finding user by identifier: ${identifier}...`);

  const [user] = await db
    .select()
    .from(users)
    .where(or(eq(users.id, identifier), eq(users.email, identifier)))
    .limit(1);

  if (!user) {
    console.error(`❌ User not found with ID or Email: ${identifier}`);
    process.exit(1);
  }

  console.log(`💳 Seeding ₹${(amountPaise / 100).toFixed(2)} (${amountPaise} paise) to user ${user.email} (${user.id})...`);
  const updatedWallet = await seedDevCredits(user.id, amountPaise);

  console.log(`✅ Success! Updated balance: ₹${(updatedWallet.balancePaise / 100).toFixed(2)} (Available: ${updatedWallet.formattedAvailableInr})`);
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
