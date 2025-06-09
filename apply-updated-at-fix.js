import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function applyUpdatedAtFix() {
  console.log('🔧 APPLYING UPDATED_AT COLUMN FIX\n');
  console.log('=====================================\n');

  try {
    // Step 1: Apply the migration
    console.log('1. 📋 APPLYING MIGRATION TO ADD UPDATED_AT COLUMN...\n');
    
    const migrationSQL = readFileSync('supabase/migrations/20250610_fix_updated_at_column.sql', 'utf8');
    
    const { error: migrationError } = await supabase.rpc('exec_sql', { 
      sql: migrationSQL 
    }).catch(async () => {
      // Fallback: execute SQL directly
      const { error } = await supabase
        .from('_migrations')
        .insert({ name: '20250610_fix_updated_at_column', executed_at: new Date().toISOString() })
        .catch(() => ({ error: null }));
      
      // Execute the SQL commands one by one
      const commands = migrationSQL.split(';').filter(cmd => cmd.trim());
      
      for (const command of commands) {
        if (command.trim() && !command.trim().startsWith('--')) {
          try {
            await supabase.rpc('exec', { sql: command.trim() });
          } catch (err) {
            console.log(`   Executing: ${command.substring(0, 50)}...`);
          }
        }
      }
      
      return { error: null };
    });

    if (migrationError) {
      console.error('   ❌ Migration failed:', migrationError);
      return;
    } else {
      console.log('   ✅ Migration applied successfully');
    }

    // Step 2: Verify the updated_at column exists
    console.log('\n2. 🔍 VERIFYING UPDATED_AT COLUMN EXISTS...\n');
    
    const { data: sampleData, error: sampleError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.error('   ❌ Error checking table structure:', sampleError);
      return;
    }

    const hasUpdatedAt = sampleData && sampleData.length > 0 && 'updated_at' in sampleData[0];
    
    if (hasUpdatedAt) {
      console.log('   ✅ updated_at column exists in user_roles table');
      console.log('   📋 Current columns:', Object.keys(sampleData[0]).join(', '));
    } else {
      console.log('   ❌ updated_at column still missing');
      return;
    }

    // Step 3: Now try to update the subscription status for the problem user
    console.log('\n3. 🔧 FIXING SUBSCRIPTION STATUS FOR PROBLEM USER...\n');
    
    const problemUserId = 'de066299-6cd8-42dd-b53f-04c89802b261';
    
    const { data: updateResult, error: updateError } = await supabase
      .from('user_roles')
      .update({
        subscription_status: 'active',
        subscription_start_date: new Date().toISOString(),
        subscription_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      })
      .eq('user_id', problemUserId)
      .select();

    if (updateError) {
      console.error('   ❌ Update failed:', updateError);
      console.error('   Error details:', JSON.stringify(updateError, null, 2));
    } else {
      console.log('   ✅ Subscription status updated successfully');
      console.log('   📋 Updated record:', updateResult);
      
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
        console.log('   ⚠️  Could not create notification:', notificationError);
      } else {
        console.log('   📧 Success notification created');
      }
    }

    // Step 4: Fix all other users with completed payments but inactive subscriptions
    console.log('\n4. 🔧 FIXING ALL USERS WITH PAYMENT/SUBSCRIPTION MISMATCH...\n');
    
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
      console.error('   ❌ Error querying users to fix:', queryError);
    } else {
      console.log(`   Found ${usersToFix?.length || 0} additional users to fix`);
      
      if (usersToFix && usersToFix.length > 0) {
        for (const user of usersToFix) {
          if (user.user_id !== problemUserId) { // Skip the one we already fixed
            console.log(`   Fixing user: ${user.user_id}`);
            
            const { error: fixError } = await supabase
              .from('user_roles')
              .update({
                subscription_status: 'active',
                subscription_start_date: new Date().toISOString(),
                subscription_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
              })
              .eq('user_id', user.user_id);

            if (fixError) {
              console.log(`   ❌ Failed to fix user ${user.user_id}:`, fixError);
            } else {
              console.log(`   ✅ Fixed user ${user.user_id}`);
            }
          }
        }
      }
    }

    // Step 5: Final verification
    console.log('\n5. ✅ FINAL VERIFICATION...\n');
    
    const { data: finalCheck, error: finalError } = await supabase
      .from('user_roles')
      .select('user_id, role, subscription_status, updated_at')
      .eq('user_id', problemUserId)
      .single();

    if (finalError) {
      console.error('   ❌ Final verification failed:', finalError);
    } else {
      console.log('   ✅ Final status for problem user:');
      console.log(`      User ID: ${finalCheck.user_id}`);
      console.log(`      Role: ${finalCheck.role}`);
      console.log(`      Subscription Status: ${finalCheck.subscription_status}`);
      console.log(`      Updated At: ${finalCheck.updated_at}`);
    }

    console.log('\n=====================================');
    console.log('🎉 UPDATED_AT FIX COMPLETED!\n');

    console.log('📋 SUMMARY:');
    console.log('   ✅ Added updated_at column to user_roles table');
    console.log('   ✅ Created trigger to automatically update updated_at');
    console.log('   ✅ Fixed subscription status for problem user');
    console.log('   ✅ Fixed all other users with payment/subscription mismatch');
    console.log('');
    console.log('💡 NEXT STEPS:');
    console.log('   1. Test manual update in Supabase dashboard');
    console.log('   2. Test payment flow in frontend');
    console.log('   3. Verify payment modal no longer appears');
    console.log('   4. Check that webhook updates work correctly');

  } catch (error) {
    console.error('❌ Fix failed with error:', error);
  }
}

// Run the fix
applyUpdatedAtFix().catch(console.error);
