// User domain types

/**
 * Base user interface
 */
export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  profile: UserProfileData;
  settings: UserSettingsData;
  subscription: UserSubscription;
  verification: UserVerification;
  preferences: UserPreferences;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

/**
 * User profile information
 */
export interface UserProfileData {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  avatar_url?: string;
  bio?: string;
  address?: UserAddress;
  emergency_contact?: UserContactInfo;
  created_at: string;
  updated_at: string;
}

/**
 * User settings configuration
 */
export interface UserSettingsData {
  id: string;
  user_id: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  display: DisplaySettings;
  security: SecuritySettings;
  created_at: string;
  updated_at: string;
}

/**
 * User subscription information
 */
export interface UserSubscription {
  id: string;
  user_id: string;
  plan_type: SubscriptionPlan;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  stripe_subscription_id?: string;
  created_at: string;
  updated_at: string;
}

/**
 * User verification status
 */
export interface UserVerification {
  id: string;
  user_id: string;
  email_verified: boolean;
  phone_verified: boolean;
  identity_verified: boolean;
  email_verified_at?: string;
  phone_verified_at?: string;
  identity_verified_at?: string;
  verification_documents?: VerificationDocument[];
  created_at: string;
  updated_at: string;
}

/**
 * User preferences
 */
export interface UserPreferences {
  id: string;
  user_id: string;
  search_radius: number;
  max_rent: number;
  min_rent: number;
  property_types: UserPropertyType[];
  amenities: string[];
  location_preferences: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Notification settings
 */
export interface NotificationSettings {
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  marketing_enabled: boolean;
  application_updates: boolean;
  property_alerts: boolean;
  message_notifications: boolean;
}

/**
 * Privacy settings
 */
export interface PrivacySettings {
  profile_visible: boolean;
  show_contact_info: boolean;
  share_activity: boolean;
  allow_messages: boolean;
  show_online_status: boolean;
}

/**
 * Display settings
 */
export interface DisplaySettings {
  language: string;
  theme: 'light' | 'dark' | 'system';
  timezone: string;
  date_format: string;
  currency: string;
}

/**
 * Security settings
 */
export interface SecuritySettings {
  two_factor_enabled: boolean;
  session_timeout: number;
  login_notifications: boolean;
  device_tracking: boolean;
}

/**
 * Address information
 */
export interface UserAddress {
  street: string;
  house_number: string;
  house_number_addition?: string;
  postal_code: string;
  city: string;
  state?: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Contact information
 */
export interface UserContactInfo {
  name: string;
  phone: string;
  email?: string;
  relationship: string;
}

/**
 * Verification document
 */
export interface VerificationDocument {
  id: string;
  type: DocumentType;
  url: string;
  status: DocumentStatus;
  uploaded_at: string;
  verified_at?: string;
}

/**
 * Data for creating a new user
 */
export interface CreateUserData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  terms_accepted: boolean;
  marketing_consent?: boolean;
}

/**
 * Data for updating user information
 */
export interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: string;
  bio?: string;
  address?: Partial<UserAddress>;
  emergency_contact?: UserContactInfo;
}

/**
 * User search filters
 */
export interface UserSearchFilters {
  role?: UserRole;
  status?: UserStatus;
  verified_only?: boolean;
  subscription_plan?: SubscriptionPlan;
  created_after?: string;
  created_before?: string;
  last_login_after?: string;
  location?: string;
}

/**
 * User statistics
 */
export interface UserStatistics {
  total_applications: number;
  active_applications: number;
  approved_applications: number;
  rejected_applications: number;
  favorite_properties: number;
  viewed_properties: number;
  messages_sent: number;
  messages_received: number;
  profile_views: number;
  recent_activity: UserActivity[];
}

/**
 * User activity log
 */
export interface UserActivity {
  id: string;
  user_id: string;
  type: ActivityType;
  description: string;
  metadata?: Record<string, any>;
  created_at: string;
}

/**
 * User session information
 */
export interface UserSession {
  id: string;
  user_id: string;
  device_info: DeviceInfo;
  ip_address: string;
  location?: string;
  is_active: boolean;
  last_activity: string;
  created_at: string;
  expires_at: string;
}

/**
 * Device information
 */
export interface DeviceInfo {
  user_agent: string;
  browser: string;
  os: string;
  device_type: 'desktop' | 'mobile' | 'tablet';
}

// Enums and Types

export type UserRole = 'tenant' | 'landlord' | 'agent' | 'admin';

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification';

export type SubscriptionPlan = 'free' | 'basic' | 'premium' | 'enterprise';

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete';

export type UserPropertyType = 'apartment' | 'house' | 'studio' | 'room' | 'commercial';

export type DocumentType = 'passport' | 'id_card' | 'drivers_license' | 'utility_bill' | 'bank_statement';

export type DocumentStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export type ActivityType = 
  | 'login'
  | 'logout'
  | 'profile_update'
  | 'application_submitted'
  | 'application_approved'
  | 'application_rejected'
  | 'property_viewed'
  | 'property_favorited'
  | 'message_sent'
  | 'message_received'
  | 'subscription_changed'
  | 'verification_completed';

// Utility types

export type UserWithoutSensitive = Omit<User, 'settings' | 'verification'>;

export type PublicUserProfile = Pick<User, 'id' | 'profile'> & {
  profile: Pick<UserProfileData, 'first_name' | 'last_name' | 'avatar_url' | 'bio'>;
};

export type UserSummary = Pick<User, 'id' | 'email' | 'role' | 'status'> & {
  profile: Pick<UserProfileData, 'first_name' | 'last_name' | 'avatar_url'>;
};