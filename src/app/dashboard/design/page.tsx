import React from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { portfolioSettings } from "@/db/schema/auxiliary";
import { requireAuth, getCurrentProfile } from "@/lib/auth-guards";
import { DesignEditor } from "./design-editor";

import { isProProfile } from "@/features/billing/subscription-service";

export default async function DesignPage() {
  const { user } = await requireAuth();

  const profile = await getCurrentProfile(user.id);

  if (!profile) {
    redirect("/onboarding");
  }

  const [settings, isPro] = await Promise.all([
    db
      .select()
      .from(portfolioSettings)
      .where(eq(portfolioSettings.profileId, profile.id))
      .limit(1)
      .then(([s]) => s),
    isProProfile(profile.id),
  ]);

  const initialSettings = settings || {
    id: "",
    profileId: profile.id,
    theme: "cinema" as const,
    motionLevel: "full" as const,
    accentColor: "#E5E5E5",
    hideBranding: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return (
    <div data-testid="design-page" className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Design & Aesthetic
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Customize your portfolio theme, animation dynamics, signature accent color, and branding.
        </p>
      </div>

      <DesignEditor
        profileId={profile.id}
        initialSettings={initialSettings}
        isPro={isPro}
      />
    </div>
  );
}
