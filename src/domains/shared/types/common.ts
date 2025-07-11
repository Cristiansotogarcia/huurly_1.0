/**
 * Common utility types used across domains
 */

/**
 * Base entity interface
 */
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Soft delete entity
 */
export interface SoftDeleteEntity extends BaseEntity {
  deleted_at: string | null;
  is_deleted: boolean;
}

/**
 * User-owned entity
 */
export interface UserOwnedEntity extends BaseEntity {
  user_id: string;
}

/**
 * Timestamped entity
 */
export interface TimestampedEntity {
  created_at: string;
  updated_at: string;
}

/**
 * Status types
 */
export type Status = 'active' | 'inactive' | 'pending' | 'suspended' | 'deleted';

/**
 * Priority levels
 */
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * User roles
 */
export type UserRole = 'huurder' | 'verhuurder' | 'beheerder' | 'beoordelaar';

/**
 * File upload types
 */
export interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploaded_at: string;
}

/**
 * Address information
 */
export interface Address {
  street: string;
  house_number: string;
  house_number_addition?: string;
  postal_code: string;
  city: string;
  province: string;
  country: string;
}

/**
 * Contact information
 */
export interface ContactInfo {
  email: string;
  phone?: string;
  mobile?: string;
}

/**
 * Money amount
 */
export interface Money {
  amount: number;
  currency: string;
}

/**
 * Date range
 */
export interface DateRange {
  start_date: string;
  end_date: string;
}

/**
 * Coordinates
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Image information
 */
export interface Image {
  id: string;
  url: string;
  alt_text?: string;
  width?: number;
  height?: number;
  size: number;
  format: string;
}

/**
 * Document information
 */
export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  uploaded_at: string;
  expires_at?: string;
}

/**
 * Notification types
 */
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

/**
 * Notification
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  expires_at?: string;
  action_url?: string;
  action_text?: string;
}

/**
 * Settings
 */
export interface Settings {
  [key: string]: any;
}

/**
 * Feature flags
 */
export interface FeatureFlags {
  [feature: string]: boolean;
}

/**
 * Environment types
 */
export type Environment = 'development' | 'staging' | 'production';

/**
 * API version
 */
export type ApiVersion = 'v1' | 'v2';

/**
 * Language codes
 */
export type LanguageCode = 'nl' | 'en' | 'de' | 'fr';

/**
 * Theme types
 */
export type Theme = 'light' | 'dark' | 'auto';

/**
 * Device types
 */
export type DeviceType = 'desktop' | 'tablet' | 'mobile';

/**
 * Browser types
 */
export type BrowserType = 'chrome' | 'firefox' | 'safari' | 'edge' | 'other';

/**
 * Operating system types
 */
export type OperatingSystem = 'windows' | 'macos' | 'linux' | 'ios' | 'android' | 'other';

/**
 * Generic key-value pair
 */
export interface KeyValuePair<T = any> {
  key: string;
  value: T;
}

/**
 * Option for select inputs
 */
export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
  description?: string;
}

/**
 * Loading state
 */
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

/**
 * Async operation state
 */
export interface AsyncState<T = any> extends LoadingState {
  data: T | null;
  lastUpdated?: string;
}

/**
 * Form field state
 */
export interface FieldState {
  value: any;
  error: string | null;
  touched: boolean;
  dirty: boolean;
}

/**
 * Form state
 */
export interface FormState<T = Record<string, any>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  dirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
}

/**
 * Modal state
 */
export interface ModalState {
  isOpen: boolean;
  data?: any;
}

/**
 * Toast message
 */
export interface ToastMessage {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

/**
 * Menu item
 */
export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  href?: string;
  onClick?: () => void;
  children?: MenuItem[];
  disabled?: boolean;
  badge?: string | number;
}

/**
 * Tab item
 */
export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

/**
 * Table column definition
 */
export interface TableColumn<T = any> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T) => React.ReactNode;
}

/**
 * Chart data point
 */
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

/**
 * Statistics
 */
export interface Statistics {
  total: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  period: string;
}