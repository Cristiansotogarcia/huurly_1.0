import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ValidationErrorModal } from './ValidationErrorModal';

interface ValidationError {
  field: string;
  message: string;
  label: string;
}

interface ProfileFormNavigationProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  onBack: () => void;
  onNext: () => boolean; // Now returns boolean for validation result
  validateCurrentStep: () => ValidationError[];
}

export const ProfileFormNavigation: React.FC<ProfileFormNavigationProps> = ({ 
  isFirstStep, 
  isLastStep, 
  onBack, 
  onNext, 
  validateCurrentStep 
}) => {
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  const handleNext = () => {
    const validationPassed = onNext();
    
    if (!validationPassed) {
      const errors = validateCurrentStep();
      const fieldLabels = errors.map(error => error.label);
      setMissingFields(fieldLabels);
      setShowValidationModal(true);
    }
  };

  return (
    <>
      <ValidationErrorModal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        missingFields={missingFields}
      />
      
      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 pt-6">
      <div className="order-2 sm:order-1">
        {!isFirstStep && (
          <Button type="button" variant="outline" onClick={onBack} className="w-full sm:w-auto">
            Terug
          </Button>
        )}
      </div>
      <div className="order-1 sm:order-2">
        {!isLastStep ? (
          <Button type="button" onClick={handleNext} className="w-full sm:w-auto">
            Volgende
          </Button>
        ) : (
          <Button 
            type="submit" 
            className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
            onClick={() => console.log('Submit button clicked')}
          >
            Profiel Opslaan
          </Button>
        )}
      </div>
    </div>
    </>
  );
};