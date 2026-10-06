import React from "react";
import { redirect } from "next/navigation";
import { requireAuth, getCurrentProfile } from "@/lib/auth-guards";
import { env } from "@/env";
import { SettingsEditor } from "./settings-editor";

export default async function SettingsPage() {
  const { user } = await requireAuth();

  const profile = await getCurrentProfile(user.id);

  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <div data-testid="settings-page" className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Manage your portfolio handle, public visibility, and account access.
        </p>
      </div>

      <SettingsEditor
        profile={profile}
        appUrl={env.NEXT_PUBLIC_APP_URL}
      />
    </div>
  );
}
