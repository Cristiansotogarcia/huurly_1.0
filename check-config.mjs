import { readFileSync } from 'fs';
import { join } from 'path';

// Read .env file directly
const envContent = readFileSync(join(process.cwd(), '.env'), 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  if (line.includes('=') && !line.startsWith('#')) {
    const [key, value] = line.split('=');
    envVars[key.trim()] = value?.trim();
  }
});


// Check for missing variables
const missing = [];
if (!envVars.VITE_CLOUDFLARE_R2_ENDPOINT) missing.push('VITE_CLOUDFLARE_R2_ENDPOINT');
if (!envVars.VITE_CLOUDFLARE_R2_ACCESS_KEY) missing.push('VITE_CLOUDFLARE_R2_ACCESS_KEY');
if (!envVars.VITE_CLOUDFLARE_R2_SECRET_KEY) missing.push('VITE_CLOUDFLARE_R2_SECRET_KEY');
if (!envVars.VITE_CLOUDFLARE_R2_BUCKET) missing.push('VITE_CLOUDFLARE_R2_BUCKET');

if (missing.length > 0) {
  console.error('\n❌ Missing environment variables:', missing);
} else {
}

// Check if endpoint format is correct
if (envVars.VITE_CLOUDFLARE_R2_ENDPOINT) {
  const endpoint = envVars.VITE_CLOUDFLARE_R2_ENDPOINT;
  if (!endpoint.includes('r2.cloudflarestorage.com')) {
    console.warn('⚠️  Endpoint format might be incorrect');
  }
}
