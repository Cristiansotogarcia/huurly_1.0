// Test script to verify Cloudflare R2 configuration
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env file
config({ path: join(process.cwd(), '.env') });

// Manual environment variable check
const endpoint = process.env.VITE_CLOUDFLARE_R2_ENDPOINT || process.env.CLOUDFLARE_R2_ENDPOINT;
const accessKeyId = process.env.VITE_CLOUDFLARE_R2_ACCESS_KEY || process.env.CLOUDFLARE_R2_ACCESS_KEY;
const secretAccessKey = process.env.VITE_CLOUDFLARE_R2_SECRET_KEY || process.env.CLOUDFLARE_R2_SECRET_KEY;
const bucket = process.env.VITE_CLOUDFLARE_R2_BUCKET || process.env.CLOUDFLARE_R2_BUCKET;

console.log('=== Cloudflare R2 Configuration Test ===');
console.log('Environment file loaded:', '.env');
console.log('VITE_CLOUDFLARE_R2_ENDPOINT:', endpoint);
console.log('VITE_CLOUDFLARE_R2_ACCESS_KEY:', accessKeyId ? '***' + accessKeyId.slice(-4) : 'NOT SET');
console.log('VITE_CLOUDFLARE_R2_SECRET_KEY:', secretAccessKey ? '***' + secretAccessKey.slice(-4) : 'NOT SET');
console.log('VITE_CLOUDFLARE_R2_BUCKET:', bucket);

// Validate configuration
const missingVars = [];
if (!endpoint) missingVars.push('VITE_CLOUDFLARE_R2_ENDPOINT');
if (!accessKeyId) missingVars.push('VITE_CLOUDFLARE_R2_ACCESS_KEY');
if (!secretAccessKey) missingVars.push('VITE_CLOUDFLARE_R2_SECRET_KEY');
if (!bucket) missingVars.push('VITE_CLOUDFLARE_R2_BUCKET');

if (missingVars.length > 0) {
  console.error('❌ Missing Cloudflare R2 configuration:');
  missingVars.forEach(varName => console.error(`  - ${varName}`));
  console.error('\nPlease check your .env file contains:');
  console.error('VITE_CLOUDFLARE_R2_ENDPOINT=https://5c65d8c11ba2e5ee7face692ed22ad1c.eu.r2.cloudflarestorage.com');
  console.error('VITE_CLOUDFLARE_R2_ACCESS_KEY=a6339b9b54b193196a48f04cd3b08676');
  console.error('VITE_CLOUDFLARE_R2_SECRET_KEY=b5c114462876e91e7ede109a069209661fc3005edfbb148890e1dfcb2be86bb8');
  console.error('VITE_CLOUDFLARE_R2_BUCKET=documents');
  process.exit(1);
}

console.log('✅ All Cloudflare R2 configuration variables are set');
console.log('✅ Configuration valid for browser environment');
console.log('✅ Ready to test uploads in development server');

console.log('\n=== Next Steps ===');
console.log('1. Start development server: npm run dev');
console.log('2. Navigate to Huurder dashboard');
console.log('3. Test profile picture upload');
console.log('4. Test document upload');
console.log('5. Check Cloudflare R2 dashboard for uploaded files');
