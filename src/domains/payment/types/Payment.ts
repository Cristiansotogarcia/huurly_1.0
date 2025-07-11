import { BaseEntity, Money } from '../../shared/types/common';
import { User } from '../../user/types/User';
import { Property } from '../../property/types/Property';
import { Application } from '../../application/types/Application';

// Payment-related enums
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  DISPUTED = 'disputed',
  EXPIRED = 'expired'
}

export enum PaymentType {
  RENT = 'rent',
  DEPOSIT = 'deposit',
  SERVICE_COSTS = 'service_costs',
  UTILITIES = 'utilities',
  APPLICATION_FEE = 'application_fee',
  SUBSCRIPTION = 'subscription',
  LATE_FEE = 'late_fee',
  DAMAGE_FEE = 'damage_fee',
  CLEANING_FEE = 'cleaning_fee',
  REFUND = 'refund',
  OTHER = 'other'
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  SEPA_DIRECT_DEBIT = 'sepa_direct_debit',
  IDEAL = 'ideal',
  PAYPAL = 'paypal',
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay',
  CASH = 'cash',
  CHECK = 'check'
}

export enum PaymentFrequency {
  ONE_TIME = 'one_time',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly'
}

export enum RefundReason {
  DUPLICATE_PAYMENT = 'duplicate_payment',
  CANCELLED_BOOKING = 'cancelled_booking',
  OVERPAYMENT = 'overpayment',
  PROPERTY_UNAVAILABLE = 'property_unavailable',
  CUSTOMER_REQUEST = 'customer_request',
  TECHNICAL_ERROR = 'technical_error',
  FRAUD = 'fraud',
  OTHER = 'other'
}

export enum DisputeReason {
  UNAUTHORIZED = 'unauthorized',
  DUPLICATE = 'duplicate',
  PRODUCT_NOT_RECEIVED = 'product_not_received',
  PRODUCT_UNACCEPTABLE = 'product_unacceptable',
  CREDIT_NOT_PROCESSED = 'credit_not_processed',
  CANCELLED_RECURRING = 'cancelled_recurring',
  OTHER = 'other'
}

export enum PaymentSubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  CANCELLED = 'cancelled',
  PAST_DUE = 'past_due',
  PAUSED = 'paused',
  EXPIRED = 'expired'
}

export enum PaymentSubscriptionPlan {
  BASIC = 'basic',
  PREMIUM = 'premium',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise'
}

// Payment method interfaces
export interface PaymentMethodDetails {
  id: string;
  type: PaymentMethod;
  is_default: boolean;
  created_at: string;
  last_used?: string;
  expires_at?: string;
  
  // Card details (for credit/debit cards)
  card?: {
    last_four: string;
    brand: 'visa' | 'mastercard' | 'amex' | 'discover' | 'other';
    exp_month: number;
    exp_year: number;
    country: string;
    funding: 'credit' | 'debit' | 'prepaid' | 'unknown';
    fingerprint: string;
  };
  
  // Bank account details (for bank transfers)
  bank_account?: {
    account_holder_name: string;
    bank_name: string;
    account_number_last_four: string;
    routing_number?: string;
    iban_last_four?: string;
    country: string;
  };
  
  // Digital wallet details
  wallet?: {
    email?: string;
    phone?: string;
  };
}

export interface PaymentProcessor {
  name: string;
  transaction_id: string;
  reference_id?: string;
  processor_fee?: Money;
  exchange_rate?: number;
  raw_response?: Record<string, any>;
}

export interface PaymentMetadata {
  property_id?: string;
  application_id?: string;
  subscription_id?: string;
  invoice_id?: string;
  contract_id?: string;
  user_agent?: string;
  ip_address?: string;
  device_fingerprint?: string;
  risk_score?: number;
  custom_fields?: Record<string, string>;
}

// Main Payment interface
export interface Payment extends BaseEntity {
  // Basic payment information
  amount: Money;
  type: PaymentType;
  status: PaymentStatus;
  description: string;
  reference_number: string;
  
  // Parties involved
  payer_id: string;
  payer?: User;
  payee_id: string;
  payee?: User;
  
  // Payment method and processing
  payment_method: PaymentMethod;
  payment_method_details?: PaymentMethodDetails;
  processor: PaymentProcessor;
  
  // Timing
  due_date?: string;
  paid_at?: string;
  processed_at?: string;
  
  // Related entities
  property_id?: string;
  property?: Property;
  application_id?: string;
  application?: Application;
  
  // Fees and adjustments
  platform_fee?: Money;
  processing_fee?: Money;
  tax_amount?: Money;
  discount_amount?: Money;
  net_amount: Money;
  
  // Metadata and tracking
  metadata: PaymentMetadata;
  notes?: string;
  receipt_url?: string;
  invoice_url?: string;
  
  // Failure and retry information
  failure_reason?: string;
  failure_code?: string;
  retry_count?: number;
  next_retry_at?: string;
  
  // Refund information
  refunded_amount?: Money;
  refund_reason?: RefundReason;
  refunded_at?: string;
  
  // Dispute information
  disputed: boolean;
  dispute_reason?: DisputeReason;
  dispute_amount?: Money;
  disputed_at?: string;
  dispute_resolved_at?: string;
}

// Subscription interfaces
export interface SubscriptionFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
  limit?: number;
  unlimited: boolean;
}

