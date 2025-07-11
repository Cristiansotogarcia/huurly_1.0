import React from 'react';
import { cn } from '@/lib/utils';

interface ProfileFormStepperProps {
  steps: { id: string; name: string }[];
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

export const ProfileFormStepper: React.FC<ProfileFormStepperProps> = ({ steps, currentStep, setCurrentStep }) => {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
        {steps.map((step, stepIdx) => (
          <li key={step.name} className="md:flex-1">
            <button
              onClick={() => stepIdx < currentStep && setCurrentStep(stepIdx)}
              className={cn(
                'group flex w-full flex-col border-l-4 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4',
                stepIdx < currentStep
                  ? 'border-green-600 hover:border-green-800'
                  : stepIdx === currentStep
                  ? 'border-blue-600'
                  : 'border-gray-200 group-hover:border-gray-300'
              )}
              disabled={stepIdx >= currentStep}
            >
              <span
                className={cn(
                  'text-sm font-medium transition-colors',
                  stepIdx < currentStep
                    ? 'text-green-600 group-hover:text-green-800'
                    : stepIdx === currentStep
                    ? 'text-blue-600'
                    : 'text-gray-500 group-hover:text-gray-700'
                )}
              >
                {`Stap ${stepIdx + 1}`}
              </span>
              <span className="text-sm font-medium">{step.name}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
};