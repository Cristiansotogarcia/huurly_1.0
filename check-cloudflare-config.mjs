import { config } from 'dotenv';
import { readFileSync } from 'fs';

// Load environment variables
config();

console.log('=== Cloudflare R2 Configuration Check ===');
console.log('Endpoint:', process.env.VITE_CLOUDFLARE_R2_ENDPOINT);
console.log('Access Key:', process.env.VITE_CLOUDFLARE_R2_ACCESS_KEY_ID ? '***' + process.env.VITE_CLOUDFLARE_R2_ACCESS_KEY_ID.slice(-4) : 'NOT SET');
console.log('Secret Key:', process.env.VITE_CLOUDFLARE_R2_SECRET_KEY ? '***' + process.env.VITE_CLOUDFLARE_R2_SECRET_KEY.slice(-4) : 'NOT SET');
console.log('Bucket:', process.env.VITE_CLOUDFLARE_R2_BUCKET);
console.log('Region:', process.env.VITE_CLOUDFLARE_R2_REGION);

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

// Test the actual client configuration
console.log('\n=== Testing Client Configuration ===');
try {
  const clientCode = readFileSync('./src/integrations/cloudflare/client.ts', 'utf8');
  console.log('Client file found and readable');
  
  // Check if we can import the client
  const { execSync } = await import('child_process');
  try {
    const result = execSync('node -e "import(\'./src/integrations/cloudflare/client.ts\').then(m => console.log(JSON.stringify({valid: m.isR2ConfigValid, bucket: m.R2_BUCKET})))"', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log('Client import result:', result);
  } catch (error) {
    console.error('Error importing client:', error.message);
  }
} catch (error) {
  console.error('Error reading client file:', error.message);
}
