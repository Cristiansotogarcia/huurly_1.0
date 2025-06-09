import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function fixPaymentIssues() {
  console.log('🔧 FIXING PAYMENT SYSTEM ISSUES\n');
  console.log('=====================================\n');

  try {
    // Step 1: Find users with completed payments but inactive subscription
    console.log('1. 🔍 Finding users with payment/subscription mismatch...\n');
    
    const { data: usersToFix, error: queryError } = await supabase
      .from('payment_records')
      .select(`
        id,
        user_id,
        status,
        amount,
        created_at,
        user_roles!inner(subscription_status, role)
      `)
      .eq('status', 'completed')
      .eq('user_roles.subscription_status', 'inactive')
      .eq('user_roles.role', 'Huurder');

    if (queryError) {
      console.error('❌ Error querying users:', queryError);
      return;
    }

    console.log(`Found ${usersToFix?.length || 0} users with completed payments but inactive subscription\n`);

    if (!usersToFix || usersToFix.length === 0) {
      console.log('✅ No users need subscription status fix\n');
    } else {
      // Step 2: Fix each user's subscription status
      console.log('2. 🔄 Fixing subscription status for affected users...\n');
      
      for (const user of usersToFix) {
        console.log(`   Fixing user: ${user.user_id}`);
        console.log(`   Payment ID: ${user.id}`);
        console.log(`   Amount: €${user.amount / 100}`);
        console.log(`   Payment Date: ${user.created_at}`);
        
        const { error: updateError } = await supabase
          .from('user_roles')
          .update({
            subscription_status: 'active',
            subscription_start_date: new Date().toISOString(),
            subscription_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
          })
          .eq('user_id', user.user_id);

        if (updateError) {
          console.error(`   ❌ Failed to update user ${user.user_id}:`, updateError);
        } else {
          console.log(`   ✅ Successfully activated subscription for user ${user.user_id}`);
          
          // Create success notification
          const { error: notificationError } = await supabase
            .from('notifications')
            .insert({
              user_id: user.user_id,
              type: 'payment_success',
              title: 'Abonnement geactiveerd',
              message: 'Je jaarlijkse abonnement is nu actief. Je hebt toegang tot alle Huurly functies.',
              read: false,
            });

          if (notificationError) {
            console.error(`   ⚠️  Failed to create notification for user ${user.user_id}:`, notificationError);
          } else {
            console.log(`   📧 Created success notification for user ${user.user_id}`);
          }
        }
        console.log('');
      }
    }

    // Step 3: Verify webhook configuration
    console.log('3. 🔍 Checking webhook configuration...\n');
    
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    
    console.log('   Environment variables:');
    console.log(`   ✅ STRIPE_WEBHOOK_SECRET: ${webhookSecret ? 'Set' : 'Missing'}`);
    console.log(`   ✅ STRIPE_SECRET_KEY: ${stripeSecret ? 'Set' : 'Missing'}`);
    console.log('');

    // Step 4: Check recent payment records
    console.log('4. 📊 Analyzing recent payment records...\n');
    
    const { data: recentPayments, error: paymentsError } = await supabase
      .from('payment_records')
      .select(`
        id,
        user_id,
        status,
        amount,
        stripe_session_id,
        created_at,
        user_roles!inner(subscription_status, role)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (paymentsError) {
      console.error('   ❌ Error fetching recent payments:', paymentsError);
    } else {
      console.log('   Recent payment records:');
      recentPayments?.forEach((payment, index) => {
        console.log(`   ${index + 1}. Payment ID: ${payment.id}`);
        console.log(`      User ID: ${payment.user_id}`);
        console.log(`      Status: ${payment.status}`);
        console.log(`      Amount: €${payment.amount / 100}`);
        console.log(`      Subscription Status: ${payment.user_roles.subscription_status}`);
        console.log(`      Stripe Session: ${payment.stripe_session_id || 'Not set'}`);
        console.log(`      Created: ${payment.created_at}`);
        console.log('');
      });
    }

    // Step 5: Test webhook functionality
    console.log('5. 🧪 Testing webhook functionality...\n');
    
    // Check if there are any payments without stripe_session_id (indicating webhook didn't process)
    const { data: unprocessedPayments, error: unprocessedError } = await supabase
      .from('payment_records')
      .select('id, user_id, status, created_at')
      .eq('status', 'completed')
      .is('stripe_session_id', null);

    if (unprocessedError) {
      console.error('   ❌ Error checking unprocessed payments:', unprocessedError);
    } else {
      console.log(`   Found ${unprocessedPayments?.length || 0} completed payments without stripe_session_id`);
      
      if (unprocessedPayments && unprocessedPayments.length > 0) {
        console.log('   ⚠️  This indicates webhook processing issues');
        console.log('   💡 Recommendation: Check Stripe webhook configuration');
      } else {
        console.log('   ✅ All completed payments have been processed by webhook');
      }
    }

    console.log('\n=====================================');
    console.log('🎉 PAYMENT ISSUES FIX COMPLETED!\n');

    // Final summary
    console.log('📋 SUMMARY:');
    console.log(`   • Fixed subscription status for ${usersToFix?.length || 0} users`);
    console.log(`   • Webhook configuration: ${webhookSecret && stripeSecret ? 'OK' : 'Needs attention'}`);
    console.log(`   • Unprocessed payments: ${unprocessedPayments?.length || 0}`);
    
    if (usersToFix && usersToFix.length > 0) {
      console.log('\n💡 NEXT STEPS:');
      console.log('   1. Test the application with affected users');
      console.log('   2. Verify payment modal no longer appears');
      console.log('   3. Check that dashboard shows active subscription');
      console.log('   4. Test new payment flow to ensure webhook works');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the fix
fixPaymentIssues().catch(console.error);
