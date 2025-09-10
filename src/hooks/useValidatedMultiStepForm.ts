import { useState, useCallback, useMemo } from 'react';
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
    // Direct mapping - stepSchemas now aligned with UI steps
    const schema = stepSchemas[stepIndex];
    if (!schema) {
      return [];
    }


    try {
      schema.parse(formData);
      return [];
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.issues.map((err: z.ZodIssue) => ({
          field: err.path.join('.'),
          message: err.message,
          label: getFieldLabel(err.path[0] as string)
        }));
        return validationErrors;
      }
      return [];
    }
  };

  const validateCurrentStep = useCallback((): ValidationError[] => {
    const formData = getValues();
    return validateStep(currentStep, formData);
  }, [currentStep, getValues]);

  const getStepValidationErrors = useCallback((stepIndex: number): ValidationError[] => {
    const formData = getValues();
    return validateStep(stepIndex, formData);
  }, [getValues]);

  const canNavigateToStep = useCallback((stepIndex: number): boolean => {
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
  }, [currentStep, getValues]);

  const nextStep = (): boolean => {
    console.log('🔥🔥🔥 NEXT STEP CALLED - Current step:', currentStep, 'Total steps:', totalSteps);
    const errors = validateCurrentStep();
    console.log('🔥🔥🔥 Validation errors:', errors);

    if (errors.length > 0) {
      console.log('🔥🔥🔥 Validation failed - not proceeding to next step');
      return false; // Validation failed
    }

    console.log('🔥🔥🔥 Validation passed - proceeding to next step');
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
    console.log('🔥🔥🔥 GO TO STEP CALLED:', index, 'Current step:', currentStep, 'Can navigate:', canNavigateToStep(index));
    if (!canNavigateToStep(index)) {
      console.log('🔥🔥🔥 CANNOT NAVIGATE TO STEP:', index);
      return false;
    }
    console.log('🔥🔥🔥 NAVIGATING TO STEP:', index);
    setCurrentStep(index);
    console.log('🔥🔥🔥 STEP CHANGED TO:', index, 'Is last step:', index === totalSteps - 1);
    return true;
  };

  const isFirstStep = useMemo(() => currentStep === 0, [currentStep]);
  const isLastStep = useMemo(() => currentStep === totalSteps - 1, [currentStep, totalSteps]);

  return {
    currentStep,
    setCurrentStep,
    nextStep,
    prevStep,
    goTo,
    isFirstStep,
    isLastStep,
    validateCurrentStep,
    canNavigateToStep,
    getStepValidationErrors,
  };
}
