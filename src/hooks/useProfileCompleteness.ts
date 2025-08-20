import { useMemo } from 'react';

export interface ProfileCompletenessWeights {
  personalInfo?: number;
  workAndIncome?: number;
  housingPreferences?: number;
  guarantor?: number;
  documents?: number;
  lifestyle?: number;
}

export const useProfileCompleteness = (
  tenantProfile: any,
  userDocuments: any[] = [],
  weights: ProfileCompletenessWeights = {
    personalInfo: 25,
    workAndIncome: 25,
    housingPreferences: 20,
    guarantor: 15,
    documents: 10,
    lifestyle: 5
  }
): number => {
  return useMemo(() => {
    if (!tenantProfile) return 0;

    let score = 0;
    let totalWeight = 0;

    // Personal Information completeness
    if (weights.personalInfo) {
      totalWeight += weights.personalInfo;
      let personalScore = 0;
      const personalFields = [
        tenantProfile.personalInfo?.fullName,
        tenantProfile.personalInfo?.phone,
        tenantProfile.personalInfo?.dateOfBirth,
        tenantProfile.personalInfo?.sex,
        tenantProfile.personalInfo?.nationality,
        tenantProfile.personalInfo?.maritalStatus,
        tenantProfile.age,
        tenantProfile.hasPartner !== undefined,
      ];
      
      const completedPersonalFields = personalFields.filter(field => 
        field !== undefined && field !== null && field !== ''
      ).length;
      
      personalScore = (completedPersonalFields / personalFields.length) * weights.personalInfo;
      score += personalScore;
    }

    // Work and Income completeness
    if (weights.workAndIncome) {
      totalWeight += weights.workAndIncome;
      let workScore = 0;
      const workFields = [
        tenantProfile.profession,
        tenantProfile.workAndIncome?.employer,
        tenantProfile.workAndIncome?.employmentStatus,
        tenantProfile.income,
        tenantProfile.incomeProofAvailable !== undefined,
        tenantProfile.guarantorAvailable !== undefined,
      ];
      
      const completedWorkFields = workFields.filter(field => 
        field !== undefined && field !== null && field !== ''
      ).length;
      
      workScore = (completedWorkFields / workFields.length) * weights.workAndIncome;
      score += workScore;
    }

    // Housing Preferences completeness
    if (weights.housingPreferences) {
      totalWeight += weights.housingPreferences;
      let housingScore = 0;
      const housingFields = [
        tenantProfile.maxRent,
        tenantProfile.minRooms,
        tenantProfile.maxRooms,
        tenantProfile.preferredMoveDate,
        tenantProfile.housingPreferences?.propertyType,
        tenantProfile.housingPreferences?.furnishedPreference,
      ];
      
      const completedHousingFields = housingFields.filter(field => 
        field !== undefined && field !== null && field !== ''
      ).length;
      
      housingScore = (completedHousingFields / housingFields.length) * weights.housingPreferences;
      score += housingScore;
    }

    // Guarantor completeness
    if (weights.guarantor) {
      totalWeight += weights.guarantor;
      let guarantorScore = 0;
      
      if (tenantProfile.guarantorAvailable) {
        const guarantorFields = [
          tenantProfile.guarantorDetails?.name || tenantProfile.guarantorName,
          tenantProfile.guarantorDetails?.relationship || tenantProfile.guarantorRelationship,
          tenantProfile.guarantorDetails?.phone || tenantProfile.guarantorPhone,
          tenantProfile.guarantorDetails?.income || tenantProfile.guarantorIncome,
        ];
        
        const completedGuarantorFields = guarantorFields.filter(field => 
          field !== undefined && field !== null && field !== ''
        ).length;
        
        guarantorScore = (completedGuarantorFields / guarantorFields.length) * weights.guarantor;
      } else {
        guarantorScore = weights.guarantor; // Full score if no guarantor needed
      }
      
      score += guarantorScore;
    }

    // Documents completeness
    if (weights.documents) {
      totalWeight += weights.documents;
      // Assuming at least 3 documents are needed for a complete profile
      const requiredDocuments = 3;
      const documentScore = Math.min((userDocuments.length / requiredDocuments) * weights.documents, weights.documents);
      score += documentScore;
    }

    // Lifestyle completeness
    if (weights.lifestyle) {
      totalWeight += weights.lifestyle;
      const lifestyleFields = [
        tenantProfile.description,
        tenantProfile.lifestyleAndMotivation?.motivation,
      ];
      
      const completedLifestyleFields = lifestyleFields.filter(field => 
        field !== undefined && field !== null && field !== ''
      ).length;
      
      const lifestyleScore = (completedLifestyleFields / lifestyleFields.length) * weights.lifestyle;
      score += lifestyleScore;
    }

    // Normalize to 100%
    return totalWeight > 0 ? Math.round((score / totalWeight) * 100) : 0;
  }, [tenantProfile, userDocuments, weights]);
};
