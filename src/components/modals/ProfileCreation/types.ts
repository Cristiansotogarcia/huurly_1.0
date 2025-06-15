
export interface ProfileData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date | undefined;
  profession: string;
  monthlyIncome: number;
  bio: string;
  
  // Housing Preferences
  city: string;
  minBudget: number;
  maxBudget: number;
  bedrooms: number;
  propertyType: string;
  
  // Additional Info
  motivation: string;
  hasDocuments: boolean;
}

export interface StepProps {
  profileData: ProfileData;
  updateField: (field: keyof ProfileData, value: any) => void;
}
