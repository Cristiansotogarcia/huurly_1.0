/**
 * Database schema types that match the actual Supabase schema
 * This ensures type safety between frontend and backend
 */

// Core database types matching actual schema
export interface DatabaseUser {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'huurder' | 'verhuurder' | 'beoordelaar' | 'beheerder';
  created_at: string;
  updated_at: string;
}

export interface TenantProfile {
  id: string;
  user_id: string;
  date_of_birth?: string;
  profession?: string;
  monthly_income?: number;
  bio?: string;
  motivation?: string;
  is_looking_for_place: boolean;
  preferred_city?: string;
  preferred_province?: string;
  preferred_bedrooms?: number;
  preferred_property_type?: string;
  min_budget?: number;
  max_budget?: number;
  furnished_preference?: boolean;
  has_pets?: boolean;
  smoking?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  landlord_id: string;
  title: string;
  description?: string;
  address: string;
  city: string;
  province?: string;
  postal_code?: string;
  rent_amount: number;
  deposit_amount?: number;
  utility_costs?: number;
  bedrooms: number;
  bathrooms?: number;
  square_meters?: number;
  property_type: string;
  furnished?: boolean;
  pets_allowed?: boolean;
  smoking_allowed?: boolean;
  available_from?: string;
  status: 'active' | 'inactive' | 'rented';
  created_at: string;
  updated_at: string;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  image_url: string;
  is_primary: boolean;
  created_at: string;
}

export interface ViewingInvitation {
  id: string;
  tenant_id: string;
  landlord_id: string;
  property_address: string; // Note: This is the actual column name in schema
  proposed_date: string; // Note: This is the actual column name in schema
  message_id?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface UserDocument {
  id: string;
  user_id: string;
  document_type: 'identity' | 'payslip' | 'employment' | 'reference';
  file_name: string;
  file_url: string;
  file_size: number;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  uploaded_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'viewing_invitation' | 'document_status' | 'payment_required' | 'profile_match' | 'system';
  title: string;
  message: string;
  is_read: boolean;
  related_id?: string;
  created_at: string;
}

// API Response types
export interface DatabaseResponse<T> {
  data: T | null;
  error: Error | null;
  success: boolean;
}

export interface PaginatedResponse<T> extends DatabaseResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Query options
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface SortOptions {
  column: string;
  ascending?: boolean;
}

export interface FilterOptions {
  [key: string]: any;
}

// Joined data types (for complex queries)
export interface PropertyWithImages extends Property {
  property_images: PropertyImage[];
}

export interface PropertyWithLandlord extends Property {
  profiles: Profile;
}

export interface TenantWithProfile extends TenantProfile {
  profiles: Profile;
}

export interface ViewingWithDetails extends ViewingInvitation {
  properties?: Property;
  tenant_profiles?: TenantWithProfile;
  landlord_profiles?: Profile;
}

// Form data types (for API inputs)
export interface CreatePropertyData {
  title: string;
  description?: string;
  address: string;
  city: string;
  province?: string;
  postal_code?: string;
  rent_amount: number;
  deposit_amount?: number;
  utility_costs?: number;
  bedrooms: number;
  bathrooms?: number;
  square_meters?: number;
  property_type: string;
  furnished?: boolean;
  pets_allowed?: boolean;
  smoking_allowed?: boolean;
  available_from?: string;
}

export interface UpdatePropertyData extends Partial<CreatePropertyData> {
  status?: 'active' | 'inactive' | 'rented';
}

export interface CreateTenantProfileData {
  date_of_birth?: string;
  profession?: string;
  monthly_income?: number;
  bio?: string;
  motivation?: string;
  is_looking_for_place?: boolean;
  preferred_city?: string;
  preferred_province?: string;
  preferred_bedrooms?: number;
  preferred_property_type?: string;
  min_budget?: number;
  max_budget?: number;
  furnished_preference?: boolean;
  has_pets?: boolean;
  smoking?: boolean;
}

export interface CreateViewingInvitationData {
  tenant_id: string;
  property_address: string; // Using actual schema column name
  proposed_date: string; // Using actual schema column name
  message_id?: string;
}

export interface UpdateViewingInvitationData {
  status?: 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled' | 'completed';
  message_id?: string;
}

// Search and filter types
export interface PropertyFilters extends FilterOptions {
  searchTerm?: string;
  city?: string;
  province?: string;
  minRent?: number;
  maxRent?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
  furnished?: boolean;
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
}

export interface TenantFilters extends FilterOptions {
  searchTerm?: string;
  city?: string;
  province?: string;
  minIncome?: number;
  maxIncome?: number;
  isLookingForPlace?: boolean;
  verificationStatus?: 'pending' | 'approved' | 'rejected';
}

export interface ViewingFilters extends FilterOptions {
  propertyId?: string;
  tenantId?: string;
  landlordId?: string;
  status?: 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled' | 'completed';
  dateFrom?: string;
  dateTo?: string;
}
