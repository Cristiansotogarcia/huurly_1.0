import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testCloudflareUpload() {
  console.log('=== Testing Cloudflare R2 Upload with File ===');
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !anonKey) {
    console.error('❌ Missing Supabase configuration. Please check your .env file.');
    process.exit(1);
  }
  
  try {
    // Create a simple test file (JPEG)
    const canvas = document ? document.createElement('canvas') : null;
    const testContent = 'Hello from Cloudflare R2 test! ' + new Date().toISOString();
    
    // Create a simple JPEG blob
    const jpegHeader = new Uint8Array([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
      0x00, 0x01, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
      0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
      0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20, 0x24, 0x2E, 0x27, 0x20,
      0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29, 0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27,
      0x39, 0x3D, 0x38, 0x32, 0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01,
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x09, 0xFF, 0xDA, 0x00, 0x08,
      0x01, 0x01, 0x00, 0x00, 0x3F, 0x00, 0x37, 0xFF, 0xD9
    ]);
    
    const testFile = new Blob([jpegHeader], { type: 'image/jpeg' });
    
    // Create FormData
    const formData = new FormData();
    formData.append('file', testFile, 'test-upload.jpg');
    formData.append('userId', 'test-user-123');
    formData.append('folder', 'test-uploads');
    
    console.log('Uploading test file...');
    console.log('File size:', testFile.size, 'bytes');
    console.log('File type:', testFile.type);
    
    const response = await fetch(`${supabaseUrl}/functions/v1/cloudflare-r2-upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`
      },
      body: formData
    });
    
    const result = await response.json();
    console.log('Upload Response:', response.status, result);
    
    if (response.ok && result.success) {
      console.log('\n✅ Upload successful!');
      console.log('File URL:', result.url);
      console.log('File Path:', result.path);
      
      // Test if the file is accessible
      console.log('\nTesting file accessibility...');
      const fileResponse = await fetch(result.url);
      console.log('File access:', fileResponse.status, fileResponse.ok ? '✅ Accessible' : '❌ Not accessible');
      
      if (fileResponse.ok) {
        const content = await fileResponse.text();
        console.log('File content matches:', content === testContent ? '✅ Yes' : '❌ No');
      }
    } else {
      console.log('\n❌ Upload failed:', result.error);
    }
    
  } catch (error) {
    console.error('Error testing upload:', error);
  }
}

testCloudflareUpload();
