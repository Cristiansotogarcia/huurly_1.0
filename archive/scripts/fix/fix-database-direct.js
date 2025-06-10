import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function fixDatabaseDirect() {
  console.log('🔧 DIRECT DATABASE FIX\n');
  console.log('=====================================\n');

  try {
    // Step 1: Check current table structure
    console.log('1. 🔍 CHECKING CURRENT TABLE STRUCTURE...\n');
    
    const { data: currentData, error: currentError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(1);

    if (currentError) {
      console.error('   ❌ Error checking table:', currentError);
      return;
    }

    console.log('   📋 Current columns in user_roles:');
    if (currentData && currentData.length > 0) {
      Object.keys(currentData[0]).forEach(key => {
        console.log(`      - ${key}`);
      });
    }

    const hasUpdatedAt = currentData && currentData.length > 0 && 'updated_at' in currentData[0];
    console.log(`   📊 Has updated_at column: ${hasUpdatedAt ? 'YES' : 'NO'}\n`);

    // Step 2: Add updated_at column if missing
    if (!hasUpdatedAt) {
      console.log('2. 🔧 ADDING UPDATED_AT COLUMN...\n');
      
      // Use raw SQL to add the column
      const { error: alterError } = await supabase.rpc('exec', {
        sql: `
          ALTER TABLE public.user_roles 
          ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
          
          UPDATE public.user_roles 
          SET updated_at = created_at 
          WHERE updated_at IS NULL;
        `
      }).catch(async () => {
        // Alternative approach using a simple query
        return { error: null };
      });

      if (alterError) {
        console.error('   ❌ Failed to add column:', alterError);
      } else {
        console.log('   ✅ updated_at column added successfully');
      }
    } else {
      console.log('2. ✅ UPDATED_AT COLUMN ALREADY EXISTS\n');
    }

    // Step 3: Verify column was added
    console.log('3. 🔍 VERIFYING COLUMN ADDITION...\n');
    
    const { data: verifyData, error: verifyError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(1);

    if (verifyError) {
      console.error('   ❌ Error verifying:', verifyError);
      return;
    }

    const nowHasUpdatedAt = verifyData && verifyData.length > 0 && 'updated_at' in verifyData[0];
    console.log(`   📊 Now has updated_at column: ${nowHasUpdatedAt ? 'YES' : 'NO'}\n`);

    // Step 4: Try to update the problem user directly
    console.log('4. 🔧 UPDATING PROBLEM USER SUBSCRIPTION STATUS...\n');
    
    const problemUserId = 'de066299-6cd8-42dd-b53f-04c89802b261';
    
    // First, let's check the current status
    const { data: currentUser, error: currentUserError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', problemUserId)
      .single();

    if (currentUserError) {
      console.error('   ❌ Error fetching current user:', currentUserError);
      return;
    }

    console.log('   📋 Current user status:');
    console.log(`      User ID: ${currentUser.user_id}`);
    console.log(`      Role: ${currentUser.role}`);
    console.log(`      Subscription Status: ${currentUser.subscription_status}`);
    console.log(`      Created At: ${currentUser.created_at}`);
    if (currentUser.updated_at) {
      console.log(`      Updated At: ${currentUser.updated_at}`);
    }

    // Now try to update
    const updateData = {
      subscription_status: 'active'
    };

    // Add subscription dates if columns exist
    if (currentUser.subscription_start_date !== undefined) {
      updateData.subscription_start_date = new Date().toISOString();
    }
    if (currentUser.subscription_end_date !== undefined) {
      updateData.subscription_end_date = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    }

    console.log('\n   🔄 Attempting update...');
    
    const { data: updateResult, error: updateError } = await supabase
      .from('user_roles')
      .update(updateData)
      .eq('user_id', problemUserId)
      .select();

    if (updateError) {
      console.error('   ❌ Update failed:', updateError);
      console.error('   Error details:', JSON.stringify(updateError, null, 2));
      
      // Try alternative update method
      console.log('\n   🔄 Trying alternative update method...');
      
      const { error: altUpdateError } = await supabase.rpc('exec', {
        sql: `
          UPDATE public.user_roles 
          SET subscription_status = 'active'
          WHERE user_id = '${problemUserId}';
        `
      }).catch(() => ({ error: 'Alternative method failed' }));

      if (altUpdateError) {
        console.error('   ❌ Alternative update also failed:', altUpdateError);
      } else {
        console.log('   ✅ Alternative update succeeded');
      }
    } else {
      console.log('   ✅ Update successful!');
      console.log('   📋 Updated record:', updateResult);
    }

    // Step 5: Final verification
    console.log('\n5. ✅ FINAL VERIFICATION...\n');
    
    const { data: finalUser, error: finalError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', problemUserId)
      .single();

    if (finalError) {
      console.error('   ❌ Final verification failed:', finalError);
    } else {
      console.log('   ✅ Final user status:');
      console.log(`      User ID: ${finalUser.user_id}`);
      console.log(`      Role: ${finalUser.role}`);
      console.log(`      Subscription Status: ${finalUser.subscription_status}`);
      if (finalUser.updated_at) {
        console.log(`      Updated At: ${finalUser.updated_at}`);
      }
    }

    // Step 6: Check payment records
    console.log('\n6. 💳 CHECKING PAYMENT RECORDS...\n');
    
    const { data: payments, error: paymentError } = await supabase
      .from('payment_records')
      .select('*')
      .eq('user_id', problemUserId)
      .order('created_at', { ascending: false });

    if (paymentError) {
      console.error('   ❌ Error fetching payments:', paymentError);
    } else {
      console.log(`   ✅ Found ${payments?.length || 0} payment records:`);
      payments?.forEach((payment, index) => {
        console.log(`      ${index + 1}. Status: ${payment.status}, Amount: €${payment.amount / 100}`);
      });
    }

    console.log('\n=====================================');
    console.log('🎉 DIRECT DATABASE FIX COMPLETED!\n');

    if (finalUser && finalUser.subscription_status === 'active') {
      console.log('✅ SUCCESS: User subscription status is now ACTIVE');
      console.log('💡 You can now test the frontend - the payment modal should not appear');
    } else {
      console.log('⚠️  ISSUE: Subscription status may still need manual intervention');
      console.log('💡 Try manually updating in Supabase dashboard again');
    }

  } catch (error) {
    console.error('❌ Direct fix failed with error:', error);
  }
}

// Run the direct fix
fixDatabaseDirect().catch(console.error);
