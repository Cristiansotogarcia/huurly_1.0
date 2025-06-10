// Disable RLS on user_roles table to fix infinite recursion
const SUPABASE_URL = 'https://lxtkotgfsnahwncgcfnl.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dGtvdGdmc25haHduY2djZm5sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAyNTgyOCwiZXhwIjoyMDY0NjAxODI4fQ.1GaDpXyyXqxBzQSu7Pu3xRpF0_Y5AoQcLRQsgHmIM9I';

async function disableUserRolesRLS() {
  console.log('🔧 Disabling RLS on user_roles table to fix infinite recursion...');
  
  try {
    // Use the PostgREST admin API to execute SQL directly
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/sql`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'params=single-object'
      },
      body: JSON.stringify({
        query: `
          -- Disable RLS on user_roles table
          ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
          
          -- Drop problematic policies
          DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
          DROP POLICY IF EXISTS "Users can update own role" ON user_roles;
          DROP POLICY IF EXISTS "Users can insert own role" ON user_roles;
          
          -- Return success message
          SELECT 'RLS disabled on user_roles' as result;
        `
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Successfully disabled RLS on user_roles:', result);
    } else {
      console.log('⚠️ Direct SQL approach failed:', await response.text());
      
      // Try alternative approach using metadata API
      console.log('\n🔄 Trying metadata API approach...');
      
      const metadataResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resource: {
            type: 'table',
            name: 'user_roles',
            schema: 'public'
          },
          configuration: {
            enable_rls: false
          }
        })
      });
      
      if (metadataResponse.ok) {
        console.log('✅ Successfully disabled RLS via metadata API');
      } else {
        console.log('❌ Metadata API also failed:', await metadataResponse.text());
      }
    }
    
    // Test if the fix worked
    console.log('\n🔍 Testing user_roles access after fix...');
    const testResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_roles?user_id=eq.1c655825-9713-4ecc-80e3-a77701914d3a&select=role,subscription_status`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (testResponse.ok) {
      const data = await testResponse.json();
      console.log('✅ user_roles access working with service key:', data);
    } else {
      console.log('❌ user_roles still not accessible:', await testResponse.text());
    }
    
    // Test with anon key
    console.log('\n🔍 Testing user_roles access with anon key...');
    const anonTestResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_roles?user_id=eq.1c655825-9713-4ecc-80e3-a77701914d3a&select=role,subscription_status`, {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dGtvdGdmc25haHduY2djZm5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMjU4MjgsImV4cCI6MjA2NDYwMTgyOH0.3ukJCXs7f1HOO7y7ZgfpnSIalolB1LYbFpRtLd6ZyNE',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dGtvdGdmc25haHduY2djZm5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMjU4MjgsImV4cCI6MjA2NDYwMTgyOH0.3ukJCXs7f1HOO7y7ZgfpnSIalolB1LYbFpRtLd6ZyNE`,
        'Content-Type': 'application/json'
      }
    });
    
    if (anonTestResponse.ok) {
      const anonData = await anonTestResponse.json();
      console.log('✅ user_roles access working with anon key:', anonData);
      console.log('🎉 Frontend should now work!');
    } else {
      console.log('❌ user_roles still not accessible with anon key:', await anonTestResponse.text());
    }
    
  } catch (error) {
    console.error('❌ Error disabling RLS:', error);
  }
}

// Run the fix
disableUserRolesRLS();
