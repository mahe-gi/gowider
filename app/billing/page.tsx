import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getUserWallet } from "@/lib/wallet/service";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { BillingView } from "@/components/billing-view";

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/billing");
  }

  const userId = session.user.id;
  const wallet = await getUserWallet(userId);

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
      <Navigation
        variant="app"
        user={session.user}
        walletBalancePaise={wallet.availablePaise}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <BillingView
          wallet={{
            balancePaise: wallet.balancePaise,
            reservedPaise: wallet.reservedPaise,
            availablePaise: wallet.availablePaise,
            formattedAvailableInr: wallet.formattedAvailableInr,
          }}
          transactions={wallet.recentTransactions.map((t) => ({
            id: t.id,
            type: t.type,
            amountPaise: t.amountPaise,
            status: t.status,
            createdAt: t.createdAt,
            metadata: t.metadata,
          }))}
        />
      </main>

      <Footer />
    </div>
  );
}
