import React from "react";
import { redirect } from "next/navigation";
import { requireAuth, getCurrentProfile } from "@/lib/auth-guards";
import { env } from "@/env";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopBar } from "@/components/dashboard/top-bar";
import { MobileDashboardNav } from "@/components/dashboard/mobile-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user;
  try {
    const authData = await requireAuth();
    user = authData.user;
  } catch {
    redirect("/signin?callbackUrl=/dashboard");
  }

  const profile = await getCurrentProfile(user.id);

  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col md:flex-row">
      {/* Mobile Header & Bottom Navigation */}
      <MobileDashboardNav />

      {/* Desktop Sidebar */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-black pb-16 md:pb-0">
        <DashboardTopBar
          profile={profile}
          appUrl={env.NEXT_PUBLIC_APP_URL}
        />
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
