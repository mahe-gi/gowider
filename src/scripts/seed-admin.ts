import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema/auth";

export async function promoteUserToAdmin(email: string) {
  const targetEmail = email.trim().toLowerCase();
  if (!targetEmail) {
    throw new Error("Target email cannot be empty.");
  }

  const [existingUser] = await db
    .select()
    .from(user)
    .where(eq(user.email, targetEmail))
    .limit(1);

  if (!existingUser) {
    throw new Error(`User with email "${targetEmail}" was not found in the database.`);
  }

  const [updatedUser] = await db
    .update(user)
    .set({
      role: "admin",
      updatedAt: new Date(),
    })
    .where(eq(user.id, existingUser.id))
    .returning();

  return updatedUser ?? { ...existingUser, role: "admin" as const };
}

export const seedAdmin = promoteUserToAdmin;

async function main() {
  const args = process.argv.slice(2);
  let emailArg: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--email=")) {
      emailArg = arg.split("=")[1];
    } else if (arg === "--email" || arg === "-e") {
      emailArg = args[i + 1];
      i++;
    } else if (!arg.startsWith("-") && !emailArg) {
      emailArg = arg;
    }
  }

  if (!emailArg) {
    console.error("Usage: npx tsx src/scripts/seed-admin.ts <email>");
    process.exit(1);
  }

  try {
    const updated = await promoteUserToAdmin(emailArg);
    console.log(`✅ Successfully promoted user "${emailArg}" (ID: ${updated.id}) to admin role.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error promoting user to admin:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

if (process.argv[1]?.endsWith("seed-admin.ts") || process.argv[1]?.endsWith("seed-admin.js")) {
  main();
}
