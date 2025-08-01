import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import ValidationErrorModal from './ValidationErrorModal';

interface ValidationError {
  field: string;
  message: string;
  label: string;
}

interface ProfileFormNavigationProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  onBack: () => void;
  onNext: () => boolean; // returns boolean for validation result
  validateCurrentStep: () => ValidationError[];
  isSubmitting?: boolean;
}

const ProfileFormNavigation: React.FC<ProfileFormNavigationProps> = ({
  isFirstStep,
  isLastStep,
  onBack,
  onNext,
  validateCurrentStep,
  isSubmitting = false,
}) => {
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  const handleNext = () => {
    const validationPassed = onNext();
    if (!validationPassed) {
      const errors = validateCurrentStep();
      setMissingFields(errors.map((e) => e.label));
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
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="w-full sm:w-auto"
              disabled={isSubmitting}
            >
              Terug
            </Button>
          )}
        </div>

        <div className="order-1 sm:order-2">
          {!isLastStep ? (
            <Button
              type="button"
              onClick={handleNext}
              className="w-full sm:w-auto"
              disabled={isSubmitting}
            >
              Volgende
            </Button>
          ) : (
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Opslaan...
                </>
              ) : (
                'Profiel Opslaan'
              )}
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfileFormNavigation;
