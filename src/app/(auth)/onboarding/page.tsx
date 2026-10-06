import { requireAuth } from "@/lib/auth-guards";
import { getOnboardingProgress } from "@/features/onboarding/progress";
import { OnboardingWizard } from "@/features/onboarding/components/onboarding-wizard";
import { Logo } from "@/components/brand";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding — GoWider",
  description: "Claim your handle, set your identity, and publish your portfolio in 5 minutes.",
};

export default async function OnboardingPage() {
  let user;
  try {
    const authData = await requireAuth();
    user = authData.user;
  } catch {
    redirect("/signin?callbackUrl=/onboarding");
  }

  const progress = await getOnboardingProgress(user.id);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center mb-4 flex justify-center">
        <Logo size="md" href="/" />
      </div>

      <OnboardingWizard
        initialStep={progress.currentStep}
        isComplete={progress.isComplete}
        profile={progress.profile}
        projectsCount={progress.projectsCount}
        settings={progress.settings}
      />
    </div>
  );
}
