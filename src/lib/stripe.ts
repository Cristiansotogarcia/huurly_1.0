import { loadStripe, Stripe } from '@stripe/stripe-js';
import { logger } from '../lib/logger.ts';

// Stripe configuration derived from environment variables
const publishableKey = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY) || process.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
export const STRIPE_CONFIG = {
  publishableKey,
};

// Server-side secrets (not exposed in the client bundle)
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

// Get publishable key for frontend
export const getStripePublishableKey = (): string => STRIPE_CONFIG.publishableKey;

// Initialize Stripe instance
let stripePromise: Promise<Stripe | null>;

export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const publishableKey = getStripePublishableKey();
    
    if (!publishableKey) {
       logger.error('Stripe publishable key not found');
      return Promise.resolve(null);
    }
    
    stripePromise = loadStripe(publishableKey);
  }
  
  return stripePromise;
};

// Get environment-configurable price IDs
const getStripeConfig = () => {
  const huurderPriceId = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_STRIPE_HUURDER_PRICE_ID) || 
                         process.env.VITE_STRIPE_HUURDER_PRICE_ID || 
                         'price_1QVFSSGadpjzVmLhDTISKngf'; // Default test price ID

  return {
    huurderPriceId
  };
};

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  huurder: {
    yearly: {
      priceId: getStripeConfig().huurderPriceId,
      name: 'Huurder Jaarlijks',
      price: 59.99, // Display price (excluding BTW)
      priceWithTax: 72.59, // Actual charge price (including 21% BTW)
      currency: 'eur',
      interval: 'jaar',
      taxRate: 0.21, // 21% BTW
      features: [
        'Zoeken naar woningen',
        'Profiel aanmaken',
        'Documenten uploaden',
        'Bezichtigingen aanvragen',
        'Matching algoritme',
        'Premium ondersteuning',
        'Onbeperkte zoekresultaten'
      ]
    }
  },
  verhuurder: {
    free: {
      priceId: null, // Free plan
      name: 'Verhuurder (Gratis)',
      price: 0,
      priceWithTax: 0,
      currency: 'eur',
      interval: 'lifetime',
      taxRate: 0,
      requiresApproval: true, // Requires Beheerder approval
      features: [
        'Woningen adverteren',
        'Huurder screening',
        'Bezichtigingen plannen',
        'Document verificatie',
        'Basis ondersteuning'
      ]
    }
  }
};

// Get plan by role and tier
export const getSubscriptionPlan = (role: 'huurder' | 'verhuurder', tier: 'basic' | 'premium') => {
  return SUBSCRIPTION_PLANS[role]?.[tier] || null;
};

// Format price for display
export const formatPrice = (price: number, currency: string = 'eur'): string => {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(price);
};

// Stripe webhook event types we handle
export const STRIPE_WEBHOOK_EVENTS = {
  CHECKOUT_SESSION_COMPLETED: 'checkout.session.completed',
  INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
  CUSTOMER_SUBSCRIPTION_CREATED: 'customer.subscription.created',
  CUSTOMER_SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  CUSTOMER_SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
} as const;

// Payment status mapping
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

// Subscription status mapping
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  CANCELLED: 'cancelled',
  PAST_DUE: 'past_due',
  UNPAID: 'unpaid',
  TRIALING: 'trialing',
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];
export type SubscriptionStatus = typeof SUBSCRIPTION_STATUS[keyof typeof SUBSCRIPTION_STATUS];
