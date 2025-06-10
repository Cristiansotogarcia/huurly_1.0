import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Create clients - one with service role, one with anon key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

async function debugTenantProfiles400Error() {
  console.log('🔍 Debugging tenant_profiles 400 error...\n');

  try {
    // 1. Check if tenant_profiles table exists and its structure
    console.log('1. Checking tenant_profiles table structure...');
    const { data: tableInfo, error: tableError } = await supabaseAdmin
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'tenant_profiles')
      .eq('table_schema', 'public');

    if (tableError) {
      console.error('❌ Error checking table structure:', tableError);
    } else if (!tableInfo || tableInfo.length === 0) {
      console.log('❌ tenant_profiles table does not exist!');
      
      // Check if it exists in any schema
      const { data: allSchemas, error: schemaError } = await supabaseAdmin
        .from('information_schema.columns')
        .select('table_schema, column_name, data_type')
        .eq('table_name', 'tenant_profiles');
      
      if (allSchemas && allSchemas.length > 0) {
        console.log('📋 Found tenant_profiles in other schemas:', allSchemas);
      } else {
        console.log('❌ tenant_profiles table not found in any schema');
      }
    } else {
      console.log('✅ tenant_profiles table structure:');
      tableInfo.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default})`);
      });
    }

    // 2. Check RLS policies on tenant_profiles
    console.log('\n2. Checking RLS policies...');
    const { data: rlsPolicies, error: rlsError } = await supabaseAdmin
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'tenant_profiles');

    if (rlsError) {
      console.error('❌ Error checking RLS policies:', rlsError);
    } else {
      console.log('📋 RLS Policies for tenant_profiles:');
      if (rlsPolicies.length === 0) {
        console.log('  No RLS policies found');
      } else {
        rlsPolicies.forEach(policy => {
          console.log(`  - ${policy.policyname}: ${policy.cmd} (${policy.permissive ? 'PERMISSIVE' : 'RESTRICTIVE'})`);
          console.log(`    Roles: ${policy.roles}`);
          console.log(`    Using: ${policy.qual}`);
          console.log(`    With check: ${policy.with_check}`);
        });
      }
    }

    // 3. Check if RLS is enabled
    console.log('\n3. Checking if RLS is enabled...');
    const { data: rlsStatus, error: rlsStatusError } = await supabaseAdmin
      .from('pg_class')
      .select('relname, relrowsecurity')
      .eq('relname', 'tenant_profiles');

    if (rlsStatusError) {
      console.error('❌ Error checking RLS status:', rlsStatusError);
    } else if (rlsStatus && rlsStatus.length > 0) {
      console.log(`📋 RLS enabled: ${rlsStatus[0].relrowsecurity}`);
    }

    // 4. Test the authenticated user from the log
    const testUserId = '929577f0-2124-4157-98e5-81656d0b8e83';
    console.log(`\n4. Testing with user ID from log: ${testUserId}`);

    // Create a client with the user's session
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(testUserId);
    
    if (authError) {
      console.error('❌ Error getting user:', authError);
    } else {
      console.log('✅ User found:', {
        id: authData.user.id,
        email: authData.user.email,
        role: authData.user.role,
        created_at: authData.user.created_at
      });
    }

    // 5. Check user_roles table for this user
    console.log('\n5. Checking user roles...');
    const { data: userRoles, error: userRolesError } = await supabaseAdmin
      .from('user_roles')
      .select('*')
      .eq('user_id', testUserId);

    if (userRolesError) {
      console.error('❌ Error checking user roles:', userRolesError);
    } else {
      console.log('📋 User roles:', userRoles);
    }

    // 6. Try to read from tenant_profiles as admin
    console.log('\n6. Testing SELECT on tenant_profiles as admin...');
    const { data: selectData, error: selectError } = await supabaseAdmin
      .from('tenant_profiles')
      .select('*')
      .limit(5);

    if (selectError) {
      console.error('❌ Error selecting from tenant_profiles:', selectError);
    } else {
      console.log(`✅ Found ${selectData.length} tenant profiles`);
      if (selectData.length > 0) {
        console.log('Sample record:', selectData[0]);
      }
    }

    // 7. Try to simulate the POST request that's failing
    console.log('\n7. Testing POST to tenant_profiles...');
    
    // First, let's see what a typical tenant profile looks like
    const { data: sampleProfile, error: sampleError } = await supabaseAdmin
      .from('tenant_profiles')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.error('❌ Error getting sample profile:', sampleError);
    } else if (sampleProfile && sampleProfile.length > 0) {
      console.log('📋 Sample tenant profile structure:', Object.keys(sampleProfile[0]));
    }

    // 8. Test with anon client (simulating the frontend request)
    console.log('\n8. Testing with anon client (simulating frontend)...');
    
    // Try to select first
    const { data: anonSelectData, error: anonSelectError } = await supabaseAnon
      .from('tenant_profiles')
      .select('*')
      .limit(1);

    if (anonSelectError) {
      console.error('❌ Anon client SELECT error:', anonSelectError);
    } else {
      console.log('✅ Anon client can SELECT from tenant_profiles');
    }

    // Try a simple POST
    const testProfileData = {
      user_id: testUserId,
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      phone: '1234567890'
    };

    console.log('\n9. Attempting POST with test data...');
    const { data: postData, error: postError } = await supabaseAnon
      .from('tenant_profiles')
      .insert(testProfileData)
      .select();

    if (postError) {
      console.error('❌ POST error (this is likely the 400 error):', postError);
      console.error('Error details:', {
        message: postError.message,
        details: postError.details,
        hint: postError.hint,
        code: postError.code
      });
    } else {
      console.log('✅ POST successful:', postData);
    }

    // 10. Check for any constraints or triggers
    console.log('\n10. Checking table constraints...');
    const { data: constraints, error: constraintsError } = await supabaseAdmin
      .from('information_schema.table_constraints')
      .select('constraint_name, constraint_type')
      .eq('table_name', 'tenant_profiles')
      .eq('table_schema', 'public');

    if (constraintsError) {
      console.error('❌ Error checking constraints:', constraintsError);
    } else {
      console.log('📋 Table constraints:', constraints);
    }

    // 11. Check for triggers
    console.log('\n11. Checking triggers...');
    const { data: triggers, error: triggersError } = await supabaseAdmin
      .from('information_schema.triggers')
      .select('trigger_name, event_manipulation, action_statement')
      .eq('event_object_table', 'tenant_profiles');

    if (triggersError) {
      console.error('❌ Error checking triggers:', triggersError);
    } else {
      console.log('📋 Triggers:', triggers);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the debug
debugTenantProfiles400Error().then(() => {
  console.log('\n🔍 Debug complete');
  process.exit(0);
}).catch(error => {
  console.error('❌ Debug failed:', error);
  process.exit(1);
});
