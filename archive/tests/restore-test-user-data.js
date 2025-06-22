// Restore test user data that was deleted during database reset
const SUPABASE_URL = 'https://lxtkotgfsnahwncgcfnl.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

async function restoreTestUserData() {
  console.log('🔄 Restoring test user data...');
  
  try {
    const userId = '1c655825-9713-4ecc-80e3-a77701914d3a';
    
    // First, check if the user exists in auth.users
    console.log('\n🔍 Checking if user exists in auth.users...');
    const checkUserResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sql: `SELECT id FROM auth.users WHERE id = '${userId}';`
      })
    });
    
    if (checkUserResponse.ok) {
      const result = await checkUserResponse.json();
      console.log('User check result:', result);
      
      if (!result || result.length === 0) {
        console.log('⚠️ User does not exist in auth.users. Creating a mock user entry...');
        
        // Create a mock user in auth.users (this is a workaround)
        const createUserResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sql: `
              INSERT INTO auth.users (
                id, 
                email, 
                encrypted_password, 
                email_confirmed_at, 
                created_at, 
                updated_at,
                raw_app_meta_data,
                raw_user_meta_data,
                is_super_admin,
                role
              ) VALUES (
                '${userId}',
                'test@example.com',
                '$2a$10$dummy.encrypted.password.hash.for.testing.purposes.only',
                NOW(),
                NOW(),
                NOW(),
                '{"provider": "email", "providers": ["email"]}',
                '{"first_name": "Test", "last_name": "User"}',
                false,
                'authenticated'
              )
              ON CONFLICT (id) DO NOTHING;
            `
          })
        });
        
        if (createUserResponse.ok) {
          console.log('✅ Mock user created in auth.users');
        } else {
          console.log('⚠️ Could not create mock user:', await createUserResponse.text());
        }
      } else {
        console.log('✅ User already exists in auth.users');
      }
    }
    
    // Now insert the profile data
    console.log('\n📝 Inserting profile data...');
    const insertProfileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        id: userId,
        first_name: 'Test',
        last_name: 'User'
      })
    });
    
    if (insertProfileResponse.ok) {
      console.log('✅ Profile data restored');
    } else {
      console.log('⚠️ Profile insertion failed:', await insertProfileResponse.text());
    }
    
    // Insert user role
    console.log('\n📝 Inserting user role...');
    const insertUserRoleResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_roles`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        user_id: userId,
        role: 'Huurder',
        subscription_status: 'active'
      })
    });
    
    if (insertUserRoleResponse.ok) {
      console.log('✅ User role data restored');
    } else {
      console.log('⚠️ User role insertion failed:', await insertUserRoleResponse.text());
    }
    
    // Insert payment record
    console.log('\n📝 Inserting payment record...');
    const insertPaymentResponse = await fetch(`${SUPABASE_URL}/rest/v1/payment_records`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        user_id: userId,
        email: 'test@example.com',
        user_type: 'Huurder',
        stripe_session_id: 'cs_test_completed_session',
        stripe_payment_intent_id: 'pi_test_completed_payment',
        amount: 2500,
        currency: 'eur',
        status: 'completed',
        subscription_type: 'huurder_yearly'
      })
    });
    
    if (insertPaymentResponse.ok) {
      console.log('✅ Payment record data restored');
    } else {
      console.log('⚠️ Payment record insertion failed:', await insertPaymentResponse.text());
    }
    
    // Insert subscriber record
    console.log('\n📝 Inserting subscriber record...');
    const insertSubscriberResponse = await fetch(`${SUPABASE_URL}/rest/v1/subscribers`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        user_id: userId,
        email: 'test@example.com',
        subscribed: true,
        subscription_tier: 'huurder_yearly',
        subscription_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
      })
    });
    
    if (insertSubscriberResponse.ok) {
      console.log('✅ Subscriber record data restored');
    } else {
      console.log('⚠️ Subscriber record insertion failed:', await insertSubscriberResponse.text());
    }
    
    // Insert tenant profile
    console.log('\n📝 Inserting tenant profile...');
    const insertTenantProfileResponse = await fetch(`${SUPABASE_URL}/rest/v1/tenant_profiles`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        user_id: userId,
        first_name: 'Test',
        last_name: 'User',
        age: 30,
        employment_status: 'employed',
        monthly_income: 3000.00,
        max_rent: 1500.00,
        preferred_location: 'Amsterdam',
        household_size: 1,
        documents_verified: true
      })
    });
    
    if (insertTenantProfileResponse.ok) {
      console.log('✅ Tenant profile data restored');
    } else {
      console.log('⚠️ Tenant profile insertion failed:', await insertTenantProfileResponse.text());
    }
    
    console.log('\n🎉 Test user data restoration complete!');
    
    // Verify the data
    console.log('\n🔍 Verifying restored data...');
    
    const verifyResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_roles?user_id=eq.${userId}&select=role,subscription_status`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (verifyResponse.ok) {
      const data = await verifyResponse.json();
      console.log('✅ Verification successful - User role data:', data);
    } else {
      console.log('❌ Verification failed:', await verifyResponse.text());
    }
    
    const verifyPaymentResponse = await fetch(`${SUPABASE_URL}/rest/v1/payment_records?user_id=eq.${userId}&select=status,amount`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (verifyPaymentResponse.ok) {
      const paymentData = await verifyPaymentResponse.json();
      console.log('✅ Verification successful - Payment data:', paymentData);
    } else {
      console.log('❌ Payment verification failed:', await verifyPaymentResponse.text());
    }
    
  } catch (error) {
    console.error('❌ Error restoring test user data:', error);
  }
}

// Run the restoration
restoreTestUserData();
