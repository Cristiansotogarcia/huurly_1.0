import { useState } from 'react';
import { UseFormGetValues } from 'react-hook-form';
import { z } from 'zod';
import { stepSchemas, getFieldLabel } from '@/components/modals/stepValidationSchemas';
import { ProfileFormData } from '@/components/modals/profileSchema';

interface ValidationError {
  field: string;
  message: string;
  label: string;
}

interface UseValidatedMultiStepFormReturn {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  nextStep: () => boolean;
  prevStep: () => void;
  goTo: (index: number) => boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  validateCurrentStep: () => ValidationError[];
  canNavigateToStep: (stepIndex: number) => boolean;
  getStepValidationErrors: (stepIndex: number) => ValidationError[];
}

export function useValidatedMultiStepForm(
  totalSteps: number,
  getValues: UseFormGetValues<ProfileFormData>
): UseValidatedMultiStepFormReturn {
  const [currentStep, setCurrentStep] = useState(0);

  const validateStep = (stepIndex: number, formData: Partial<ProfileFormData>): ValidationError[] => {
    const schema = stepSchemas[stepIndex];
    if (!schema) return [];

    try {
      schema.parse(formData);
      return [];
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          label: getFieldLabel(err.path[0] as string)
        }));
      }
      return [];
    }
  };

  const validateCurrentStep = (): ValidationError[] => {
    const formData = getValues();
    return validateStep(currentStep, formData);
  };

  const getStepValidationErrors = (stepIndex: number): ValidationError[] => {
    const formData = getValues();
    return validateStep(stepIndex, formData);
  };

  const canNavigateToStep = (stepIndex: number): boolean => {
    // Always allow going backwards
    if (stepIndex <= currentStep) return true;
    
    // Check if all previous steps with required fields are valid
    const formData = getValues();
    for (let i = 0; i < stepIndex; i++) {
      const errors = validateStep(i, formData);
      if (errors.length > 0) {
        return false;
      }
    }
    
    return true;
  };

  const nextStep = (): boolean => {
    const errors = validateCurrentStep();
    if (errors.length > 0) {
      return false; // Validation failed
    }

    setCurrentStep(i => {
      if (i >= totalSteps - 1) return i;
      return i + 1;
    });
    return true; // Validation passed
  };

  const prevStep = (): void => {
    setCurrentStep(i => {
      if (i <= 0) return i;
      return i - 1;
    });
  };

  const goTo = (index: number): boolean => {
    if (!canNavigateToStep(index)) {
      return false;
    }
    setCurrentStep(index);
    return true;
  };

  return {
    currentStep,
    setCurrentStep,
    nextStep,
    prevStep,
    goTo,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === totalSteps - 1,
    validateCurrentStep,
    canNavigateToStep,
    getStepValidationErrors,
  };
}