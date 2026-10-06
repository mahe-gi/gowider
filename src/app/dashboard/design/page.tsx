import React from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { portfolioSettings } from "@/db/schema/auxiliary";
import { requireAuth, getCurrentProfile } from "@/lib/auth-guards";
import { DesignEditor } from "./design-editor";

export default async function DesignPage() {
  const { user } = await requireAuth();

  const profile = await getCurrentProfile(user.id);

  if (!profile) {
    redirect("/onboarding");
  }

  const [settings] = await db
    .select()
    .from(portfolioSettings)
    .where(eq(portfolioSettings.profileId, profile.id))
    .limit(1);

  const initialSettings = settings || {
    id: "",
    profileId: profile.id,
    theme: "cinema" as const,
    motionLevel: "full" as const,
    accentColor: "#E5E5E5",
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
          Customize your portfolio theme, animation dynamics, and signature accent color.
        </p>
      </div>

      <DesignEditor profileId={profile.id} initialSettings={initialSettings} />
    </div>
  );
}
