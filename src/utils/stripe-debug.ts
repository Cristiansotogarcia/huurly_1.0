/**
 * Stripe Debug Utility
 * Helps diagnose Stripe configuration and payment flow issues
 */

import { STRIPE_CONFIG, getStripe } from '@/lib/stripe-config';
import { logger } from '@/lib/logger';

export interface StripeDebugInfo {
  configuration: {
    hasPublishableKey: boolean;
    publishableKeyFormat: string;
    hasPriceId: boolean;
    priceId: string | null;
  };
  environment: {
    mode: string;
    origin: string;
    protocol: string;
  };
  stripeClient: {
    available: boolean;
    error?: string;
  };
}

export const getStripeDebugInfo = async (): Promise<StripeDebugInfo> => {
  const debugInfo: StripeDebugInfo = {
    configuration: {
      hasPublishableKey: !!STRIPE_CONFIG.publishableKey,
      publishableKeyFormat: STRIPE_CONFIG.publishableKey 
        ? `${STRIPE_CONFIG.publishableKey.substring(0, 7)}...${STRIPE_CONFIG.publishableKey.slice(-4)}`
        : 'not set',
      hasPriceId: !!STRIPE_CONFIG.huurderPriceId,
      priceId: STRIPE_CONFIG.huurderPriceId || null,
    },
    environment: {
      mode: process.env.NODE_ENV || 'unknown',
      origin: window.location.origin,
      protocol: window.location.protocol,
    },
    stripeClient: {
      available: false,
    },
  };

  // Test Stripe client initialization
  try {
    const stripe = await getStripe();
    debugInfo.stripeClient.available = !!stripe;
    if (!stripe) {
      debugInfo.stripeClient.error = 'Stripe client initialization returned null';
    }
  } catch (error) {
    debugInfo.stripeClient.available = false;
    debugInfo.stripeClient.error = error instanceof Error ? error.message : 'Unknown error';
  }

  return debugInfo;
};

export const logStripeDebugInfo = async (): Promise<void> => {
  const debugInfo = await getStripeDebugInfo();
  
  logger.info('🔍 Stripe Debug Information:', debugInfo);
  
  // Log warnings for common issues
  if (!debugInfo.configuration.hasPublishableKey) {
    logger.warn('⚠️ Stripe publishable key is missing. Set VITE_STRIPE_PUBLISHABLE_KEY in your .env file');
  }
  
  if (!debugInfo.configuration.hasPriceId) {
    logger.warn('⚠️ Stripe price ID is missing. Set VITE_STRIPE_HUURDER_PRICE_ID in your .env file');
  }
  
  if (debugInfo.configuration.publishableKeyFormat !== 'not set' && 
      !debugInfo.configuration.publishableKeyFormat.startsWith('pk_')) {
    logger.warn('⚠️ Stripe publishable key has invalid format. It should start with "pk_"');
  }
  
  if (!debugInfo.stripeClient.available) {
    logger.error('❌ Stripe client could not be initialized:', debugInfo.stripeClient.error);
  }
  
  if (debugInfo.environment.protocol !== 'https:' && 
      debugInfo.environment.mode === 'production') {
    logger.warn('⚠️ Running in production without HTTPS. Stripe may not work correctly.');
  }
};

// Auto-log debug info in development mode
if (process.env.NODE_ENV === 'development') {
  // Delay to ensure all modules are loaded
  setTimeout(() => {
    logStripeDebugInfo().catch(console.error);
  }, 1000);
}
