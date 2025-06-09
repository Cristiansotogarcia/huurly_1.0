// Detailed test to check the exact error from Edge Function
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lxtkotgfsnahwncgcfnl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dGtvdGdmc25haHduY2djZm5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMjU4MjgsImV4cCI6MjA2NDYwMTgyOH0.3ukJCXs7f1HOO7y7ZgfpnSIalolB1LYbFpRtLd6ZyNE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPaymentDetailed() {
  try {
    console.log('Testing create-checkout-session with detailed error info...');
    
    // First, let's try to get a user token (simulate real authentication)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'cristiansotogarcia@gmail.com',
      password: 'Admin123@@'
    });

    if (authError) {
      console.error('Auth Error:', authError);
      return;
    }

    console.log('Authentication successful, user ID:', authData.user.id);

    // Now test the Edge Function with proper auth
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        priceId: 'price_1RXr0rGadpjzVmLhApRe12j2',
        userId: authData.user.id,
        userEmail: authData.user.email,
        paymentRecordId: 'test-payment-id',
        successUrl: 'http://localhost:8081/huurder-dashboard?payment=success',
        cancelUrl: 'http://localhost:8081/huurder-dashboard?payment=cancelled'
      }
    });

    if (error) {
      console.error('Edge Function Error Details:');
      console.error('- Status:', error.context?.status);
      console.error('- Status Text:', error.context?.statusText);
      console.error('- Message:', error.message);
      
      // Try to get the response body for more details
      if (error.context?.body) {
        try {
          const reader = error.context.body.getReader();
          const { value } = await reader.read();
          const responseText = new TextDecoder().decode(value);
          console.error('- Response Body:', responseText);
        } catch (e) {
          console.error('- Could not read response body:', e.message);
        }
      }
    } else {
      console.log('Edge Function Success:', data);
    }
  } catch (err) {
    console.error('Test Error:', err);
  }
}

testPaymentDetailed();
