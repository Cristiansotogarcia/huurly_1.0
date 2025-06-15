
import { ProfileData } from './types';

export const useProfileValidation = () => {
  const isStepValid = (step: number, profileData: ProfileData): boolean => {
    switch (step) {
      case 1:
        return !!(profileData.firstName && profileData.lastName && profileData.phone && 
               profileData.dateOfBirth && profileData.profession && profileData.monthlyIncome > 0);
      case 2:
        return !!(profileData.city && profileData.minBudget > 0 && profileData.maxBudget > profileData.minBudget);
      case 3:
        return !!(profileData.bio && profileData.motivation);
      case 4:
        return true;
      default:
        return false;
    }
  };

  return { isStepValid };
};
