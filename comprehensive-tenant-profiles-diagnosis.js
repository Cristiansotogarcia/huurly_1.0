const { createClient } = require('@supabase/supabase-js');

// Database credentials from .env
const SUPABASE_URL = 'https://lxtkotgfsnahwncgcfnl.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dGtvdGdmc25haHduY2djZm5sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAyNTgyOCwiZXhwIjoyMDY0NjAxODI4fQ.1GaDpXyyXqxBzQSu7Pu3xRpF0_Y5AoQcLRQsgHmIM9I';

// Create Supabase client with service role key for admin access
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function comprehensiveDiagnosis() {
  console.log('🔍 COMPREHENSIVE TENANT_PROFILES 400 ERROR DIAGNOSIS');
  console.log('===================================================\n');

  try {
    // 1. Check if tenant_profiles table exists
    console.log('1. 📋 CHECKING TABLE EXISTENCE');
    console.log('------------------------------');
    
    const { data: tables, error: tablesError } = await supabase.rpc('get_table_info', {
      table_name: 'tenant_profiles'
    }).catch(async () => {
      // Fallback method if RPC doesn't exist
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name, table_schema')
        .eq('table_schema', 'public')
        .eq('table_name', 'tenant_profiles');
      return { data, error };
    });

    if (tablesError) {
      console.log('⚠️  Using fallback method to check tables...');
      
      // Direct SQL query to check tables
      const { data: directTables, error: directError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .ilike('table_name', '%tenant%');

      if (directError) {
        console.error('❌ Error checking tables:', directError);
        return;
      }

      console.log('📊 Tables containing "tenant":');
      if (directTables && directTables.length > 0) {
        directTables.forEach(table => console.log(`   ✓ ${table.table_name}`));
      } else {
        console.log('   ❌ No tables found containing "tenant"');
      }

      // Check all tables
      const { data: allTables, error: allTablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .order('table_name');

      if (!allTablesError && allTables) {
        console.log('\n📋 All existing tables:');
        allTables.forEach(table => console.log(`   - ${table.table_name}`));
      }
    } else {
      console.log('✅ tenant_profiles table exists');
    }

    // 2. Check table structure if it exists
    console.log('\n2. 🏗️  CHECKING TABLE STRUCTURE');
    console.log('-------------------------------');
    
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default, character_maximum_length')
      .eq('table_schema', 'public')
      .eq('table_name', 'tenant_profiles')
      .order('ordinal_position');

    if (columnsError) {
      console.error('❌ Error checking columns:', columnsError);
    } else if (columns && columns.length > 0) {
      console.log('✅ Table structure:');
      columns.forEach(col => {
        const maxLength = col.character_maximum_length ? ` (max: ${col.character_maximum_length})` : '';
        console.log(`   - ${col.column_name}: ${col.data_type}${maxLength} (nullable: ${col.is_nullable})`);
        if (col.column_default) {
          console.log(`     Default: ${col.column_default}`);
        }
      });
    } else {
      console.log('❌ No columns found - table may not exist');
    }

    // 3. Check constraints
    console.log('\n3. 🔒 CHECKING CONSTRAINTS');
    console.log('-------------------------');
    
    const { data: constraints, error: constraintsError } = await supabase
      .from('information_schema.table_constraints')
      .select('constraint_name, constraint_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'tenant_profiles');

    if (constraintsError) {
      console.error('❌ Error checking constraints:', constraintsError);
    } else if (constraints && constraints.length > 0) {
      console.log('✅ Table constraints:');
      constraints.forEach(constraint => {
        console.log(`   - ${constraint.constraint_name}: ${constraint.constraint_type}`);
      });

      // Get detailed constraint info
      for (const constraint of constraints) {
        if (constraint.constraint_type === 'CHECK' || constraint.constraint_type === 'FOREIGN KEY') {
          const { data: constraintDetails, error: detailsError } = await supabase
            .from('information_schema.check_constraints')
            .select('check_clause')
            .eq('constraint_name', constraint.constraint_name);

          if (!detailsError && constraintDetails && constraintDetails.length > 0) {
            console.log(`     Details: ${constraintDetails[0].check_clause}`);
          }
        }
      }
    } else {
      console.log('ℹ️  No constraints found');
    }

    // 4. Check RLS status and policies
    console.log('\n4. 🛡️  CHECKING RLS STATUS AND POLICIES');
    console.log('--------------------------------------');
    
    // Check if RLS is enabled
    const { data: rlsStatus, error: rlsError } = await supabase
      .from('pg_class')
      .select('relname, relrowsecurity, relforcerowsecurity')
      .eq('relname', 'tenant_profiles');

    if (rlsError) {
      console.error('❌ Error checking RLS status:', rlsError);
    } else if (rlsStatus && rlsStatus.length > 0) {
      const rls = rlsStatus[0];
      console.log(`✅ RLS enabled: ${rls.relrowsecurity}`);
      console.log(`   Force RLS: ${rls.relforcerowsecurity}`);
    } else {
      console.log('❌ Could not determine RLS status');
    }

    // Check RLS policies
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('policyname, permissive, roles, cmd, qual, with_check')
      .eq('tablename', 'tenant_profiles');

    if (policiesError) {
      console.error('❌ Error checking policies:', policiesError);
    } else if (policies && policies.length > 0) {
      console.log(`✅ Found ${policies.length} RLS policies:`);
      policies.forEach(policy => {
        console.log(`   - ${policy.policyname} (${policy.cmd})`);
        console.log(`     Permissive: ${policy.permissive}`);
        console.log(`     Roles: ${JSON.stringify(policy.roles)}`);
        if (policy.qual) console.log(`     Condition: ${policy.qual}`);
        if (policy.with_check) console.log(`     With Check: ${policy.with_check}`);
        console.log('');
      });
    } else {
      console.log('⚠️  No RLS policies found');
    }

    // 5. Test user authentication and permissions
    console.log('5. 👤 CHECKING USER AUTHENTICATION');
    console.log('----------------------------------');
    
    const testUserId = '929577f0-2124-4157-98e5-81656d0b8e83';
    
    try {
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(testUserId);
      
      if (userError) {
        console.error('❌ Error getting user data:', userError);
      } else if (userData.user) {
        console.log('✅ User exists:');
        console.log(`   - ID: ${userData.user.id}`);
        console.log(`   - Email: ${userData.user.email}`);
        console.log(`   - Created: ${userData.user.created_at}`);
        console.log(`   - Last sign in: ${userData.user.last_sign_in_at}`);
        console.log(`   - Email confirmed: ${userData.user.email_confirmed_at ? 'Yes' : 'No'}`);
        console.log(`   - User metadata:`, JSON.stringify(userData.user.user_metadata, null, 2));
        console.log(`   - App metadata:`, JSON.stringify(userData.user.app_metadata, null, 2));
      } else {
        console.log('❌ User not found');
      }
    } catch (authError) {
      console.error('❌ Authentication error:', authError);
    }

    // 6. Test database operations
    console.log('\n6. 🧪 TESTING DATABASE OPERATIONS');
    console.log('---------------------------------');
    
    // Test SELECT
    console.log('Testing SELECT operation...');
    const { data: selectData, error: selectError } = await supabase
      .from('tenant_profiles')
      .select('*')
      .limit(5);

    if (selectError) {
      console.error('❌ SELECT failed:', selectError);
    } else {
      console.log(`✅ SELECT works, found ${selectData ? selectData.length : 0} records`);
      if (selectData && selectData.length > 0) {
        console.log('   Sample record structure:');
        console.log('  ', JSON.stringify(selectData[0], null, 2));
      }
    }

    // Test INSERT with minimal data
    console.log('\nTesting INSERT operation...');
    const testInsertData = {
      user_id: testUserId,
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('tenant_profiles')
      .insert(testInsertData)
      .select();

    if (insertError) {
      console.error('❌ INSERT failed:', insertError);
      console.log('   Error details:');
      console.log(`   - Code: ${insertError.code}`);
      console.log(`   - Message: ${insertError.message}`);
      console.log(`   - Details: ${insertError.details}`);
      console.log(`   - Hint: ${insertError.hint}`);
      
      // Try to understand the specific error
      if (insertError.code === '23505') {
        console.log('   🔍 This is a unique constraint violation');
      } else if (insertError.code === '23503') {
        console.log('   🔍 This is a foreign key constraint violation');
      } else if (insertError.code === '23514') {
        console.log('   🔍 This is a check constraint violation');
      } else if (insertError.code === '42501') {
        console.log('   🔍 This is a permission denied error');
      }
    } else {
      console.log('✅ INSERT works:', insertData);
      
      // Clean up test data
      console.log('Cleaning up test data...');
      const { error: deleteError } = await supabase
        .from('tenant_profiles')
        .delete()
        .eq('user_id', testUserId);
      
      if (deleteError) {
        console.log('⚠️  Could not clean up test data:', deleteError);
      } else {
        console.log('✅ Test data cleaned up');
      }
    }

    // 7. Check for existing data conflicts
    console.log('\n7. 🔍 CHECKING FOR DATA CONFLICTS');
    console.log('---------------------------------');
    
    const { data: existingProfile, error: existingError } = await supabase
      .from('tenant_profiles')
      .select('*')
      .eq('user_id', testUserId);

    if (existingError) {
      console.error('❌ Error checking existing profile:', existingError);
    } else if (existingProfile && existingProfile.length > 0) {
      console.log('⚠️  Profile already exists for this user:');
      console.log('  ', JSON.stringify(existingProfile[0], null, 2));
    } else {
      console.log('✅ No existing profile found for test user');
    }

    // 8. Test with actual request data simulation
    console.log('\n8. 🎯 SIMULATING ACTUAL REQUEST');
    console.log('------------------------------');
    
    // Simulate the actual request that's failing
    const actualRequestData = {
      user_id: testUserId,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      date_of_birth: '1990-01-01',
      nationality: 'Dutch',
      current_address: '123 Main St, Amsterdam',
      employment_status: 'employed',
      monthly_income: 3000,
      preferred_rent_range_min: 800,
      preferred_rent_range_max: 1200,
      preferred_location: 'Amsterdam',
      move_in_date: '2025-07-01',
      household_size: 1,
      pets: false,
      smoking: false,
      bio: 'Looking for a nice place to rent'
    };

    console.log('Attempting INSERT with realistic data...');
    const { data: realInsertData, error: realInsertError } = await supabase
      .from('tenant_profiles')
      .insert(actualRequestData)
      .select();

    if (realInsertError) {
      console.error('❌ Realistic INSERT failed:', realInsertError);
      console.log('   This is likely the same error causing the 400 response');
      console.log('   Error analysis:');
      console.log(`   - Code: ${realInsertError.code}`);
      console.log(`   - Message: ${realInsertError.message}`);
      console.log(`   - Details: ${realInsertError.details}`);
      console.log(`   - Hint: ${realInsertError.hint}`);
    } else {
      console.log('✅ Realistic INSERT works:', realInsertData);
      
      // Clean up
      await supabase
        .from('tenant_profiles')
        .delete()
        .eq('user_id', testUserId);
    }

  } catch (error) {
    console.error('❌ Unexpected error during diagnosis:', error);
  }

  console.log('\n🏁 DIAGNOSIS COMPLETE');
  console.log('====================');
  console.log('If you see any errors above, they indicate the root cause of the 400 error.');
  console.log('Common causes:');
  console.log('- Missing table or columns');
  console.log('- RLS policies blocking the operation');
  console.log('- Constraint violations (unique, foreign key, check)');
  console.log('- Data type mismatches');
  console.log('- Permission issues');
}

// Run the comprehensive diagnosis
comprehensiveDiagnosis().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
