// Test script to check Nominatim API accessibility
// Run this in the browser console to test the API

async function testNominatimAPI() {
  console.log('🧪 Testing Nominatim API...');
  
  const testQuery = 'Amsterdam';
  const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=nl&limit=5&q=${encodeURIComponent(testQuery)}&addressdetails=1`;
  
  console.log('🌐 Testing URL:', url);
  
  try {
    // Test without User-Agent
    console.log('📡 Testing without User-Agent...');
    const response1 = await fetch(url);
    console.log('✅ Response 1 status:', response1.status);
    
    if (response1.ok) {
      const data1 = await response1.json();
      console.log('✅ Response 1 data:', data1);
      return data1;
    }
  } catch (error) {
    console.log('❌ Error without User-Agent:', error);
  }
  
  try {
    // Test with User-Agent
    console.log('📡 Testing with User-Agent...');
    const response2 = await fetch(url, {
      headers: {
        'User-Agent': 'Huurly/1.0 (https://huurly.nl)'
      }
    });
    console.log('✅ Response 2 status:', response2.status);
    
    if (response2.ok) {
      const data2 = await response2.json();
      console.log('✅ Response 2 data:', data2);
      return data2;
    }
  } catch (error) {
    console.log('❌ Error with User-Agent:', error);
  }
  
  try {
    // Test with different headers
    console.log('📡 Testing with additional headers...');
    const response3 = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8'
      }
    });
    console.log('✅ Response 3 status:', response3.status);
    
    if (response3.ok) {
      const data3 = await response3.json();
      console.log('✅ Response 3 data:', data3);
      return data3;
    }
  } catch (error) {
    console.log('❌ Error with additional headers:', error);
  }
  
  console.log('❌ All API tests failed');
  return null;
}

// Run the test
testNominatimAPI();

// Also test CORS specifically
console.log('🔒 Testing CORS...');
fetch('https://nominatim.openstreetmap.org/search?format=json&q=test')
  .then(response => {
    console.log('🔒 CORS test response:', response.status);
    console.log('🔒 CORS headers:', Object.fromEntries(response.headers.entries()));
  })
  .catch(error => {
    console.log('🔒 CORS test error:', error);
  });