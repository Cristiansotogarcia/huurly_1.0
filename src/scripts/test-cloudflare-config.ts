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


// Validate configuration
const missingVars = [];
if (!endpoint) missingVars.push('VITE_CLOUDFLARE_R2_ENDPOINT');
if (!accessKeyId) missingVars.push('VITE_CLOUDFLARE_R2_ACCESS_KEY');
if (!secretAccessKey) missingVars.push('VITE_CLOUDFLARE_R2_SECRET_KEY');
if (!bucket) missingVars.push('VITE_CLOUDFLARE_R2_BUCKET');

if (missingVars.length > 0) {
  console.error('❌ Missing Cloudflare R2 configuration:');
  missingVars.forEach(varName => console.error(`  - ${varName}`));
  console.error('\nPlease check your .env file contains the required variables:');
  console.error('VITE_CLOUDFLARE_R2_ENDPOINT=<your-r2-endpoint>');
  console.error('VITE_CLOUDFLARE_R2_ACCESS_KEY=<your-access-key>');
  console.error('VITE_CLOUDFLARE_R2_SECRET_KEY=<your-secret-key>');
  console.error('VITE_CLOUDFLARE_R2_BUCKET=<your-bucket-name>');
  process.exit(1);
}


