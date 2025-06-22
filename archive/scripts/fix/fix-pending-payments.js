// Script to manually fix pending payment records
// This will simulate what the webhook should have done

const SUPABASE_URL = 'https://lxtkotgfsnahwncgcfnl.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

async function fixPendingPayments() {
  console.log('Starting to fix pending payment records...');
  
  // Get all pending payment records for the test user
  const userId = '1c655825-9713-4ecc-80e3-a77701914d3a';
  
  try {
    // First, let's get the latest pending payment record
    const response = await fetch(`${SUPABASE_URL}/rest/v1/payment_records?user_id=eq.${userId}&status=eq.pending&order=created_at.desc&limit=1`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const pendingPayments = await response.json();
    console.log('Found pending payments:', pendingPayments.length);
    
    if (pendingPayments.length > 0) {
      const latestPayment = pendingPayments[0];
      console.log('Latest pending payment:', latestPayment.id);
      
      // Update the payment record to completed
      const updatePaymentResponse = await fetch(`${SUPABASE_URL}/rest/v1/payment_records?id=eq.${latestPayment.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'completed',
          stripe_customer_id: 'cus_manual_fix',
          stripe_session_id: 'cs_manual_fix_' + Date.now(),
          updated_at: new Date().toISOString()
        })
      });
      
      if (updatePaymentResponse.ok) {
        console.log('✅ Payment record updated to completed');
        
        // Update user subscription status
        const updateUserResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_roles?user_id=eq.${userId}`, {
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
        
        if (updateUserResponse.ok) {
          console.log('✅ User subscription status updated to active');
          
          // Create success notification
          const notificationResponse = await fetch(`${SUPABASE_URL}/rest/v1/notifications`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              user_id: userId,
              type: 'payment_success',
              title: 'Betaling succesvol',
              message: 'Je jaarlijkse abonnement is geactiveerd. Je hebt nu toegang tot alle functies van Huurly.',
              read: false
            })
          });
          
          if (notificationResponse.ok) {
            console.log('✅ Success notification created');
          } else {
            console.log('❌ Failed to create notification');
          }
          
          console.log('🎉 Payment processing completed successfully!');
          console.log('The user should now have an active subscription.');
          
        } else {
          console.log('❌ Failed to update user subscription status');
        }
      } else {
        console.log('❌ Failed to update payment record');
      }
    } else {
      console.log('No pending payments found for user');
    }
    
  } catch (error) {
    console.error('Error fixing payments:', error);
  }
}

// Run the fix
fixPendingPayments();
