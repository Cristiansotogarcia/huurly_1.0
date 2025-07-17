import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testCloudflareFunction() {
  console.log('=== Testing Cloudflare R2 Function ===');
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !anonKey) {
    console.error('❌ Missing Supabase configuration. Please check your .env file.');
    process.exit(1);
  }
  
  try {
    // Test 1: Check if function responds to OPTIONS
    console.log('1. Testing OPTIONS request...');
    const optionsResponse = await fetch(`${supabaseUrl}/functions/v1/cloudflare-r2-upload`, {
      method: 'OPTIONS',
      headers: {
        'Authorization': `Bearer ${anonKey}`
      }
    });
    console.log('OPTIONS Response:', optionsResponse.status, await optionsResponse.text());

    // Test 2: Test with invalid method
    console.log('\n2. Testing GET request...');
    const getResponse = await fetch(`${supabaseUrl}/functions/v1/cloudflare-r2-upload`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('GET Response:', getResponse.status, await getResponse.text());

    // Test 3: Test with missing file
    console.log('\n3. Testing POST without file...');
    const formData = new FormData();
    formData.append('userId', 'test-user');
    
    const postResponse = await fetch(`${supabaseUrl}/functions/v1/cloudflare-r2-upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`
      },
      body: formData
    });
    console.log('POST Response:', postResponse.status, await postResponse.text());

    console.log('\n=== Function is responding correctly ===');
    
  } catch (error) {
    console.error('Error testing function:', error);
  }
}

testCloudflareFunction();
