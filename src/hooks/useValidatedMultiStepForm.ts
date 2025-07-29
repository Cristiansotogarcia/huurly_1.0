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
    // Direct mapping - stepSchemas now aligned with UI steps
    const schema = stepSchemas[stepIndex];
    if (!schema) {
      console.log(`🔍 validateStep: No schema found for step ${stepIndex}`);
      return [];
    }

    console.log(`🔍 validateStep: Validating step ${stepIndex} with data:`, formData);
    console.log(`🔍 validateStep: Schema for step ${stepIndex}:`, schema);

    try {
      const result = schema.parse(formData);
      console.log(`✅ validateStep: Step ${stepIndex} validation passed`, result);
      return [];
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          label: getFieldLabel(err.path[0] as string)
        }));
        console.log(`❌ validateStep: Step ${stepIndex} validation failed:`, validationErrors);
        console.log(`❌ validateStep: Raw Zod errors:`, error.errors);
        return validationErrors;
      }
      console.log(`❌ validateStep: Unknown validation error for step ${stepIndex}:`, error);
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
    console.log(`🚀 nextStep: Attempting to move from step ${currentStep} to step ${currentStep + 1}`);
    
    // Force a fresh read of form data to ensure we have the latest values
    const formData = getValues();
    console.log(`🚀 nextStep: Current form data:`, formData);
    
    // Special handling for Step 2 (index 1) - Employment step
    if (currentStep === 1) {
      console.log(`🏢 nextStep: Validating Step 2 (Employment) - checking required fields`);
      console.log(`🏢 nextStep: Profession value: "${formData.profession}"`);
      console.log(`🏢 nextStep: Employer value: "${formData.employer}"`);
      console.log(`🏢 nextStep: Employment status: "${formData.employment_status}"`);
      console.log(`🏢 nextStep: Monthly income: ${formData.monthly_income}`);
      
      // Manual validation for debugging
      const missingFields = [];
      if (!formData.profession || formData.profession.trim() === '') {
        missingFields.push('profession (Beroep)');
      }
      // Employer is now optional, so we don't check it
      if (!formData.employment_status || formData.employment_status.trim() === '') {
        missingFields.push('employment_status (Status)');
      }
      if (!formData.monthly_income || formData.monthly_income <= 0) {
        missingFields.push('monthly_income (Maandinkomen)');
      }
      
      if (missingFields.length > 0) {
        console.log(`❌ nextStep: Manual validation failed for Step 2. Missing fields:`, missingFields);
      } else {
        console.log(`✅ nextStep: Manual validation passed for Step 2`);
      }
    }
    
    const errors = validateCurrentStep();
    console.log(`🚀 nextStep: Validation errors for step ${currentStep}:`, errors);
    
    if (errors.length > 0) {
      console.log(`❌ nextStep: Cannot proceed - validation failed for step ${currentStep}`);
      return false; // Validation failed
    }

    console.log(`✅ nextStep: Validation passed for step ${currentStep}, proceeding to next step`);
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
