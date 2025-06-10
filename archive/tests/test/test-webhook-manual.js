// Manual webhook test to check if our webhook function works
const testWebhookEvent = {
  type: 'checkout.session.completed',
  data: {
    object: {
      id: 'cs_test_123456789',
      mode: 'subscription',
      customer: 'cus_test_123',
      customer_details: {
        email: 'cristiansotogarcia@gmail.com'
      },
      metadata: {
        userId: '1c655825-9713-4ecc-80e3-a77701914d3a',
        paymentRecordId: '57efe6bb-193f-4cb5-bbd0-2ae0b91c33d9' // One of the pending records
      }
    }
  }
};

console.log('Testing webhook with event:', JSON.stringify(testWebhookEvent, null, 2));

// Test the webhook URL directly
fetch('https://lxtkotgfsnahwncgcfnl.supabase.co/functions/v1/stripe-webhook', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'stripe-signature': 'test_signature' // This will fail signature verification, but we can see if the function is reachable
  },
  body: JSON.stringify(testWebhookEvent)
})
.then(response => {
  console.log('Webhook response status:', response.status);
  return response.text();
})
.then(data => {
  console.log('Webhook response:', data);
})
.catch(error => {
  console.error('Webhook test failed:', error);
});
