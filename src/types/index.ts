
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
}

export interface TenantProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  profession: string;
  income: number;
  monthlyIncome?: number;
  bio: string;
  motivation: string;
  profilePicture?: string;
  isLookingForPlace: boolean;
  preferences: {
    minBudget: number;
    maxBudget: number;
    city: string;
    bedrooms: number;
    propertyType: string;
  };
  documents: Document[];
  verificationStatus: 'pending' | 'approved' | 'rejected';
}

export interface LandlordProfile {
  id: string;
  userId: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  properties: Property[];
}

export interface Property {
  id: string;
  landlordId: string;
  title: string;
  description: string;
  address: string;
  city: string;
  rent: number;
  bedrooms: number;
  propertyType: string;
  images: string[];
  requirements: {
    minIncome: number;
    maxAge?: number;
    minAge?: number;
    allowPets: boolean;
  };
  isActive: boolean;
  availableFrom?: string;
  deposit?: number;
  utilities?: number;
}

export interface Document {
  id: string;
  tenantId: string;
  type: 'id' | 'income' | 'employment' | 'reference';
  fileName: string;
  fileUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  uploadedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface ViewingInvitation {
  id: string;
  propertyId: string;
  tenantId: string;
  landlordId: string;
  scheduledDate: string;
  deadline: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  message?: string;
  createdAt: string;
}

export interface Issue {
  id: string;
  reporterId: string;
  reporterRole: UserRole;
  title: string;
  description: string;
  category: 'technical' | 'user_complaint' | 'payment' | 'verification' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  notes: IssueNote[];
  createdAt: string;
  resolvedAt?: string;
}

export interface IssueNote {
  id: string;
  issueId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'profile_match' | 'viewing_invitation' | 'payment_success' | 'payment_failed' | 'subscription_cancelled' | 'document_approved' | 'document_rejected' | 'property_application' | 'system_announcement';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  updated_at?: string;
  related_id?: string;
  related_type?: string;
}

export interface PaymentStatus {
  hasValidPayment: boolean;
  subscriptionType: 'basic' | 'premium';
  expiresAt?: string;
}
