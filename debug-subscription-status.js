// Debug script to check subscription status in database
const SUPABASE_URL = 'https://lxtkotgfsnahwncgcfnl.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dGtvdGdmc25haHduY2djZm5sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAyNTgyOCwiZXhwIjoyMDY0NjAxODI4fQ.1GaDpXyyXqxBzQSu7Pu3xRpF0_Y5AoQcLRQsgHmIM9I';

async function debugSubscriptionStatus() {
  console.log('🔍 Debugging subscription status...');
  
  const userId = '1c655825-9713-4ecc-80e3-a77701914d3a';
  
  try {
    // Check user_roles table
    console.log('\n📋 Checking user_roles table...');
    const rolesResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_roles?user_id=eq.${userId}`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const userRoles = await rolesResponse.json();
    console.log('User roles:', JSON.stringify(userRoles, null, 2));
    
    // Check payment_records table
    console.log('\n💳 Checking payment_records table...');
    const paymentsResponse = await fetch(`${SUPABASE_URL}/rest/v1/payment_records?user_id=eq.${userId}&order=created_at.desc&limit=5`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const paymentRecords = await paymentsResponse.json();
    console.log('Recent payment records:', JSON.stringify(paymentRecords, null, 2));
    
    // Check if there are any completed payments
    const completedPayments = paymentRecords.filter(p => p.status === 'completed');
    console.log(`\n✅ Found ${completedPayments.length} completed payments`);
    
    // Check notifications
    console.log('\n🔔 Checking notifications...');
    const notificationsResponse = await fetch(`${SUPABASE_URL}/rest/v1/notifications?user_id=eq.${userId}&order=created_at.desc&limit=3`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const notifications = await notificationsResponse.json();
    console.log('Recent notifications:', JSON.stringify(notifications, null, 2));
    
    // Summary
    console.log('\n📊 SUMMARY:');
    console.log('='.repeat(50));
    
    if (userRoles.length > 0) {
      const role = userRoles[0];
      console.log(`👤 User Role: ${role.role}`);
      console.log(`📅 Subscription Status: ${role.subscription_status || 'NOT SET'}`);
      console.log(`🎯 Expected: subscription_status should be 'active'`);
      
      if (role.subscription_status === 'active') {
        console.log('✅ Subscription status is ACTIVE - payment modal should NOT show');
      } else {
        console.log('❌ Subscription status is NOT active - payment modal WILL show');
      }
    } else {
      console.log('❌ No user role found!');
    }
    
    console.log(`💰 Completed Payments: ${completedPayments.length}`);
    console.log(`🔔 Notifications: ${notifications.length}`);
    
  } catch (error) {
    console.error('❌ Error debugging subscription status:', error);
  }
}

// Run the debug
debugSubscriptionStatus();
