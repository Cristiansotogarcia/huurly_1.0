import React from 'react';
import { Button } from '@/components/ui/button';

interface ProfileFormNavigationProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  onBack: () => void;
  onNext: () => void;
}

export const ProfileFormNavigation: React.FC<ProfileFormNavigationProps> = ({ isFirstStep, isLastStep, onBack, onNext }) => {
  return (
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
          <Button type="button" onClick={onNext} className="w-full sm:w-auto">
            Volgende
          </Button>
        ) : (
          <Button type="submit" className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
            Profiel Opslaan
          </Button>
        )}
      </div>
    </div>
  );
};