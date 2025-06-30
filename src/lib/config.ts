/**
 * Centralized configuration management
 * Handles environment variables and application settings
 */
import { logger } from './logger';
import { getEnvVar, isBrowser } from './env';

export interface AppConfig {
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
    baseUrl: string;
  };
  supabase: {
    url: string;
    anonKey: string;
  };
  stripe: {
    publishableKey: string;
    webhookSecret?: string;
  };
  storage: {
    maxFileSize: number;
    allowedFileTypes: string[];
    bucketName: string;
  };
  features: {
    enableDemo: boolean;
    enablePayments: boolean;
    enableNotifications: boolean;
    enableAnalytics: boolean;
  };
  ui: {
    itemsPerPage: number;
    maxSearchResults: number;
    debounceDelay: number;
  };
  validation: {
    minPasswordLength: number;
    maxFileSize: number;
    allowedImageTypes: string[];
    allowedDocumentTypes: string[];
  };
}

// Default configuration
const defaultConfig: AppConfig = {
  app: {
    name: 'Huurly',
    version: '1.0.0',
    environment: 'development',
    baseUrl: 'http://localhost:5173'
  },
  supabase: {
    url: '',
    anonKey: ''
  },
  stripe: {
    publishableKey: ''
  },
  storage: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
    bucketName: 'documents'
  },
  features: {
    enableDemo: false,
    enablePayments: true,
    enableNotifications: true,
    enableAnalytics: true
  },
  ui: {
    itemsPerPage: 20,
    maxSearchResults: 100,
    debounceDelay: 300
  },
  validation: {
    minPasswordLength: 8,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedImageTypes: ['jpg', 'jpeg', 'png', 'webp'],
    allowedDocumentTypes: ['pdf', 'doc', 'docx']
  }
};

// Environment variable mapping
function getEnvironmentConfig(): Partial<AppConfig> {
  return {
    app: {
      name: getEnvVar('VITE_APP_NAME') || defaultConfig.app.name,
      version: getEnvVar('VITE_APP_VERSION') || defaultConfig.app.version,
      environment: (getEnvVar('VITE_APP_ENV') as any) || defaultConfig.app.environment,
      baseUrl: getEnvVar('VITE_APP_BASE_URL') || defaultConfig.app.baseUrl
    },
    supabase: {
      url: getEnvVar('VITE_SUPABASE_URL') || getEnvVar('SUPABASE_URL') || '',
      anonKey:
        getEnvVar('VITE_SUPABASE_ANON_KEY') || getEnvVar('SUPABASE_ANON_KEY') || ''
    },
    stripe: {
      publishableKey:
        getEnvVar('VITE_STRIPE_PUBLISHABLE_KEY') || getEnvVar('STRIPE_PUBLISHABLE_KEY') || '',
      webhookSecret: getEnvVar('STRIPE_WEBHOOK_SECRET')
    },
    features: {
      enableDemo: getEnvVar('VITE_ENABLE_DEMO') === 'true',
      enablePayments: getEnvVar('VITE_ENABLE_PAYMENTS') !== 'false',
      enableNotifications: getEnvVar('VITE_ENABLE_NOTIFICATIONS') !== 'false',
      enableAnalytics: getEnvVar('VITE_ENABLE_ANALYTICS') === 'true'
    }
  };
}

// Merge default config with environment config
function createConfig(): AppConfig {
  const envConfig = getEnvironmentConfig();
  
  return {
    ...defaultConfig,
    ...envConfig,
    app: { ...defaultConfig.app, ...envConfig.app },
    supabase: { ...defaultConfig.supabase, ...envConfig.supabase },
    stripe: { ...defaultConfig.stripe, ...envConfig.stripe },
    features: { ...defaultConfig.features, ...envConfig.features }
  };
}

// Export the configuration
export const config = createConfig();

