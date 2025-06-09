// Test frontend authentication and database access
const SUPABASE_URL = 'https://lxtkotgfsnahwncgcfnl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dGtvdGdmc25haHduY2djZm5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMjU4MjgsImV4cCI6MjA2NDYwMTgyOH0.3ukJCXs7f1HOO7y7ZgfpnSIalolB1LYbFpRtLd6ZyNE';

async function testFrontendAuth() {
  console.log('🔍 Testing frontend authentication and database access...');
  
  const userId = '1c655825-9713-4ecc-80e3-a77701914d3a';
  
  try {
    // Test 1: Try to access user_roles with anon key (this should fail with RLS)
    console.log('\n📋 Testing user_roles access with anon key...');
    const userRoleResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_roles?user_id=eq.${userId}&select=role,subscription_status`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (userRoleResponse.ok) {
      const roleData = await userRoleResponse.json();
      console.log('✅ user_roles accessible with anon key:', roleData);
    } else {
      console.log('❌ user_roles not accessible with anon key:', userRoleResponse.status, await userRoleResponse.text());
    }
    
    // Test 2: Try to access profiles with anon key
    console.log('\n📋 Testing profiles access with anon key...');
    const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=first_name,last_name`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log('✅ profiles accessible with anon key:', profileData);
    } else {
      console.log('❌ profiles not accessible with anon key:', profileResponse.status, await profileResponse.text());
    }
    
    // Test 3: Try to access payment_records with anon key
    console.log('\n📋 Testing payment_records access with anon key...');
    const paymentResponse = await fetch(`${SUPABASE_URL}/rest/v1/payment_records?user_id=eq.${userId}&select=status&limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (paymentResponse.ok) {
      const paymentData = await paymentResponse.json();
      console.log('✅ payment_records accessible with anon key:', paymentData);
    } else {
      console.log('❌ payment_records not accessible with anon key:', paymentResponse.status, await paymentResponse.text());
    }
    
    console.log('\n💡 ANALYSIS:');
    console.log('If all tables return 403 Forbidden, then RLS is working correctly');
    console.log('but the frontend needs to authenticate users properly.');
    console.log('If tables are accessible, then RLS policies need to be fixed.');
    
  } catch (error) {
    console.error('❌ Error testing frontend auth:', error);
  }
}

// Run the test
testFrontendAuth();
