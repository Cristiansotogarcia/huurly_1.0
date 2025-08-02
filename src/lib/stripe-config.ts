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
const validateConfig = (): { isValid: boolean; errors: string[]; details: Record<string, any> } => {
  const errors: string[] = [];
  const details: Record<string, any> = {};

  if (!STRIPE_CONFIG.publishableKey) {
    errors.push('Stripe publishable key is required (VITE_STRIPE_PUBLISHABLE_KEY)');
    details.missingPublishableKey = true;
  }

  if (!STRIPE_CONFIG.huurderPriceId) {
    errors.push('Stripe huurder price ID is required (VITE_STRIPE_HUURDER_PRICE_ID)');
    details.missingPriceId = true;
  }

  if (STRIPE_CONFIG.publishableKey && !STRIPE_CONFIG.publishableKey.startsWith('pk_')) {
    errors.push('Invalid Stripe publishable key format - must start with "pk_"');
    details.invalidKeyFormat = true;
    details.providedKey = STRIPE_CONFIG.publishableKey.substring(0, 10) + '...';
  }

  // Add debug info
  details.configStatus = {
    hasPublishableKey: !!STRIPE_CONFIG.publishableKey,
    hasPriceId: !!STRIPE_CONFIG.huurderPriceId,
    keyPrefix: STRIPE_CONFIG.publishableKey ? STRIPE_CONFIG.publishableKey.substring(0, 7) : 'none'
  };

  return {
    isValid: errors.length === 0,
    errors,
    details
  };
};

// Initialize Stripe instance
let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const validation = validateConfig();
    
    if (!validation.isValid) {
      logger.error('Stripe configuration errors:', {
        errors: validation.errors,
        details: validation.details
      });
      
      // In development, show more detailed error
      if (import.meta.env.DEV) { // Use import.meta.env.DEV
        console.error('❌ Stripe Configuration Failed:', validation);
      }
      
      return Promise.resolve(null);
    }
    
    logger.info('Initializing Stripe with publishable key:', STRIPE_CONFIG.publishableKey.substring(0, 10) + '...');
    stripePromise = loadStripe(STRIPE_CONFIG.publishableKey);
  }
  
  return stripePromise;
};

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  huurder: {
    halfyearly: {
      priceId: STRIPE_CONFIG.huurderPriceId,
      name: 'Huurder Halfjaarlijks',
      price: 53.72, // Display price (excluding BTW)
      priceWithTax: 65, // Actual charge price (including 21% BTW)
      currency: 'eur',
      interval: '6 maanden',
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

// Stripe webhook event types we handle
export const STRIPE_WEBHOOK_EVENTS = {
  CHECKOUT_SESSION_COMPLETED: 'checkout.session.completed',
  INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
  CUSTOMER_SUBSCRIPTION_CREATED: 'customer.subscription.created',
  CUSTOMER_SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  CUSTOMER_SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
} as const;

// Get plan by role and tier
// Note: 'basic' maps to 'free' for verhuurder, 'premium' maps to 'halfyearly' for huurder for now.
// This can be expanded if more tiers are introduced.
export const getSubscriptionPlan = (role: 'huurder' | 'verhuurder', tier: 'basic' | 'premium') => {
  if (role === 'huurder' && tier === 'premium') {
    return SUBSCRIPTION_PLANS.huurder.halfyearly;
  }
  if (role === 'verhuurder' && tier === 'basic') {
    return SUBSCRIPTION_PLANS.verhuurder.free;
  }
  return null;
};

// Log configuration in development
if (import.meta.env.DEV) { // Use import.meta.env.DEV
  const validation = validateConfig();
  if (validation.isValid) {
    logger.info('✅ Stripe configuration is valid', {
      priceId: STRIPE_CONFIG.huurderPriceId,
      keyPrefix: STRIPE_CONFIG.publishableKey.substring(0, 10) + '...'
    });
  } else {
    logger.error('❌ Stripe configuration errors:', {
      errors: validation.errors,
      details: validation.details,
      env: {
        VITE_STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? 'set' : 'missing',
        VITE_STRIPE_HUURDER_PRICE_ID: import.meta.env.VITE_STRIPE_HUURDER_PRICE_ID ? 'set' : 'missing'
      }
    });
  }
}
