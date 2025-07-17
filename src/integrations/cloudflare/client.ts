import { S3Client } from '@aws-sdk/client-s3';

// Handle both browser and Node.js environments safely
const getEnvVar = (name: string): string | undefined => {
  try {
    // Browser environment (Vite)
    if (typeof window !== 'undefined' && import.meta?.env) {
      return import.meta.env[name] || import.meta.env[name.replace('VITE_', 'CLOUDFLARE_')];
    }
    // Node.js environment
    if (typeof process !== 'undefined' && process.env) {
      return process.env[name] || process.env[name.replace('VITE_', '')];
    }
  } catch (e) {
    // Fallback for environments where import.meta is not available
    return undefined;
  }
  return undefined;
};

const endpoint = getEnvVar('VITE_CLOUDFLARE_R2_ENDPOINT');
const accessKeyId = getEnvVar('VITE_CLOUDFLARE_R2_ACCESS_KEY_ID') || getEnvVar('VITE_CLOUDFLARE_R2_ACCESS_KEY');
const secretAccessKey = getEnvVar('VITE_CLOUDFLARE_R2_SECRET_KEY') || getEnvVar('VITE_CLOUDFLARE_R2_SECRET_ACCESS_KEY');
const bucket = getEnvVar('VITE_CLOUDFLARE_R2_BUCKET');
const region = getEnvVar('VITE_CLOUDFLARE_R2_REGION') || 'auto';

// Validate environment variables
const validateConfig = () => {
  const missingVars = [];
  if (!endpoint) missingVars.push('VITE_CLOUDFLARE_R2_ENDPOINT');
  if (!accessKeyId) missingVars.push('VITE_CLOUDFLARE_R2_ACCESS_KEY_ID');
  if (!secretAccessKey) missingVars.push('VITE_CLOUDFLARE_R2_SECRET_KEY');
  if (!bucket) missingVars.push('VITE_CLOUDFLARE_R2_BUCKET');
  
  if (missingVars.length > 0) {
    console.error('Missing Cloudflare R2 configuration:', missingVars);
    return false;
  }
  return true;
};

// Only create client if configuration is valid
let client: S3Client | null = null;
let configValid = false;

try {
  configValid = validateConfig();
  if (configValid && endpoint && accessKeyId && secretAccessKey) {
    client = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
      // Add additional configuration for better compatibility
      requestHandler: {
        requestTimeout: 30000,
      },
    });
  }
} catch (error) {
  console.error('Failed to initialize Cloudflare R2 client:', error);
}

export const r2Client = client;
export const R2_BUCKET = bucket || '';
export const R2_PUBLIC_BASE = configValid && endpoint && bucket ? `${endpoint}/${bucket}` : '';

// Export validation status for debugging
export const isR2ConfigValid = configValid;
