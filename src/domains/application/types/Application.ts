import { BaseEntity, Money, ContactInfo } from '../../shared/types/common';
import { Property } from '../../property/types/Property';
import { User } from '../../user/types/User';

// Application-related enums
export enum ApplicationStatusType {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
  EXPIRED = 'expired'
}

export enum EmploymentStatus {
  EMPLOYED = 'employed',
  SELF_EMPLOYED = 'self_employed',
  UNEMPLOYED = 'unemployed',
  STUDENT = 'student',
  RETIRED = 'retired',
  OTHER = 'other'
}

export enum IncomeType {
  SALARY = 'salary',
  FREELANCE = 'freelance',
  BUSINESS = 'business',
  PENSION = 'pension',
  BENEFITS = 'benefits',
  INVESTMENT = 'investment',
  OTHER = 'other'
}

export enum ReferenceType {
  PREVIOUS_LANDLORD = 'previous_landlord',
  EMPLOYER = 'employer',
  PERSONAL = 'personal',
  PROFESSIONAL = 'professional',
  ACADEMIC = 'academic'
}

export enum ApplicationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

// Application interfaces
export interface ApplicationReference {
  id: string;
  type: ReferenceType;
  name: string;
  relationship: string;
  contact_info: ContactInfo;
  company?: string;
  position?: string;
  duration?: string; // e.g., "2 years"
  notes?: string;
  verified: boolean;
  verification_date?: string;
}

export interface ApplicationIncome {
  type: IncomeType;
  amount: Money;
  frequency: 'monthly' | 'yearly';
  source: string;
  verified: boolean;
  documents?: Array<{
    id: string;
    name: string;
    type: 'payslip' | 'contract' | 'bank_statement' | 'tax_return' | 'other';
    url: string;
    upload_date: string;
  }>;
}

export interface ApplicationEmployment {
  status: EmploymentStatus;
  company?: string;
  position?: string;
  start_date?: string;
  end_date?: string;
  is_current: boolean;
  salary?: Money;
  contract_type?: 'permanent' | 'temporary' | 'freelance' | 'internship';
  work_hours?: number; // per week
  supervisor_contact?: ContactInfo;
  description?: string;
}

export interface ApplicationPet {
  type: 'dog' | 'cat' | 'bird' | 'fish' | 'reptile' | 'other';
  name: string;
  breed?: string;
  age?: number;
  weight?: number;
  vaccinated: boolean;
  trained: boolean;
  description?: string;
  photos?: string[];
}

export interface ApplicationHousehold {
  size: number;
  adults: number;
  children: number;
  pets: ApplicationPet[];
  smoking: boolean;
  special_needs?: string;
  previous_address?: {
    address: string;
    duration: string;
    reason_for_leaving?: string;
    landlord_contact?: ContactInfo;
  };
}

export interface ApplicationDocuments {
  identity_document?: {
    type: 'passport' | 'id_card' | 'drivers_license';
    number: string;
    expiry_date: string;
    url: string;
    verified: boolean;
  };
  income_proof: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    upload_date: string;
    verified: boolean;
  }>;
  bank_statements?: Array<{
    id: string;
    month: string;
    url: string;
    upload_date: string;
    verified: boolean;
  }>;
  employment_letter?: {
    url: string;
    upload_date: string;
    verified: boolean;
  };
  previous_rental_history?: Array<{
    property_address: string;
    landlord_reference: string;
    url: string;
    upload_date: string;
  }>;
  additional_documents?: Array<{
    id: string;
    name: string;
    description: string;
    url: string;
    upload_date: string;
  }>;
}

export interface ApplicationTimeline {
  status: ApplicationStatusType;
  timestamp: string;
  actor: 'applicant' | 'landlord' | 'system';
  action: string;
  notes?: string;
  documents_added?: string[];
  automated: boolean;
}

export interface ApplicationReviewData {
  id: string;
  reviewer_id: string;
  reviewer_name: string;
  review_date: string;
  status: ApplicationStatusType;
  score?: number; // 1-10
  criteria_scores?: Record<string, number>;
  notes: string;
  feedback_for_applicant?: string;
  recommendations?: string[];
  follow_up_required: boolean;
  follow_up_date?: string;
}

export interface ApplicationMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_type: 'applicant' | 'landlord';
  message: string;
  timestamp: string;
  read: boolean;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
}

// Main Application interface
export interface Application extends BaseEntity {
  // Basic information
  property_id: string;
  property?: Property;
  applicant_id: string;
  applicant?: User;
  status: ApplicationStatusType;
  priority: ApplicationPriority;
  
  // Application content
  personal_message: string;
  move_in_date: string;
  rental_duration?: number; // in months
  
