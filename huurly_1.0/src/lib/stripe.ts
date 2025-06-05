import { loadStripe, Stripe } from '@stripe/stripe-js';

// Environment configuration for Stripe keys
export const STRIPE_CONFIG = {
  // Sandbox/Test keys (default)
  test: {
    publishableKey: 'pk_test_51RVFSSGadpjzVmLhDTISKngfxbFZkvwC2ZnuGIoH6GOWGBXnrtL40bQhPMp5mXY3QRCEdc4oUYmQ8XP51hEIlTvi00Hjel2rmB',
    secretKey: 'sk_test_51RVFSSGadpjzVmLhpOgJLjgNBZxFDQCTnd92Id9GeZXQOpfuqpgLe2ShxNLmOh2jZxJ0GgBpIGTKqOkhc4iusUb800GWt9JLAu',
    webhookSecret: 'whsec_hRCeos1p0nxmE5TViRMxslpBXq66NOmO'
  },
  // Production keys (to be set manually when going live)
  production: {
    publishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || ''
  }
};

// Determine if we're in production based on environment
const isProduction = process.env.NODE_ENV === 'production' && 
                    process.env.VITE_STRIPE_PUBLISHABLE_KEY && 
                    process.env.STRIPE_SECRET_KEY;

// Get current configuration
export const getCurrentStripeConfig = () => {
  return isProduction ? STRIPE_CONFIG.production : STRIPE_CONFIG.test;
};

// Get publishable key for frontend
export const getStripePublishableKey = (): string => {
  const config = getCurrentStripeConfig();
  return config.publishableKey;
};

// Initialize Stripe instance
let stripePromise: Promise<Stripe | null>;

export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const publishableKey = getStripePublishableKey();
    
    if (!publishableKey) {
      console.error('Stripe publishable key not found');
      return Promise.resolve(null);
    }
    
    stripePromise = loadStripe(publishableKey);
  }
  
  return stripePromise;
};

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  huurder: {
    basic: {
      priceId: 'price_huurder_basic', // To be created in Stripe Dashboard
      name: 'Huurder Basis',
      price: 9.99,
      currency: 'eur',
      interval: 'month',
      features: [
        'Zoeken naar woningen',
        'Profiel aanmaken',
        'Documenten uploaden',
        'Bezichtigingen aanvragen',
        'Basis ondersteuning'
      ]
    },
    premium: {
      priceId: 'price_huurder_premium', // To be created in Stripe Dashboard
      name: 'Huurder Premium',
      price: 19.99,
      currency: 'eur',
      interval: 'month',
      features: [
        'Alle basis functies',
        'Prioriteit in zoekresultaten',
        'Geavanceerde filters',
        'Onbeperkte bezichtigingen',
        'Premium ondersteuning',
        'Matching algoritme'
      ]
    }
  },
  verhuurder: {
    basic: {
      priceId: 'price_verhuurder_basic', // To be created in Stripe Dashboard
      name: 'Verhuurder Basis',
      price: 29.99,
      currency: 'eur',
      interval: 'month',
      features: [
        'Tot 5 woningen adverteren',
        'Basis huurder screening',
        'Bezichtigingen plannen',
        'Document verificatie',
        'Basis ondersteuning'
      ]
    },
    premium: {
      priceId: 'price_verhuurder_premium', // To be created in Stripe Dashboard
      name: 'Verhuurder Premium',
      price: 49.99,
      currency: 'eur',
      interval: 'month',
      features: [
        'Onbeperkt woningen adverteren',
        'Geavanceerde huurder screening',
        'Prioriteit in zoekresultaten',
        'Uitgebreide analytics',
        'Premium ondersteuning',
        'Matching algoritme',
        'Bulk operaties'
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
