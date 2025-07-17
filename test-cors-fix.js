// Test script to verify CORS configuration
// Run this in browser console on localhost:8080

async function testCORS() {
  const endpoint = 'https://5c65d8c11ba2e5ee7face692ed22ad1c.eu.r2.cloudflarestorage.com';
  const bucket = 'documents';
  const testKey = 'test-cors-' + Date.now() + '.txt';
  
  try {
    // Test preflight request
    const response = await fetch(`${endpoint}/${bucket}/${testKey}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'text/plain',
        'x-amz-content-sha256': 'UNSIGNED-PAYLOAD'
      },
      body: 'test',
      mode: 'cors'
    });
    
    console.log('CORS Test Result:', response.ok ? '✅ SUCCESS' : '❌ FAILED');
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    
  } catch (error) {
    console.error('❌ CORS Error:', error.message);
    console.log('💡 Solution: Configure CORS in Cloudflare R2 dashboard');
  }
}

// Run the test
testCORS();
