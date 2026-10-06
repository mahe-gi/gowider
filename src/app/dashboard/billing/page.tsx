import React from "react";
import { redirect } from "next/navigation";
import { requireAuth, getCurrentProfile } from "@/lib/auth-guards";
import { getProfileSubscription, isProProfile } from "@/features/billing/subscription-service";
import { getProjectsForProfile } from "@/features/projects";
import { BillingClient } from "./billing-client";

export default async function BillingPage() {
  const { user } = await requireAuth();

  const profile = await getCurrentProfile(user.id);
  if (!profile) {
    redirect("/onboarding");
  }

  const [subscription, projectsList, isPro] = await Promise.all([
    getProfileSubscription(profile.id),
    getProjectsForProfile(profile.id),
    isProProfile(profile.id),
  ]);

  const publishedCount = projectsList.filter(
    (p: { isPublished: boolean }) => p.isPublished
  ).length;

  return (
    <div data-testid="billing-page" className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Billing & Subscription
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Manage your creator membership tier, feature gates, and payment details.
        </p>
      </div>

      <BillingClient
        profileId={profile.id}
        subscription={subscription}
        isPro={isPro}
        publishedCount={publishedCount}
      />
    </div>
  );
}
