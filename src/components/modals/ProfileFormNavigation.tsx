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
    <div className="flex justify-between pt-6">
      <div>
        {!isFirstStep && (
          <Button type="button" variant="outline" onClick={onBack}>
            Terug
          </Button>
        )}
      </div>
      <div>
        {!isLastStep ? (
          <Button type="button" onClick={onNext}>
            Volgende
          </Button>
        ) : (
          <Button type="submit" className="bg-green-600 hover:bg-green-700">
            Profiel Opslaan
          </Button>
        )}
      </div>
    </div>
  );
};