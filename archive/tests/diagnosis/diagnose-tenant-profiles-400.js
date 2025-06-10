const { createClient } = require('@supabase/supabase-js');

// Database credentials from .env
const SUPABASE_URL = 'https://lxtkotgfsnahwncgcfnl.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dGtvdGdmc25haHduY2djZm5sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAyNTgyOCwiZXhwIjoyMDY0NjAxODI4fQ.1GaDpXyyXqxBzQSu7Pu3xRpF0_Y5AoQcLRQsgHmIM9I';

// Create Supabase client with service role key for admin access
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function diagnoseTenantProfilesError() {
  console.log('🔍 DIAGNOSING TENANT_PROFILES 400 ERROR');
  console.log('=====================================\n');

  try {
    // 1. Check if tenant_profiles table exists
    console.log('1. Checking if tenant_profiles table exists...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'tenant_profiles');

    if (tablesError) {
      console.error('❌ Error checking tables:', tablesError);
      return;
    }

    if (!tables || tables.length === 0) {
      console.log('❌ tenant_profiles table does NOT exist!');
      console.log('   This is likely the cause of the 400 error.');
      
      // Check what tables do exist
      console.log('\n📋 Checking existing tables...');
      const { data: allTables, error: allTablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .order('table_name');

      if (allTablesError) {
        console.error('❌ Error getting all tables:', allTablesError);
      } else {
        console.log('✅ Existing tables:');
        allTables.forEach(table => console.log(`   - ${table.table_name}`));
      }
      return;
    }

    console.log('✅ tenant_profiles table exists');

    // 2. Check table structure
    console.log('\n2. Checking tenant_profiles table structure...');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', 'tenant_profiles')
      .order('ordinal_position');

    if (columnsError) {
      console.error('❌ Error checking columns:', columnsError);
    } else {
      console.log('✅ Table structure:');
      columns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }

    // 3. Check RLS policies
    console.log('\n3. Checking RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('policyname, permissive, roles, cmd, qual, with_check')
      .eq('tablename', 'tenant_profiles');

    if (policiesError) {
      console.error('❌ Error checking policies:', policiesError);
    } else {
      console.log(`✅ Found ${policies.length} RLS policies:`);
      policies.forEach(policy => {
        console.log(`   - ${policy.policyname} (${policy.cmd})`);
        console.log(`     Roles: ${policy.roles}`);
        console.log(`     Condition: ${policy.qual || 'none'}`);
        console.log(`     With Check: ${policy.with_check || 'none'}`);
      });
    }

    // 4. Check if RLS is enabled
    console.log('\n4. Checking if RLS is enabled...');
    const { data: rlsStatus, error: rlsError } = await supabase
      .from('pg_class')
      .select('relname, relrowsecurity')
      .eq('relname', 'tenant_profiles');

    if (rlsError) {
      console.error('❌ Error checking RLS status:', rlsError);
    } else if (rlsStatus && rlsStatus.length > 0) {
      console.log(`✅ RLS enabled: ${rlsStatus[0].relrowsecurity}`);
    }

    // 5. Test basic SELECT query
    console.log('\n5. Testing basic SELECT query...');
    const { data: selectData, error: selectError } = await supabase
      .from('tenant_profiles')
      .select('*')
      .limit(1);

    if (selectError) {
      console.error('❌ Error with SELECT:', selectError);
    } else {
      console.log(`✅ SELECT works, found ${selectData.length} records`);
    }

    // 6. Test INSERT with minimal data (this is what's failing)
    console.log('\n6. Testing INSERT operation (this is what\'s failing)...');
    
    // First, let's see what the user is trying to insert by checking the request
    console.log('   Request details from log:');
    console.log('   - Method: POST');
    console.log('   - Path: /rest/v1/tenant_profiles');
    console.log('   - Content-Length: 1245 bytes');
    console.log('   - User ID: 929577f0-2124-4157-98e5-81656d0b8e83');

    // Try a minimal insert to see what happens
    const testInsertData = {
      user_id: '929577f0-2124-4157-98e5-81656d0b8e83',
      first_name: 'Test',
      last_name: 'User'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('tenant_profiles')
      .insert(testInsertData)
      .select();

    if (insertError) {
      console.error('❌ INSERT failed with error:', insertError);
      console.log('   Error details:');
      console.log(`   - Code: ${insertError.code}`);
      console.log(`   - Message: ${insertError.message}`);
      console.log(`   - Details: ${insertError.details}`);
      console.log(`   - Hint: ${insertError.hint}`);
    } else {
      console.log('✅ INSERT works:', insertData);
      
      // Clean up test data
      await supabase
        .from('tenant_profiles')
        .delete()
        .eq('user_id', '929577f0-2124-4157-98e5-81656d0b8e83');
    }

    // 7. Check for constraints and triggers
    console.log('\n7. Checking constraints and triggers...');
    
    // Check constraints
    const { data: constraints, error: constraintsError } = await supabase
      .from('information_schema.table_constraints')
      .select('constraint_name, constraint_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'tenant_profiles');

    if (constraintsError) {
      console.error('❌ Error checking constraints:', constraintsError);
    } else {
      console.log('✅ Table constraints:');
      constraints.forEach(constraint => {
        console.log(`   - ${constraint.constraint_name}: ${constraint.constraint_type}`);
      });
    }

    // Check triggers
    const { data: triggers, error: triggersError } = await supabase
      .from('information_schema.triggers')
      .select('trigger_name, event_manipulation, action_timing')
      .eq('event_object_schema', 'public')
      .eq('event_object_table', 'tenant_profiles');

    if (triggersError) {
      console.error('❌ Error checking triggers:', triggersError);
    } else {
      console.log('✅ Table triggers:');
      if (triggers.length === 0) {
        console.log('   - No triggers found');
      } else {
        triggers.forEach(trigger => {
          console.log(`   - ${trigger.trigger_name}: ${trigger.action_timing} ${trigger.event_manipulation}`);
        });
      }
    }

    // 8. Check user permissions
    console.log('\n8. Checking user permissions...');
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById('929577f0-2124-4157-98e5-81656d0b8e83');
    
    if (userError) {
      console.error('❌ Error getting user data:', userError);
    } else {
      console.log('✅ User exists:', userData.user?.email);
      console.log('   User metadata:', userData.user?.user_metadata);
      console.log('   App metadata:', userData.user?.app_metadata);
    }

  } catch (error) {
    console.error('❌ Unexpected error during diagnosis:', error);
  }
}

// Run the diagnosis
diagnoseTenantProfilesError().then(() => {
  console.log('\n🏁 Diagnosis complete!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