// Configuration validation
export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required environment variables
  if (!config.supabase.url) {
    errors.push('SUPABASE_URL is required');
  }

  if (!config.supabase.anonKey) {
    errors.push('SUPABASE_ANON_KEY is required');
  }

  if (config.features.enablePayments && !config.stripe.publishableKey) {
    errors.push('STRIPE_PUBLISHABLE_KEY is required when payments are enabled');
  }

  // Validate URLs
  try {
    new URL(config.supabase.url);
  } catch {
    if (config.supabase.url) {
      errors.push('SUPABASE_URL must be a valid URL');
    }
  }

  try {
    new URL(config.app.baseUrl);
  } catch {
    errors.push('VITE_APP_BASE_URL must be a valid URL');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Helper functions for common config access
export const getConfig = {
  isDevelopment: () => config.app.environment === 'development',
  isProduction: () => config.app.environment === 'production',
  isStaging: () => config.app.environment === 'staging',
  
  supabaseUrl: () => config.supabase.url,
  supabaseKey: () => config.supabase.anonKey,
  
  stripeKey: () => config.stripe.publishableKey,
  
  maxFileSize: () => config.storage.maxFileSize,
  allowedFileTypes: () => config.storage.allowedFileTypes,
  
  itemsPerPage: () => config.ui.itemsPerPage,
  debounceDelay: () => config.ui.debounceDelay,
  
  isFeatureEnabled: (feature: keyof AppConfig['features']) => config.features[feature]
};

// Constants derived from config
export const CONSTANTS = {
  // File upload
  MAX_FILE_SIZE: config.storage.maxFileSize,
  ALLOWED_FILE_TYPES: config.storage.allowedFileTypes,
  ALLOWED_IMAGE_TYPES: config.validation.allowedImageTypes,
  ALLOWED_DOCUMENT_TYPES: config.validation.allowedDocumentTypes,
  
  // UI
  ITEMS_PER_PAGE: config.ui.itemsPerPage,
  MAX_SEARCH_RESULTS: config.ui.maxSearchResults,
  DEBOUNCE_DELAY: config.ui.debounceDelay,
  
  // Validation
  MIN_PASSWORD_LENGTH: config.validation.minPasswordLength,
  
  // Dutch provinces for dropdowns
  PROVINCES: [
    'Noord-Holland',
    'Zuid-Holland', 
    'Utrecht',
    'Gelderland',
    'Noord-Brabant',
    'Overijssel',
    'Limburg',
    'Groningen',
    'Friesland',
    'Drenthe',
    'Flevoland',
    'Zeeland'
  ],
  
  // Property types
  PROPERTY_TYPES: [
    'Appartement',
    'Huis',
    'Studio',
    'Kamer',
    'Penthouse'
  ],
  
  // Document types
  DOCUMENT_TYPES: [
    { value: 'identity', label: 'Identiteitsbewijs' },
    { value: 'payslip', label: 'Loonstrook' },
    { value: 'employment', label: 'Arbeidscontract' },
    { value: 'reference', label: 'Referentie' }
  ],
  
  // User roles
  USER_ROLES: [
    { value: 'huurder', label: 'Huurder' },
    { value: 'verhuurder', label: 'Verhuurder' },
    { value: 'beoordelaar', label: 'Beoordelaar' },
    { value: 'beheerder', label: 'Beheerder' }
  ],
  
  // Status options
  VIEWING_STATUSES: [
    { value: 'pending', label: 'In afwachting' },
    { value: 'accepted', label: 'Geaccepteerd' },
    { value: 'rejected', label: 'Afgewezen' },
    { value: 'expired', label: 'Verlopen' },
    { value: 'cancelled', label: 'Geannuleerd' },
    { value: 'completed', label: 'Voltooid' }
  ],
  
  DOCUMENT_STATUSES: [
    { value: 'pending', label: 'In behandeling' },
    { value: 'approved', label: 'Goedgekeurd' },
    { value: 'rejected', label: 'Afgewezen' }
  ],
  
  PROPERTY_STATUSES: [
    { value: 'active', label: 'Actief' },
    { value: 'inactive', label: 'Inactief' },
    { value: 'rented', label: 'Verhuurd' }
  ]
} as const;

// Type exports for better TypeScript support
export type Environment = AppConfig['app']['environment'];
export type UserRole = typeof CONSTANTS.USER_ROLES[number]['value'];
export type DocumentType = typeof CONSTANTS.DOCUMENT_TYPES[number]['value'];
export type PropertyType = typeof CONSTANTS.PROPERTY_TYPES[number];
export type Province = typeof CONSTANTS.PROVINCES[number];

// Development helpers
if (getConfig.isDevelopment()) {
  // Log configuration in development
   logger.info('🔧 Huurly Configuration:', config);
  
  // Validate configuration
  const validation = validateConfig();
  if (!validation.isValid) {
     logger.error('❌ Configuration errors:', validation.errors);
  } else {
     logger.info('✅ Configuration is valid');
  }
  
  // Make config available globally for debugging when in the browser
  if (isBrowser) {
    (window as any).__HUURLY_CONFIG__ = config;
  }
}
