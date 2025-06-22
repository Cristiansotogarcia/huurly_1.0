import { useState } from 'react';

export function useMultiStepForm(totalSteps: number) {
  const [currentStep, setCurrentStep] = useState(0);

  function nextStep() {
    setCurrentStep(i => {
      if (i >= totalSteps - 1) return i;
      return i + 1;
    });
  }

  function prevStep() {
    setCurrentStep(i => {
      if (i <= 0) return i;
      return i - 1;
    });
  }

  function goTo(index: number) {
    setCurrentStep(index);
  }

  return {
    currentStep,
    setCurrentStep,
    nextStep,
    prevStep,
    goTo,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === totalSteps - 1,
  };
}