export interface SubscriptionPlanDetails {
  id: string;
  name: string;
  plan: PaymentSubscriptionPlan;
  description: string;
  price: Money;
  billing_frequency: PaymentFrequency;
  trial_period_days?: number;
  features: SubscriptionFeature[];
  max_properties?: number;
  max_applications?: number;
  priority_support: boolean;
  analytics_included: boolean;
  api_access: boolean;
}

export interface SubscriptionUsage {
  properties_used: number;
  properties_limit?: number;
  applications_used: number;
  applications_limit?: number;
  api_calls_used?: number;
  api_calls_limit?: number;
  storage_used?: number; // in MB
  storage_limit?: number;
  reset_date: string;
}

export interface Subscription extends BaseEntity {
  user_id: string;
  user?: User;
  plan: SubscriptionPlanDetails;
  status: PaymentSubscriptionStatus;
  
  // Billing information
  current_period_start: string;
  current_period_end: string;
  billing_cycle_anchor?: string;
  
  // Trial information
  trial_start?: string;
  trial_end?: string;
  
  // Payment information
  payment_method_id?: string;
  payment_method?: PaymentMethodDetails;
  next_payment_date?: string;
  last_payment_date?: string;
  
  // Usage tracking
  usage: SubscriptionUsage;
  
  // Cancellation
  cancelled_at?: string;
  cancel_at_period_end: boolean;
  cancellation_reason?: string;
  
  // Metadata
  metadata?: Record<string, string>;
  notes?: string;
}

// Payment creation and update interfaces
export interface CreatePaymentData {
  amount: Money;
  type: PaymentType;
  description: string;
  payer_id: string;
  payee_id: string;
  payment_method_id: string;
  due_date?: string;
  property_id?: string;
  application_id?: string;
  metadata?: PaymentMetadata;
  notes?: string;
}

export interface UpdatePaymentData extends Partial<CreatePaymentData> {
  id: string;
  status?: PaymentStatus;
}

// Payment search and filtering
export interface PaymentSearchFilters {
  status?: PaymentStatus[];
  type?: PaymentType[];
  payment_method?: PaymentMethod[];
  payer_id?: string;
  payee_id?: string;
  property_id?: string;
  application_id?: string;
  amount_range?: {
    min: number;
    max: number;
  };
  date_range?: {
    start: string;
    end: string;
  };
  due_date_range?: {
    start: string;
    end: string;
  };
  disputed?: boolean;
  refunded?: boolean;
  reference_number?: string;
}

export interface PaymentSearchOptions {
  sort_by?: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc' | 'due_date' | 'status';
  page?: number;
  limit?: number;
  include_payer?: boolean;
  include_payee?: boolean;
  include_property?: boolean;
}

export interface PaymentSearchResult {
  payments: Payment[];
  total_count: number;
  page: number;
  limit: number;
  has_more: boolean;
  filters_applied: PaymentSearchFilters;
  status_counts: Record<PaymentStatus, number>;
  total_amount: Money;
}

// Payment statistics and analytics
export interface PaymentStatistics {
  total_payments: number;
  total_amount: Money;
  by_status: Record<PaymentStatus, { count: number; amount: Money }>;
  by_type: Record<PaymentType, { count: number; amount: Money }>;
  by_method: Record<PaymentMethod, { count: number; amount: Money }>;
  average_payment_amount: Money;
  success_rate: number;
  failure_rate: number;
  refund_rate: number;
  dispute_rate: number;
  average_processing_time: number; // in minutes
}

export interface PaymentAnalytics {
  period: {
    start: string;
    end: string;
  };
  statistics: PaymentStatistics;
  trends: {
    payments_over_time: Array<{
      date: string;
      count: number;
      amount: Money;
    }>;
    success_rate_trend: Array<{
      date: string;
      rate: number;
    }>;
    method_popularity: Array<{
      method: PaymentMethod;
      percentage: number;
    }>;
  };
  insights: string[];
  recommendations: string[];
}

// Refund interfaces
export interface RefundRequest {
  payment_id: string;
  amount: Money;
  reason: RefundReason;
  description?: string;
  notify_customer: boolean;
}

export interface Refund extends BaseEntity {
  payment_id: string;
  payment?: Payment;
  amount: Money;
  reason: RefundReason;
  description?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processed_at?: string;
  processor_refund_id?: string;
  failure_reason?: string;
  metadata?: Record<string, any>;
}

// Invoice interfaces
export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: Money;
  total_price: Money;
  tax_rate?: number;
  tax_amount?: Money;
}

export interface Invoice extends BaseEntity {
  invoice_number: string;
  user_id: string;
  user?: User;
  property_id?: string;
  property?: Property;
  
  // Invoice details
  line_items: InvoiceLineItem[];
  subtotal: Money;
  tax_amount: Money;
  discount_amount?: Money;
  total_amount: Money;
  
  // Dates
  issue_date: string;
  due_date: string;
  paid_date?: string;
  
  // Status and payment
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  payment_id?: string;
  payment?: Payment;
  
  // Metadata
  notes?: string;
  pdf_url?: string;
  sent_at?: string;
  viewed_at?: string;
}

// Export utility types
export type PaymentFormData = CreatePaymentData;
export type PaymentUpdateFormData = UpdatePaymentData;
export type PaymentFilters = PaymentSearchFilters;
export type PaymentSortOption = PaymentSearchOptions['sort_by'];