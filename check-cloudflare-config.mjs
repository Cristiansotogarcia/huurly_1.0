import { config } from 'dotenv';
import { readFileSync } from 'fs';

// Load environment variables
config();


// Check for missing variables
const missing = [];
if (!process.env.VITE_CLOUDFLARE_R2_ENDPOINT) missing.push('VITE_CLOUDFLARE_R2_ENDPOINT');
if (!process.env.VITE_CLOUDFLARE_R2_ACCESS_KEY_ID) missing.push('VITE_CLOUDFLARE_R2_ACCESS_KEY_ID');
if (!process.env.VITE_CLOUDFLARE_R2_SECRET_KEY) missing.push('VITE_CLOUDFLARE_R2_SECRET_KEY');
if (!process.env.VITE_CLOUDFLARE_R2_BUCKET) missing.push('VITE_CLOUDFLARE_R2_BUCKET');

if (missing.length > 0) {
  console.error('\n❌ Missing environment variables:', missing);
} else {
}

// Test the actual client configuration
try {
  const clientCode = readFileSync('./src/integrations/cloudflare/client.ts', 'utf8');
  
  // Check if we can import the client
  const { execSync } = await import('child_process');
  try {
      encoding: 'utf8',
      stdio: 'pipe'
    });
  } catch (error) {
    console.error('Error importing client:', error.message);
  }
} catch (error) {
  console.error('Error reading client file:', error.message);
}
