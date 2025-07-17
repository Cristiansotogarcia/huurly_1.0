// Simple test script to verify Cloudflare R2 configuration
import { r2Client, R2_BUCKET, isR2ConfigValid } from './src/integrations/cloudflare/client.js';

console.log('=== Cloudflare R2 Configuration Test ===');
console.log('Configuration valid:', isR2ConfigValid);
console.log('R2_BUCKET:', R2_BUCKET);
console.log('r2Client initialized:', !!r2Client);

if (!isR2ConfigValid) {
  console.error('❌ Cloudflare R2 configuration is invalid');
  process.exit(1);
}

console.log('✅ Cloudflare R2 configuration appears valid');
