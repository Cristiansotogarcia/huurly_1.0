// Test Stripe configuration directly
import Stripe from 'stripe';

const stripe = new Stripe('sk_test_51RVFSSGadpjzVmLhpOgJLjgNBZxFDQCTnd92Id9GeZXQOpfuqpgLe2ShxNLmOh2jZxJ0GgBpIGTKqOkhc4iusUb800GWt9JLAu', {
  apiVersion: '2023-10-16',
});

async function testStripeConfig() {
  try {
    console.log('Testing Stripe configuration...');
    
    // Test 1: Check if we can list customers
    console.log('1. Testing customer list...');
    const customers = await stripe.customers.list({ limit: 1 });
    console.log('✅ Customer list successful');
    
    // Test 2: Check if the price ID exists
    console.log('2. Testing price retrieval...');
    const price = await stripe.prices.retrieve('price_1RXr0rGadpjzVmLhApRe12j2');
    console.log('✅ Price retrieval successful:', price.id, price.unit_amount / 100, price.currency);
    
    // Test 3: Try to create a checkout session
    console.log('3. Testing checkout session creation...');
    const session = await stripe.checkout.sessions.create({
      customer_email: 'test@example.com',
      line_items: [{ price: 'price_1RXr0rGadpjzVmLhApRe12j2', quantity: 1 }],
      mode: 'payment',
      success_url: 'http://localhost:8081/success',
      cancel_url: 'http://localhost:8081/cancel',
      metadata: { 
        userId: 'test-user-id', 
        paymentRecordId: 'test-payment-id' 
      }
    });
    console.log('✅ Checkout session creation successful:', session.id);
    console.log('✅ Session URL:', session.url);
    
  } catch (error) {
    console.error('❌ Stripe Error:', error.message);
    console.error('Error type:', error.type);
    console.error('Error code:', error.code);
    if (error.param) console.error('Error param:', error.param);
  }
}

testStripeConfig();
