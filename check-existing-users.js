// Check what users exist in the database
const SUPABASE_URL = 'https://lxtkotgfsnahwncgcfnl.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dGtvdGdmc25haHduY2djZm5sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAyNTgyOCwiZXhwIjoyMDY0NjAxODI4fQ.1GaDpXyyXqxBzQSu7Pu3xRpF0_Y5AoQcLRQsgHmIM9I';

async function checkExistingUsers() {
  console.log('🔍 Checking existing users in the database...');
  
  try {
    // Check auth.users table
    console.log('\n📋 Checking auth.users table...');
    const authUsersResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sql: `SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 10;`
      })
    });
    
    if (authUsersResponse.ok) {
      const authUsers = await authUsersResponse.json();
      console.log('✅ Auth users found:', authUsers);
    } else {
      console.log('⚠️ Could not check auth.users:', await authUsersResponse.text());
    }
    
    // Check profiles table
    console.log('\n📋 Checking profiles table...');
    const profilesResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (profilesResponse.ok) {
      const profiles = await profilesResponse.json();
      console.log('✅ Profiles found:', profiles);
    } else {
      console.log('⚠️ Could not check profiles:', await profilesResponse.text());
    }
    
    // Check user_roles table
    console.log('\n📋 Checking user_roles table...');
    const userRolesResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_roles?select=*`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (userRolesResponse.ok) {
      const userRoles = await userRolesResponse.json();
      console.log('✅ User roles found:', userRoles);
    } else {
      console.log('⚠️ Could not check user_roles:', await userRolesResponse.text());
    }
    
    // Check payment_records table
    console.log('\n📋 Checking payment_records table...');
    const paymentRecordsResponse = await fetch(`${SUPABASE_URL}/rest/v1/payment_records?select=*`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (paymentRecordsResponse.ok) {
      const paymentRecords = await paymentRecordsResponse.json();
      console.log('✅ Payment records found:', paymentRecords);
    } else {
      console.log('⚠️ Could not check payment_records:', await paymentRecordsResponse.text());
    }
    
    console.log('\n💡 ANALYSIS:');
    console.log('If no users exist in auth.users, the application needs users to sign up normally.');
    console.log('The database schema and RLS policies are ready, but data will be created through normal app usage.');
    
  } catch (error) {
    console.error('❌ Error checking existing users:', error);
  }
}

// Run the check
checkExistingUsers();
