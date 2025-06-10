import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function fixSubscriptionStatus() {
  console.log('🔧 Fixing subscription status for completed payments...\n');

  try {
    // Find users with completed payments but inactive subscription
    const { data: usersToFix, error: queryError } = await supabase
      .from('payment_records')
      .select(`
        user_id,
        status,
        user_roles!inner(subscription_status, role)
      `)
      .eq('status', 'completed')
      .eq('user_roles.subscription_status', 'inactive')
      .eq('user_roles.role', 'Huurder');

    if (queryError) {
      console.error('❌ Error querying users:', queryError);
      return;
    }

    console.log(`Found ${usersToFix?.length || 0} users with completed payments but inactive subscription`);

    if (!usersToFix || usersToFix.length === 0) {
      console.log('✅ No users need subscription status fix');
      return;
    }

    // Fix each user's subscription status
    for (const user of usersToFix) {
      console.log(`\n🔄 Fixing user: ${user.user_id}`);
      
      const { error: updateError } = await supabase
        .from('user_roles')
        .update({
          subscription_status: 'active',
          subscription_start_date: new Date().toISOString(),
          subscription_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
        })
        .eq('user_id', user.user_id);

      if (updateError) {
        console.error(`❌ Failed to update user ${user.user_id}:`, updateError);
      } else {
        console.log(`✅ Successfully activated subscription for user ${user.user_id}`);
        
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
          console.error(`⚠️  Failed to create notification for user ${user.user_id}:`, notificationError);
        } else {
          console.log(`📧 Created success notification for user ${user.user_id}`);
        }
      }
    }

    console.log('\n🎉 Subscription status fix completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

async function testWebhookIssue() {
  console.log('\n🔍 Testing webhook functionality...\n');

  try {
    // Check if webhook environment variables are set
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    
    console.log('Environment check:');
    console.log(`✅ STRIPE_WEBHOOK_SECRET: ${webhookSecret ? 'Set' : 'Missing'}`);
    console.log(`✅ STRIPE_SECRET_KEY: ${stripeSecret ? 'Set' : 'Missing'}`);
    
    // Check recent payment records to see if webhook processed them
    const { data: recentPayments, error } = await supabase
      .from('payment_records')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('❌ Error fetching recent payments:', error);
      return;
    }

    console.log('\nRecent payment records:');
    recentPayments?.forEach(payment => {
      console.log(`- ID: ${payment.id}`);
      console.log(`  Status: ${payment.status}`);
      console.log(`  User ID: ${payment.user_id}`);
      console.log(`  Stripe Session: ${payment.stripe_session_id || 'Not set'}`);
      console.log(`  Created: ${payment.created_at}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error testing webhook:', error);
  }
}

// Run both functions
async function main() {
  await fixSubscriptionStatus();
  await testWebhookIssue();
}

main().catch(console.error);
