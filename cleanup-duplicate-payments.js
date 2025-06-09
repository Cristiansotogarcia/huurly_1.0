// Script to clean up duplicate payment records and fix the payment system
const SUPABASE_URL = 'https://lxtkotgfsnahwncgcfnl.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dGtvdGdmc25haHduY2djZm5sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAyNTgyOCwiZXhwIjoyMDY0NjAxODI4fQ.1GaDpXyyXqxBzQSu7Pu3xRpF0_Y5AoQcLRQsgHmIM9I';

async function cleanupDuplicatePayments() {
  console.log('🧹 Starting cleanup of duplicate payment records...');
  
  const userId = '1c655825-9713-4ecc-80e3-a77701914d3a';
  
  try {
    // Step 1: Get all payment records for the user
    console.log('\n📋 Fetching all payment records...');
    const response = await fetch(`${SUPABASE_URL}/rest/v1/payment_records?user_id=eq.${userId}&order=created_at.desc`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const allPayments = await response.json();
    console.log(`Found ${allPayments.length} payment records`);
    
    // Step 2: Identify completed and pending payments
    const completedPayments = allPayments.filter(p => p.status === 'completed');
    const pendingPayments = allPayments.filter(p => p.status === 'pending');
    
    console.log(`\n📊 Payment Status Breakdown:`);
    console.log(`✅ Completed: ${completedPayments.length}`);
    console.log(`⏳ Pending: ${pendingPayments.length}`);
    
    // Step 3: If we have completed payments, cancel all pending ones
    if (completedPayments.length > 0 && pendingPayments.length > 0) {
      console.log(`\n🔄 Cancelling ${pendingPayments.length} pending payment(s)...`);
      
      for (const pendingPayment of pendingPayments) {
        const cancelResponse = await fetch(`${SUPABASE_URL}/rest/v1/payment_records?id=eq.${pendingPayment.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
        });
        
        if (cancelResponse.ok) {
          console.log(`✅ Cancelled payment record: ${pendingPayment.id}`);
        } else {
          console.log(`❌ Failed to cancel payment record: ${pendingPayment.id}`);
        }
      }
    }
    
    // Step 4: Ensure user has active subscription status
    console.log(`\n👤 Checking user subscription status...`);
    const userRoleResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_roles?user_id=eq.${userId}`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const userRoles = await userRoleResponse.json();
    
    if (userRoles.length > 0) {
      const userRole = userRoles[0];
      console.log(`Current subscription status: ${userRole.subscription_status}`);
      
      if (completedPayments.length > 0 && userRole.subscription_status !== 'active') {
        console.log(`🔄 Updating subscription status to active...`);
        
        const updateRoleResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_roles?user_id=eq.${userId}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            subscription_status: 'active'
          })
        });
        
        if (updateRoleResponse.ok) {
          console.log(`✅ Subscription status updated to active`);
        } else {
          console.log(`❌ Failed to update subscription status`);
        }
      }
    }
    
    // Step 5: Final verification
    console.log(`\n🔍 Final verification...`);
    const finalResponse = await fetch(`${SUPABASE_URL}/rest/v1/payment_records?user_id=eq.${userId}&order=created_at.desc`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const finalPayments = await finalResponse.json();
    const finalCompleted = finalPayments.filter(p => p.status === 'completed').length;
    const finalPending = finalPayments.filter(p => p.status === 'pending').length;
    const finalCancelled = finalPayments.filter(p => p.status === 'cancelled').length;
    
    console.log(`\n📊 Final Payment Status:`);
    console.log(`✅ Completed: ${finalCompleted}`);
    console.log(`⏳ Pending: ${finalPending}`);
    console.log(`❌ Cancelled: ${finalCancelled}`);
    
    // Step 6: Check final user role status
    const finalUserRoleResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_roles?user_id=eq.${userId}`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const finalUserRoles = await finalUserRoleResponse.json();
    if (finalUserRoles.length > 0) {
      console.log(`👤 Final subscription status: ${finalUserRoles[0].subscription_status}`);
    }
    
    console.log(`\n🎉 Cleanup completed successfully!`);
    console.log(`💡 The payment modal should no longer appear for this user.`);
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

// Run the cleanup
cleanupDuplicatePayments();
