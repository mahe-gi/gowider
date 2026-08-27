import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { getUserWallet } from "@/lib/wallet/service";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { AccountView } from "@/components/account-view";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/account");
  }

  const userId = session.user.id;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    redirect("/api/auth/signin?callbackUrl=/account");
  }

  const wallet = await getUserWallet(userId);

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
      <Navigation
        variant="app"
        user={session.user}
        walletBalancePaise={wallet.availablePaise}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <AccountView
          user={{
            id: user.id,
            displayName: user.displayName || session.user.name || "Creator",
            email: user.email,
            avatarUrl: user.avatarUrl || session.user.image,
            authProvider: user.authProvider,
            createdAt: user.createdAt,
          }}
        />
      </main>

      <Footer />
    </div>
  );
}
