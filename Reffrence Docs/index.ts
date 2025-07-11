
export type UserRole = 'huurder' | 'verhuurder' | 'beoordelaar' | 'beheerder';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  hasPayment?: boolean;
  user_metadata?: {
    full_name?: string;
    role?: UserRole;
    [key: string]: any;
  };
  subscriptionEndDate?: string;
  profilePictureUrl?: string; // Add this property
}

export interface TenantProfile {
  id: string;
  userId: string;
  
  // Basic Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  sex?: string;
  nationality?: string;
  maritalStatus?: string;
  
  // Employment & Income
  profession: string;
  employer?: string;
  employmentStatus?: string;
  workContractType?: string;
  income: number;
  monthlyIncome?: number;
  workFromHome?: boolean;
  
  // Household Composition
  hasPartner?: boolean;
  partnerName?: string;
  partnerProfession?: string;
  partnerEmploymentStatus?: string;
  partnerMonthlyIncome?: number;
  hasChildren?: boolean;
  numberOfChildren?: number;
  householdSize?: number;
  
  // Profile Content
  bio: string;
  motivation: string;
  profilePicture?: string;
  isLookingForPlace: boolean;
  
  // Housing Preferences
  preferences: {
    minBudget: number;
    maxBudget: number;
    city: string;
    bedrooms: number;
    propertyType: string;
    furnishedPreference?: string;
    parkingRequired?: boolean;
    storageNeeds?: string;
    leaseDurationPreference?: string;
  };
  
  // Timing & Availability
  moveInDatePreferred?: string;
  moveInDateEarliest?: string;
  availabilityFlexible?: boolean;
  reasonForMoving?: string;
  
  // Guarantor Information
  guarantorAvailable?: boolean;
  guarantorName?: string;
  guarantorPhone?: string;
  guarantorIncome?: number;
  guarantorRelationship?: string;
  incomeProofAvailable?: boolean;
  
  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  
  // Lifestyle & Preferences
  hasPets?: boolean;
  petDetails?: string;
  smokes?: boolean;
  smokingDetails?: string;
  
  // References & History
  referencesAvailable?: boolean;