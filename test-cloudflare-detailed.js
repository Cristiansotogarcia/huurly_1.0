// Detailed test script to verify Cloudflare R2 configuration
import { config } from 'dotenv';
config();

console.log('=== Cloudflare R2 Detailed Configuration Test ===');

// Check environment variables
const requiredVars = [
  'VITE_CLOUDFLARE_R2_ENDPOINT',
  'VITE_CLOUDFLARE_R2_ACCESS_KEY_ID',
  'VITE_CLOUDFLARE_R2_SECRET_KEY',
  'VITE_CLOUDFLARE_R2_BUCKET'
];

console.log('Environment variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  console.log(`${varName}: ${value ? '✅ Set' : '❌ Missing'}`);
});

// Test the actual client
import { r2Client, R2_BUCKET, isR2ConfigValid } from './src/integrations/cloudflare/client.js';

console.log('\n=== Client Configuration ===');
console.log('Configuration valid:', isR2ConfigValid);
console.log('R2_BUCKET:', R2_BUCKET);
console.log('r2Client initialized:', !!r2Client);

if (isR2ConfigValid && r2Client) {
  console.log('\n✅ Cloudflare R2 configuration is working correctly!');
} else {
  console.error('\n❌ Cloudflare R2 configuration has issues');
}
