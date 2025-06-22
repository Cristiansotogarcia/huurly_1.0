// Script to create missing user role record
const SUPABASE_URL = 'https://lxtkotgfsnahwncgcfnl.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

async function fixUserRole() {
  console.log('🔧 Creating missing user role...');
  
  const userId = '1c655825-9713-4ecc-80e3-a77701914d3a';
  
  try {
    // Create the missing user role record
    const createRoleResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_roles`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId,
        role: 'Huurder', // Database uses capitalized roles
        subscription_status: 'active' // Set to active since payment is completed
      })
    });
    
    if (createRoleResponse.ok) {
      console.log('✅ User role created successfully!');
      
      // Verify the creation
      const verifyResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_roles?user_id=eq.${userId}`, {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      const userRoles = await verifyResponse.json();
      console.log('✅ Verification - User roles:', JSON.stringify(userRoles, null, 2));
      
      if (userRoles.length > 0 && userRoles[0].subscription_status === 'active') {
        console.log('🎉 SUCCESS! User now has active subscription status.');
        console.log('💡 The payment modal should no longer appear when the user logs in.');
      }
      
    } else {
      const errorText = await createRoleResponse.text();
      console.log('❌ Failed to create user role:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error creating user role:', error);
  }
}

// Run the fix
fixUserRole();
