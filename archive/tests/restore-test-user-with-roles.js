// Restore test user data with proper Dutch roles
const SUPABASE_URL = 'https://lxtkotgfsnahwncgcfnl.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

async function restoreTestUserWithRoles() {
  console.log('🔄 Restoring test user data with proper Dutch roles...');
  
  try {
    const userId = '1c655825-9713-4ecc-80e3-a77701914d3a';
    
    // First, create the user in auth.users table using service role
    console.log('\n📝 Creating user in auth.users table...');
    const createAuthUserResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
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
          ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            updated_at = NOW();
        `
      })
    });
    
    if (createAuthUserResponse.ok) {
      console.log('✅ Auth user created/updated');
    } else {
      console.log('⚠️ Auth user creation failed:', await createAuthUserResponse.text());
    }
    
    // Insert profile with proper data
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
        last_name: 'User',
        email: 'test@example.com',
        phone: '+31612345678'
      })
    });
    
    if (insertProfileResponse.ok) {
      console.log('✅ Profile data restored');
    } else {
      console.log('⚠️ Profile insertion failed:', await insertProfileResponse.text());
    }
    
    // Insert user role with Dutch role format
    console.log('\n📝 Inserting user role with Dutch format...');
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
        role: 'Huurder', // Dutch format as found in the codebase
        subscription_status: 'active',
        subscription_start_date: new Date().toISOString(),
        subscription_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
      })
    });
    
    if (insertUserRoleResponse.ok) {
      console.log('✅ User role data restored with Dutch format');
    } else {
      console.log('⚠️ User role insertion failed:', await insertUserRoleResponse.text());
    }
    
    // Insert payment record with proper subscription type
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
        user_type: 'Huurder', // Dutch format
        stripe_session_id: 'cs_test_completed_session',
        stripe_payment_intent_id: 'pi_test_completed_payment',
        amount: 6500, // €65.00 in cents (as found in create-checkout-session)
        currency: 'eur',
        status: 'completed',
        subscription_type: 'huurder_yearly', // As found in the codebase
        payment_method: 'card'
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
        subscription_start: new Date().toISOString(),
        subscription_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      })
    });
    
    if (insertSubscriberResponse.ok) {
      console.log('✅ Subscriber record data restored');
    } else {
      console.log('⚠️ Subscriber record insertion failed:', await insertSubscriberResponse.text());
    }
    
    // Insert tenant profile (since role is Huurder)
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
        monthly_income: 4500.00, // As found in payslip simulation
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
    
    // Create additional test users with different roles
    console.log('\n📝 Creating additional test users with different roles...');
    
    const additionalUsers = [
      {
        id: '2c655825-9713-4ecc-80e3-a77701914d3b',
        email: 'verhuurder@example.com',
        name: 'Jan Verhuurder',
        role: 'Verhuurder'
      },
      {
        id: '3c655825-9713-4ecc-80e3-a77701914d3c',
        email: 'beoordelaar@example.com',
        name: 'Marie Beoordelaar',
        role: 'Beoordelaar'
      },
      {
        id: '4c655825-9713-4ecc-80e3-a77701914d3d',
        email: 'beheerder@example.com',
        name: 'Admin Beheerder',
        role: 'Beheerder'
      }
    ];
    
    for (const user of additionalUsers) {
      // Create auth user
      await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sql: `
            INSERT INTO auth.users (
              id, email, encrypted_password, email_confirmed_at, 
              created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
              is_super_admin, role
            ) VALUES (
              '${user.id}', '${user.email}', 
              '$2a$10$dummy.encrypted.password.hash.for.testing.purposes.only',
              NOW(), NOW(), NOW(),
              '{"provider": "email", "providers": ["email"]}',
              '{"first_name": "${user.name.split(' ')[0]}", "last_name": "${user.name.split(' ')[1]}"}',
              false, 'authenticated'
            ) ON CONFLICT (id) DO NOTHING;
          `
        })
      });
      
      // Create profile
      await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          id: user.id,
          first_name: user.name.split(' ')[0],
          last_name: user.name.split(' ')[1],
          email: user.email
        })
      });
      
      // Create user role
      await fetch(`${SUPABASE_URL}/rest/v1/user_roles`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          user_id: user.id,
          role: user.role,
          subscription_status: user.role === 'Verhuurder' ? 'active' : 'inactive'
        })
      });
      
      console.log(`✅ Created ${user.role}: ${user.name}`);
    }
    
    console.log('\n🎉 Test user data restoration complete with proper Dutch roles!');
    
    // Verify the data
    console.log('\n🔍 Verifying restored data...');
    
    const verifyResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_roles?select=*`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (verifyResponse.ok) {
      const data = await verifyResponse.json();
      console.log('✅ Verification successful - User roles data:');
      data.forEach(role => {
        console.log(`   - ${role.role}: ${role.subscription_status}`);
      });
    } else {
      console.log('❌ Verification failed:', await verifyResponse.text());
    }
    
    const verifyPaymentResponse = await fetch(`${SUPABASE_URL}/rest/v1/payment_records?select=*`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (verifyPaymentResponse.ok) {
      const paymentData = await verifyPaymentResponse.json();
      console.log('✅ Verification successful - Payment data:');
      paymentData.forEach(payment => {
        console.log(`   - ${payment.user_type}: €${payment.amount/100} (${payment.status})`);
      });
    } else {
      console.log('❌ Payment verification failed:', await verifyPaymentResponse.text());
    }
    
  } catch (error) {
    console.error('❌ Error restoring test user data:', error);
  }
}

// Run the restoration
restoreTestUserWithRoles();
