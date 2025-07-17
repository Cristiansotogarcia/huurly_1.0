// Simple test to verify Cloudflare R2 configuration
// Run with: node test-cloudflare-simple.js

require('dotenv').config();

console.log('=== Cloudflare R2 Configuration Check ===');
console.log('Endpoint:', process.env.VITE_CLOUDFLARE_R2_ENDPOINT);
console.log('Access Key:', process.env.VITE_CLOUDFLARE_R2_ACCESS_KEY_ID ? '***' + process.env.VITE_CLOUDFLARE_R2_ACCESS_KEY_ID.slice(-4) : 'NOT SET');
console.log('Secret Key:', process.env.VITE_CLOUDFLARE_R2_SECRET_KEY ? '***' + process.env.VITE_CLOUDFLARE_R2_SECRET_KEY.slice(-4) : 'NOT SET');
console.log('Bucket:', process.env.VITE_CLOUDFLARE_R2_BUCKET);

// Check for missing variables
const missing = [];
if (!process.env.VITE_CLOUDFLARE_R2_ENDPOINT) missing.push('VITE_CLOUDFLARE_R2_ENDPOINT');
if (!process.env.VITE_CLOUDFLARE_R2_ACCESS_KEY_ID) missing.push('VITE_CLOUDFLARE_R2_ACCESS_KEY_ID');
if (!process.env.VITE_CLOUDFLARE_R2_SECRET_KEY) missing.push('VITE_CLOUDFLARE_R2_SECRET_KEY');
if (!process.env.VITE_CLOUDFLARE_R2_BUCKET) missing.push('VITE_CLOUDFLARE_R2_BUCKET');

if (missing.length > 0) {
  console.error('\n❌ Missing environment variables:', missing);
} else {
  console.log('\n✅ All environment variables are configured');
}
