import { config } from 'dotenv';
import { readFileSync } from 'fs';

// Load environment variables
config();

const requiredVars = [
  'VITE_CLOUDFLARE_R2_ENDPOINT',
  'VITE_CLOUDFLARE_R2_ACCESS_KEY_ID',
  'VITE_CLOUDFLARE_R2_SECRET_KEY',
  'VITE_CLOUDFLARE_R2_BUCKET',
];

const missing = requiredVars.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error('\n❌ Missing environment variables:', missing);
} else {
  console.log('✅ All required Cloudflare environment variables are set.');
}

try {
  readFileSync('./src/integrations/cloudflare/client.ts', 'utf8');
  console.log('✅ Cloudflare client file is present.');
} catch (error) {
  console.error('Error reading client file:', error.message);
}
