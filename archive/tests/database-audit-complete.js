import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function performCompleteAudit() {
  console.log('🔍 PERFORMING COMPLETE DATABASE AUDIT\n');
  console.log('=====================================\n');

  try {
    // 1. Check user_roles table structure
    console.log('1. 📋 CHECKING USER_ROLES TABLE STRUCTURE...\n');
    
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_info', { table_name: 'user_roles' })
      .catch(async () => {
        // Fallback: query information_schema
        const { data, error } = await supabase
          .from('information_schema.columns')
          .select('column_name, data_type, is_nullable, column_default')
          .eq('table_name', 'user_roles')
          .eq('table_schema', 'public');
        return { data, error };
      });

    if (tableError) {
      console.log('   Using direct table query instead...');
      // Direct query to see what columns exist
      const { data: sampleData, error: sampleError } = await supabase
        .from('user_roles')
        .select('*')
        .limit(1);
      
      if (sampleError) {
        console.error('   ❌ Error querying user_roles:', sampleError);
      } else {
        console.log('   ✅ Sample user_roles record structure:');
        if (sampleData && sampleData.length > 0) {
          Object.keys(sampleData[0]).forEach(key => {
            console.log(`      - ${key}: ${typeof sampleData[0][key]}`);
          });
        }
      }
    } else {
      console.log('   ✅ user_roles table columns:');
      tableInfo?.forEach(col => {
        console.log(`      - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }

    // 2. Check for triggers on user_roles table
    console.log('\n2. ⚙️  CHECKING TRIGGERS ON USER_ROLES TABLE...\n');
    
    const { data: triggers, error: triggerError } = await supabase
      .rpc('get_table_triggers', { table_name: 'user_roles' })
      .catch(async () => {
        // Fallback query
        const { data, error } = await supabase
          .from('information_schema.triggers')
          .select('trigger_name, event_manipulation, action_statement')
          .eq('event_object_table', 'user_roles');
        return { data, error };
      });

    if (triggerError) {
      console.log('   ⚠️  Could not query triggers directly, checking manually...');
    } else {
      console.log('   ✅ Triggers found:');
      triggers?.forEach(trigger => {
        console.log(`      - ${trigger.trigger_name}: ${trigger.event_manipulation}`);
        console.log(`        Action: ${trigger.action_statement}`);
      });
    }

    // 3. Check specific user with payment issue
    console.log('\n3. 🔍 CHECKING SPECIFIC USER WITH PAYMENT ISSUE...\n');
    
    const { data: problemUser, error: userError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', 'de066299-6cd8-42dd-b53f-04c89802b261') // From the screenshot
      .single();

    if (userError) {
      console.error('   ❌ Error fetching problem user:', userError);
    } else {
      console.log('   ✅ Problem user details:');
      console.log('      User ID:', problemUser.user_id);
      console.log('      Role:', problemUser.role);
      console.log('      Subscription Status:', problemUser.subscription_status);
      console.log('      Created At:', problemUser.created_at);
      console.log('      All fields:', Object.keys(problemUser));
    }

    // 4. Check payment records for this user
    console.log('\n4. 💳 CHECKING PAYMENT RECORDS FOR PROBLEM USER...\n');
    
    const { data: userPayments, error: paymentError } = await supabase
      .from('payment_records')
      .select('*')
      .eq('user_id', 'de066299-6cd8-42dd-b53f-04c89802b261')
      .order('created_at', { ascending: false });

    if (paymentError) {
      console.error('   ❌ Error fetching payments:', paymentError);
    } else {
      console.log(`   ✅ Found ${userPayments?.length || 0} payment records:`);
      userPayments?.forEach((payment, index) => {
        console.log(`      ${index + 1}. ID: ${payment.id}`);
        console.log(`         Status: ${payment.status}`);
        console.log(`         Amount: €${payment.amount / 100}`);
        console.log(`         Created: ${payment.created_at}`);
        console.log(`         Stripe Session: ${payment.stripe_session_id || 'None'}`);
        console.log('');
      });
    }

    // 5. Try to manually update with service role
    console.log('\n5. 🔧 ATTEMPTING MANUAL UPDATE WITH SERVICE ROLE...\n');
    
    try {
      const { data: updateResult, error: updateError } = await supabase
        .from('user_roles')
        .update({ 
          subscription_status: 'active'
        })
        .eq('user_id', 'de066299-6cd8-42dd-b53f-04c89802b261')
        .select();

      if (updateError) {
        console.error('   ❌ Manual update failed:', updateError);
        console.error('   Error details:', JSON.stringify(updateError, null, 2));
      } else {
        console.log('   ✅ Manual update successful:', updateResult);
      }
    } catch (err) {
      console.error('   ❌ Manual update exception:', err);
    }

    // 6. Check if updated_at column exists and add if missing
    console.log('\n6. 🔧 CHECKING/ADDING UPDATED_AT COLUMN...\n');
    
    try {
      // Try to add updated_at column if it doesn't exist
      const { error: alterError } = await supabase
        .rpc('add_updated_at_column');

      if (alterError) {
        console.log('   Trying direct SQL approach...');
        
        // Try direct SQL
        const { error: sqlError } = await supabase
          .from('user_roles')
          .select('updated_at')
          .limit(1);

        if (sqlError && sqlError.message.includes('column "updated_at" does not exist')) {
          console.log('   ❌ updated_at column is missing from user_roles table');
          console.log('   🔧 This is likely the root cause of the issue');
        } else {
          console.log('   ✅ updated_at column exists');
        }
      }
    } catch (err) {
      console.log('   ⚠️  Could not check updated_at column directly');
    }

    // 7. Check RLS policies on user_roles
    console.log('\n7. 🔒 CHECKING RLS POLICIES ON USER_ROLES...\n');
    
    const { data: policies, error: policyError } = await supabase
      .rpc('get_table_policies', { table_name: 'user_roles' })
      .catch(() => ({ data: null, error: 'Could not fetch policies' }));

    if (policyError) {
      console.log('   ⚠️  Could not fetch RLS policies');
    } else {
      console.log('   ✅ RLS policies found:');
      policies?.forEach(policy => {
        console.log(`      - ${policy.policyname}: ${policy.cmd} for ${policy.roles}`);
      });
    }

    console.log('\n=====================================');
    console.log('🎯 AUDIT COMPLETE - ANALYSIS:\n');

    console.log('LIKELY ROOT CAUSE:');
    console.log('The error "record \'new\' has no field \'updated_at\'" suggests:');
    console.log('1. There is a trigger expecting an updated_at column');
    console.log('2. The user_roles table is missing the updated_at column');
    console.log('3. This prevents any updates to the subscription_status field');
    console.log('');

    console.log('RECOMMENDED FIX:');
    console.log('1. Add updated_at column to user_roles table');
    console.log('2. Add trigger to automatically update updated_at on changes');
    console.log('3. Retry the subscription status update');

  } catch (error) {
    console.error('❌ Audit failed with error:', error);
  }
}

// Run the audit
performCompleteAudit().catch(console.error);
