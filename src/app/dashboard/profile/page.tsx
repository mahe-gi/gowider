import React from "react";
import { redirect } from "next/navigation";
import { requireAuth, getCurrentProfile } from "@/lib/auth-guards";
import { getProfileWithAuxiliary } from "@/features/profile";
import { ProfileEditor } from "./profile-editor";

export default async function ProfilePage() {
  const { user } = await requireAuth();

  const profile = await getCurrentProfile(user.id);

  if (!profile) {
    redirect("/onboarding");
  }

  const auxiliaryData = await getProfileWithAuxiliary(profile.id, profile);
  if (!auxiliaryData) {
    redirect("/onboarding");
  }

  return (
    <div data-testid="profile-management-page" className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Profile & Credentials
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Manage your creative identity, professional services, tool skills, and verified social channels.
        </p>
      </div>

      <ProfileEditor initialData={auxiliaryData} />
    </div>
  );
}
