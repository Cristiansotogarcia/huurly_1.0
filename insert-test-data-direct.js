// Direct insertion of test data using REST API
const SUPABASE_URL = 'https://lxtkotgfsnahwncgcfnl.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dGtvdGdmc25haHduY2djZm5sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAyNTgyOCwiZXhwIjoyMDY0NjAxODI4fQ.1GaDpXyyXqxBzQSu7Pu3xRpF0_Y5AoQcLRQsgHmIM9I';

async function insertTestDataDirect() {
  console.log('🔄 Inserting test data directly into database...');
  
  try {
    // Test users data
    const testUsers = [
      {
        id: '1c655825-9713-4ecc-80e3-a77701914d3a',
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        role: 'Huurder'
      },
      {
        id: '2c655825-9713-4ecc-80e3-a77701914d3b',
        first_name: 'Jan',
        last_name: 'Verhuurder',
        email: 'verhuurder@example.com',
        role: 'Verhuurder'
      },
      {
        id: '3c655825-9713-4ecc-80e3-a77701914d3c',
        first_name: 'Marie',
        last_name: 'Beoordelaar',
        email: 'beoordelaar@example.com',
        role: 'Beoordelaar'
      },
      {
        id: '4c655825-9713-4ecc-80e3-a77701914d3d',
        first_name: 'Admin',
        last_name: 'Beheerder',
        email: 'beheerder@example.com',
        role: 'Beheerder'
      }
    ];

    // Insert profiles
    console.log('\n📝 Inserting profiles...');
    for (const user of testUsers) {
      const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name
        })
      });
      
      if (profileResponse.ok) {
        console.log(`✅ Profile created: ${user.first_name} ${user.last_name}`);
      } else {
        const error = await profileResponse.text();
        console.log(`⚠️ Profile creation failed for ${user.first_name}: ${error}`);
      }
    }

    // Insert user roles
    console.log('\n📝 Inserting user roles...');
    for (const user of testUsers) {
      const roleResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_roles`, {
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
          subscription_status: 'active',
          subscription_start_date: new Date().toISOString(),
          subscription_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        })
      });
      
      if (roleResponse.ok) {
        console.log(`✅ Role created: ${user.role} for ${user.first_name}`);
      } else {
        const error = await roleResponse.text();
        console.log(`⚠️ Role creation failed for ${user.first_name}: ${error}`);
      }
    }

    // Insert payment record for the Huurder
    console.log('\n📝 Inserting payment record...');
    const paymentResponse = await fetch(`${SUPABASE_URL}/rest/v1/payment_records`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        user_id: '1c655825-9713-4ecc-80e3-a77701914d3a',
        stripe_session_id: 'cs_test_completed_session',
        stripe_payment_intent_id: 'pi_test_completed_payment',
        amount: 6500, // €65.00 in cents
        currency: 'eur',
        status: 'completed',
        subscription_type: 'huurder_yearly',
        payment_method: 'card'
      })
    });
    
    if (paymentResponse.ok) {
      console.log('✅ Payment record created');
    } else {
      const error = await paymentResponse.text();
      console.log(`⚠️ Payment record creation failed: ${error}`);
    }

    // Insert subscriber record
    console.log('\n📝 Inserting subscriber record...');
    const subscriberResponse = await fetch(`${SUPABASE_URL}/rest/v1/subscribers`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        user_id: '1c655825-9713-4ecc-80e3-a77701914d3a',
        email: 'test@example.com',
        subscribed: true,
        subscription_tier: 'huurder_yearly',
        subscription_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      })
    });
    
    if (subscriberResponse.ok) {
      console.log('✅ Subscriber record created');
    } else {
      const error = await subscriberResponse.text();
      console.log(`⚠️ Subscriber record creation failed: ${error}`);
    }

    console.log('\n🎉 Test data insertion complete!');
    
    // Verify the data
    console.log('\n🔍 Verifying inserted data...');
    
    const verifyProfilesResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (verifyProfilesResponse.ok) {
      const profiles = await verifyProfilesResponse.json();
      console.log(`✅ Profiles verified: ${profiles.length} profiles found`);
      profiles.forEach(profile => {
        console.log(`   - ${profile.first_name} ${profile.last_name}`);
      });
    }
    
    const verifyRolesResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_roles?select=*`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (verifyRolesResponse.ok) {
      const roles = await verifyRolesResponse.json();
      console.log(`✅ Roles verified: ${roles.length} roles found`);
      roles.forEach(role => {
        console.log(`   - ${role.role}: ${role.subscription_status}`);
      });
    }
    
    const verifyPaymentsResponse = await fetch(`${SUPABASE_URL}/rest/v1/payment_records?select=*`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (verifyPaymentsResponse.ok) {
      const payments = await verifyPaymentsResponse.json();
      console.log(`✅ Payments verified: ${payments.length} payments found`);
      payments.forEach(payment => {
        console.log(`   - €${payment.amount/100} (${payment.status})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error inserting test data:', error);
  }
}

// Run the insertion
insertTestDataDirect();