  // Financial information
  income: ApplicationIncome[];
  total_monthly_income: Money;
  employment: ApplicationEmployment[];
  credit_score?: number;
  debt_to_income_ratio?: number;
  
  // Personal information
  household: ApplicationHousehold;
  references: ApplicationReference[];
  
  // Documentation
  documents: ApplicationDocuments;
  
  // Application process
  timeline: ApplicationTimeline[];
  reviews: ApplicationReviewData[];
  messages: ApplicationMessage[];
  
  // Metadata
  submission_date: string;
  last_updated: string;
  expires_at?: string;
  viewed_by_landlord: boolean;
  landlord_response_deadline?: string;
  
  // Scoring and ranking
  compatibility_score?: number;
  ranking_position?: number;
  auto_generated_summary?: string;
}

// Application creation and update interfaces
export interface CreateApplicationData {
  property_id: string;
  personal_message: string;
  move_in_date: string;
  rental_duration?: number;
  
  // Financial information
  income: Omit<ApplicationIncome, 'verified' | 'documents'>[];
  employment: ApplicationEmployment[];
  
  // Personal information
  household: ApplicationHousehold;
  references: Omit<ApplicationReference, 'id' | 'verified' | 'verification_date'>[];
  
  // Documents (as files)
  identity_document?: File;
  income_documents: File[];
  bank_statements?: File[];
  employment_letter?: File;
  additional_documents?: Array<{
    file: File;
    name: string;
    description: string;
  }>;
}

export interface UpdateApplicationData extends Partial<CreateApplicationData> {
  id: string;
  status?: ApplicationStatusType;
  priority?: ApplicationPriority;
}

// Application search and filtering
export interface ApplicationSearchFilters {
  status?: ApplicationStatusType[];
  property_id?: string;
  applicant_id?: string;
  landlord_id?: string;
  date_range?: {
    start: string;
    end: string;
  };
  income_range?: {
    min: number;
    max: number;
  };
  employment_status?: EmploymentStatus[];
  household_size?: {
    min: number;
    max: number;
  };
  has_pets?: boolean;
  smoking?: boolean;
  verified_income?: boolean;
  priority?: ApplicationPriority[];
  compatibility_score?: {
    min: number;
    max: number;
  };
}

export interface ApplicationSearchOptions {
  sort_by?: 'date_desc' | 'date_asc' | 'score_desc' | 'income_desc' | 'status';
  page?: number;
  limit?: number;
  include_property?: boolean;
  include_applicant?: boolean;
  include_messages?: boolean;
}

export interface ApplicationSearchResult {
  applications: Application[];
  total_count: number;
  page: number;
  limit: number;
  has_more: boolean;
  filters_applied: ApplicationSearchFilters;
  status_counts: Record<ApplicationStatusType, number>;
}

// Application statistics and analytics
export interface ApplicationStatistics {
  total_applications: number;
  by_status: Record<ApplicationStatusType, number>;
  by_property: Record<string, number>;
  average_processing_time: number; // in days
  approval_rate: number;
  rejection_rate: number;
  withdrawal_rate: number;
  average_income: Money;
  most_common_employment_status: EmploymentStatus;
  pet_ownership_rate: number;
  smoking_rate: number;
}

export interface ApplicationAnalytics {
  period: {
    start: string;
    end: string;
  };
  statistics: ApplicationStatistics;
  trends: {
    applications_over_time: Array<{
      date: string;
      count: number;
    }>;
    approval_rate_trend: Array<{
      date: string;
      rate: number;
    }>;
    average_processing_time_trend: Array<{
      date: string;
      days: number;
    }>;
  };
  insights: string[];
  recommendations: string[];
}

// Application review and decision
export interface ApplicationDecision {
  application_id: string;
  decision: 'approve' | 'reject' | 'request_more_info';
  reason?: string;
  feedback_for_applicant?: string;
  conditions?: string[];
  follow_up_required?: boolean;
  follow_up_date?: string;
  additional_documents_requested?: string[];
  interview_scheduled?: {
    date: string;
    time: string;
    location: string;
    type: 'in_person' | 'video' | 'phone';
  };
}

// Application bulk operations
export interface ApplicationBulkOperation {
  application_ids: string[];
  operation: 'approve' | 'reject' | 'archive' | 'priority_change' | 'status_change';
  parameters?: {
    new_status?: ApplicationStatusType;
    new_priority?: ApplicationPriority;
    reason?: string;
    send_notification?: boolean;
  };
}

// Export utility types
export type ApplicationFormData = CreateApplicationData;
export type ApplicationUpdateFormData = UpdateApplicationData;
export type ApplicationFilters = ApplicationSearchFilters;
export type ApplicationSortOption = ApplicationSearchOptions['sort_by'];