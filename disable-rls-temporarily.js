// Script to temporarily disable RLS to allow frontend access
const SUPABASE_URL = 'https://lxtkotgfsnahwncgcfnl.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dGtvdGdmc25haHduY2djZm5sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAyNTgyOCwiZXhwIjoyMDY0NjAxODI4fQ.1GaDpXyyXqxBzQSu7Pu3xRpF0_Y5AoQcLRQsgHmIM9I';

async function testDatabaseAccess() {
  console.log('🔍 Testing database access with service key...');
  
  const userId = '1c655825-9713-4ecc-80e3-a77701914d3a';
  
  try {
    // Test 1: Check if we can access user_roles with service key
    console.log('\n📋 Testing user_roles access...');
    const userRoleResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_roles?user_id=eq.${userId}&select=role,subscription_status`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (userRoleResponse.ok) {
      const roleData = await userRoleResponse.json();
      console.log('✅ user_roles accessible with service key:', roleData);
    } else {
      console.log('❌ user_roles not accessible:', userRoleResponse.status, await userRoleResponse.text());
    }
    
    // Test 2: Check if we can access profiles with service key
    console.log('\n📋 Testing profiles access...');
    const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=first_name,last_name`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log('✅ profiles accessible with service key:', profileData);
    } else {
      console.log('❌ profiles not accessible:', profileResponse.status, await profileResponse.text());
    }
    
    // Test 3: Check if we can access payment_records with service key
    console.log('\n📋 Testing payment_records access...');
    const paymentResponse = await fetch(`${SUPABASE_URL}/rest/v1/payment_records?user_id=eq.${userId}&select=status&limit=1`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (paymentResponse.ok) {
      const paymentData = await paymentResponse.json();
      console.log('✅ payment_records accessible with service key:', paymentData);
    } else {
      console.log('❌ payment_records not accessible:', paymentResponse.status, await paymentResponse.text());
    }
    
    console.log('\n💡 ANALYSIS:');
    console.log('The issue is that the frontend is using the anon key, but the tables have RLS enabled');
    console.log('without proper policies that allow anon access. We need to either:');
    console.log('1. Create proper RLS policies that work with authenticated users');
    console.log('2. Temporarily disable RLS for testing');
    console.log('3. Use the service key in the frontend (not recommended for production)');
    
  } catch (error) {
    console.error('❌ Error testing database access:', error);
  }
}

// Run the test
testDatabaseAccess();
