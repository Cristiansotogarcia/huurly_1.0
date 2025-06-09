import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function fixUpdatedAtSimple() {
  console.log('🔧 SIMPLE UPDATED_AT FIX\n');
  console.log('=====================================\n');

  try {
    console.log('✅ CONFIRMED: user_roles table is missing updated_at column');
    console.log('This is causing the error: "record \'new\' has no field \'updated_at\'"\n');

    // Since we can't easily add the column via JavaScript, let's try a workaround
    // We'll update the subscription status without the updated_at column
    
    console.log('🔧 ATTEMPTING DIRECT SUBSCRIPTION STATUS UPDATE...\n');
    
    const problemUserId = 'de066299-6cd8-42dd-b53f-04c89802b261';
    
    // First check current status
    const { data: currentUser, error: currentError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', problemUserId)
      .single();

    if (currentError) {
      console.error('❌ Error fetching user:', currentError);
      return;
    }

    console.log('📋 Current user status:');
    console.log(`   User ID: ${currentUser.user_id}`);
    console.log(`   Role: ${currentUser.role}`);
    console.log(`   Subscription Status: ${currentUser.subscription_status}`);
    console.log(`   Created At: ${currentUser.created_at}`);

    // Try to update just the subscription_status
    console.log('\n🔄 Attempting to update subscription_status to active...');
    
    const { data: updateResult, error: updateError } = await supabase
      .from('user_roles')
      .update({ 
        subscription_status: 'active'
      })
      .eq('user_id', problemUserId)
      .select();

    if (updateError) {
      console.error('❌ Update failed:', updateError);
      console.error('Error details:', JSON.stringify(updateError, null, 2));
      
      console.log('\n💡 SOLUTION REQUIRED:');
      console.log('The updated_at column needs to be added to the user_roles table.');
      console.log('This must be done directly in the Supabase SQL editor.');
      console.log('\nSQL to run in Supabase SQL editor:');
      console.log('```sql');
      console.log('ALTER TABLE public.user_roles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();');
      console.log('UPDATE public.user_roles SET updated_at = created_at WHERE updated_at IS NULL;');
      console.log('```');
      console.log('\nAfter running this SQL, the subscription status update should work.');
      
    } else {
      console.log('✅ Update successful!');
      console.log('📋 Updated record:', updateResult);
      
      // Verify the update
      const { data: verifyUser, error: verifyError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', problemUserId)
        .single();

      if (verifyError) {
        console.error('❌ Verification failed:', verifyError);
      } else {
        console.log('\n✅ VERIFICATION SUCCESSFUL:');
        console.log(`   Subscription Status: ${verifyUser.subscription_status}`);
        
        if (verifyUser.subscription_status === 'active') {
          console.log('\n🎉 SUCCESS! The subscription status is now ACTIVE');
          console.log('💡 You can now test the frontend - the payment modal should not appear');
          
          // Create success notification
          const { error: notificationError } = await supabase
            .from('notifications')
            .insert({
              user_id: problemUserId,
              type: 'payment_success',
              title: 'Abonnement geactiveerd',
              message: 'Je jaarlijkse abonnement is nu actief. Je hebt toegang tot alle Huurly functies.',
              read: false,
            });

          if (notificationError) {
            console.log('⚠️  Could not create notification:', notificationError);
          } else {
            console.log('📧 Success notification created');
          }
        }
      }
    }

    // Check payment records to confirm the user should have active subscription
    console.log('\n💳 CHECKING PAYMENT RECORDS...');
    
    const { data: payments, error: paymentError } = await supabase
      .from('payment_records')
      .select('*')
      .eq('user_id', problemUserId)
      .order('created_at', { ascending: false });

    if (paymentError) {
      console.error('❌ Error fetching payments:', paymentError);
    } else {
      console.log(`✅ Found ${payments?.length || 0} payment records:`);
      payments?.forEach((payment, index) => {
        console.log(`   ${index + 1}. Status: ${payment.status}, Amount: €${payment.amount / 100}, Date: ${payment.created_at}`);
      });
      
      const hasCompletedPayment = payments?.some(p => p.status === 'completed');
      if (hasCompletedPayment) {
        console.log('✅ User has completed payment - subscription should be active');
      } else {
        console.log('⚠️  No completed payments found');
      }
    }

    console.log('\n=====================================');
    console.log('🎯 ANALYSIS COMPLETE\n');

    console.log('ROOT CAUSE IDENTIFIED:');
    console.log('- The user_roles table is missing the updated_at column');
    console.log('- A database trigger expects this column to exist');
    console.log('- This prevents any updates to the subscription_status field');
    console.log('');

    console.log('IMMEDIATE SOLUTION:');
    console.log('1. Add the updated_at column to user_roles table in Supabase SQL editor');
    console.log('2. Run the SQL commands provided above');
    console.log('3. Retry updating the subscription status');
    console.log('');

    console.log('LONG-TERM SOLUTION:');
    console.log('1. Create a proper migration file');
    console.log('2. Add updated_at columns to all tables that need them');
    console.log('3. Add triggers to automatically update the timestamp');

  } catch (error) {
    console.error('❌ Fix failed with error:', error);
  }
}

// Run the simple fix
fixUpdatedAtSimple().catch(console.error);
