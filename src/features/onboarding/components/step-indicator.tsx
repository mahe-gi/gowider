import React from "react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
  steps: { number: number; label: string }[];
}

export function StepIndicator({
  currentStep,
  totalSteps = 5,
  steps,
}: StepIndicatorProps) {
  const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="w-full mb-8">
      {/* Progress Bar Track */}
      <div className="relative w-full h-1 bg-white/10 rounded-full overflow-hidden mb-6">
        <div
          data-testid="step-progress-bar"
          className="h-full bg-white transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step Pill Indicators */}
      <div className="flex items-center justify-between">
        {steps.map((step) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;

          return (
            <div
              key={step.number}
              data-testid={`step-indicator-${step.number}`}
              className="flex items-center gap-2"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-medium transition-colors ${
                  isCompleted
                    ? "bg-white text-black"
                    : isCurrent
                    ? "bg-white/20 text-white border border-white"
                    : "bg-white/5 text-zinc-500 border border-white/10"
                }`}
              >
                {isCompleted ? "✓" : step.number}
              </div>
              <span
                className={`hidden sm:inline text-xs font-medium uppercase tracking-wider ${
                  isCurrent
                    ? "text-white"
                    : isCompleted
                    ? "text-zinc-300"
                    : "text-zinc-600"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
