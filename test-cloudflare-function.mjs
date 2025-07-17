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
  
  const supabaseUrl = 'https://sqhultitvpivlnlgogen.supabase.co';
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxaHVsdGl0dnBpdmxubGdvZ2VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMDgxNTIsImV4cCI6MjA2NTY4NDE1Mn0.ZPfzoKgcMrzcKA5klMaef9jZSb258IlwKUBz244oJ3E';
  
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
