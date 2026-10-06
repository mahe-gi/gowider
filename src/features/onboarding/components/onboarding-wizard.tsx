"use client";

import React, { useState } from "react";
import { StepIndicator } from "./step-indicator";
import { Step1ClaimUsername } from "./step-1-claim-username";
import { Step2Identity } from "./step-2-identity";
import { Step3FirstProject } from "./step-3-first-project";
import { Step4Aesthetic } from "./step-4-aesthetic";
import { Step5Publish } from "./step-5-publish";
import type { OnboardingStep } from "../progress";
import type { Profile, PortfolioSettings } from "@/db/schema";

interface OnboardingWizardProps {
  initialStep: OnboardingStep;
  isComplete: boolean;
  profile: Profile | null;
  projectsCount: number;
  settings: PortfolioSettings | null;
}

const STEPS = [
  { number: 1, label: "Handle" },
  { number: 2, label: "Identity" },
  { number: 3, label: "First Work" },
  { number: 4, label: "Aesthetic" },
  { number: 5, label: "Publish" },
];

export function OnboardingWizard({
  initialStep,
  isComplete,
  profile: initialProfile,
  projectsCount: initialProjectsCount,
  settings: initialSettings,
}: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(initialStep);
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [projectsCount, setProjectsCount] = useState<number>(initialProjectsCount);
  const [settings] = useState<PortfolioSettings | null>(initialSettings);

  const handleStep1Success = (claimedUsername: string) => {
    setProfile((prev) =>
      prev
        ? { ...prev, username: claimedUsername }
        : ({
            id: "temp-id",
            userId: "temp-user",
            username: claimedUsername,
            displayName: claimedUsername,
            headline: "Video Editor & Filmmaker",
            bio: null,
            avatarUrl: null,
            location: null,
            availability: null,
            isPublished: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as Profile)
    );
    setCurrentStep(2);
  };

  const handleStep2Success = () => {
    setCurrentStep(3);
  };

  const handleStep3Success = () => {
    setProjectsCount((c) => Math.max(c, 1));
    setCurrentStep(4);
  };

  const handleStep4Success = () => {
    setCurrentStep(5);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Step Indicator Bar */}
      <StepIndicator currentStep={currentStep} steps={STEPS} />

      {/* Step Components */}
      <div className="bg-[#0A0A0A] border border-white/10 p-6 sm:p-8 shadow-2xl">
        {currentStep === 1 && (
          <Step1ClaimUsername
            initialUsername={profile?.username || ""}
            onSuccess={handleStep1Success}
          />
        )}

        {currentStep === 2 && (
          <Step2Identity
            initialDisplayName={profile?.displayName || ""}
            initialHeadline={profile?.headline || ""}
            initialLocation={profile?.location || ""}
            initialBio={profile?.bio || ""}
            onSuccess={handleStep2Success}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <Step3FirstProject
            onSuccess={handleStep3Success}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && (
          <Step4Aesthetic
            initialTheme={(settings?.theme as "cinema" | "editorial" | "studio") || "cinema"}
            initialMotionLevel={(settings?.motionLevel as "full" | "reduced") || "full"}
            onSuccess={handleStep4Success}
            onBack={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 5 && (
          <Step5Publish
            profile={profile}
            settings={settings}
            projectsCount={projectsCount}
            isAlreadyPublished={isComplete}
            onBack={() => setCurrentStep(4)}
          />
        )}
      </div>
    </div>
  );
}
