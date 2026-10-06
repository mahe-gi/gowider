import React from "react";
import { redirect } from "next/navigation";
import { requireAuth, getCurrentProfile } from "@/lib/auth-guards";
import { getDraftPortfolio } from "@/features/design";
import { DraftPreviewClient } from "./draft-preview-client";

export default async function DraftPreviewPage() {
  const { user } = await requireAuth();

  const profile = await getCurrentProfile(user.id);

  if (!profile) {
    redirect("/onboarding");
  }

  const draftPortfolio = await getDraftPortfolio(profile.id, profile);

  if (!draftPortfolio) {
    redirect("/onboarding");
  }

  return <DraftPreviewClient portfolio={draftPortfolio} />;
}
