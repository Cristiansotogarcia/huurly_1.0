/**
 * Centralized Stripe Configuration
 * Handles all Stripe-related configuration and initialization
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { logger } from './logger';

// Stripe configuration loaded from environment variables
export const STRIPE_CONFIG = {
  publishableKey:
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || import.meta.env.STRIPE_PUBLISHABLE_KEY || '',
  huurderPriceId:
    import.meta.env.VITE_STRIPE_HUURDER_PRICE_ID || import.meta.env.STRIPE_HUURDER_PRICE_ID || '',
};

// Validate configuration
const validateConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!STRIPE_CONFIG.publishableKey) {
    errors.push('Stripe publishable key is required');
  }

  if (!STRIPE_CONFIG.huurderPriceId) {
    errors.push('Stripe huurder price ID is required');
  }

  if (STRIPE_CONFIG.publishableKey && !STRIPE_CONFIG.publishableKey.startsWith('pk_')) {
    errors.push('Invalid Stripe publishable key format');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Initialize Stripe instance
let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const validation = validateConfig();
    
    if (!validation.isValid) {
      logger.error('Stripe configuration errors:', validation.errors);
      return Promise.resolve(null);
    }
    
    stripePromise = loadStripe(STRIPE_CONFIG.publishableKey);
  }
  
  return stripePromise;
};

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  huurder: {
    yearly: {
      priceId: STRIPE_CONFIG.huurderPriceId,
      name: 'Huurder Jaarlijks',
      price: 53.72, // Display price (excluding BTW)
      priceWithTax: 65, // Actual charge price (including 21% BTW)
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

// Format price for display
export const formatPrice = (price: number, currency: string = 'eur'): string => {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(price);
};

// Payment status constants
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

// Subscription status constants
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

// Log configuration in development
if (process.env.NODE_ENV === 'development') {
  const validation = validateConfig();
  if (validation.isValid) {
    logger.info('✅ Stripe configuration is valid');
  } else {
    logger.error('❌ Stripe configuration errors:', validation.errors);
  }
}
