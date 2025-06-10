const { createClient } = require('@supabase/supabase-js');

// Database credentials from .env
const supabaseUrl = 'https://lxtkotgfsnahwncgcfnl.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dGtvdGdmc25haHduY2djZm5sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAyNTgyOCwiZXhwIjoyMDY0NjAxODI4fQ.1GaDpXyyXqxBzQSu7Pu3xRpF0_Y5AoQcLRQsgHmIM9I';

// Create Supabase client with service role key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugTenantProfilesError() {
  console.log('🔍 Debugging tenant_profiles 400 error...\n');
  
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
      console.log('📝 This is likely the cause of the 400 error.');
      
      // Check what tables do exist
      console.log('\n2. Checking what profile-related tables exist...');
      const { data: allTables, error: allTablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .like('table_name', '%profile%');
      
      if (allTablesError) {
        console.error('❌ Error checking all tables:', allTablesError);
      } else {
        console.log('📋 Profile-related tables found:');
        allTables.forEach(table => console.log(`  - ${table.table_name}`));
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
      return;
    }
    
    console.log('📋 Table structure:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}) ${col.column_default ? `default: ${col.column_default}` : ''}`);
    });
    
    // 3. Check RLS policies
    console.log('\n3. Checking RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('policyname, permissive, roles, cmd, qual, with_check')
      .eq('tablename', 'tenant_profiles');
    
    if (policiesError) {
      console.error('❌ Error checking policies:', policiesError);
    } else {
      console.log('🔒 RLS Policies:');
      if (policies.length === 0) {
        console.log('  - No RLS policies found');
      } else {
        policies.forEach(policy => {
          console.log(`  - ${policy.policyname}: ${policy.cmd} for roles: ${policy.roles}`);
        });
      }
    }
    
    // 4. Check if RLS is enabled
    console.log('\n4. Checking if RLS is enabled...');
    const { data: rlsStatus, error: rlsError } = await supabase
      .from('pg_class')
      .select('relname, relrowsecurity')
      .eq('relname', 'tenant_profiles');
    
    if (rlsError) {
      console.error('❌ Error checking RLS status:', rlsError);
    } else {
      console.log(`🔒 RLS enabled: ${rlsStatus[0]?.relrowsecurity || false}`);
    }
    
    // 5. Test user authentication from the error log
    const userId = '929577f0-2124-4157-98e5-81656d0b8e83';
    console.log(`\n5. Checking user ${userId}...`);
    
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError) {
      console.error('❌ Error checking user:', userError);
    } else {
      console.log('👤 User found:', {
        id: user.user.id,
        email: user.user.email,
        created_at: user.user.created_at,
        last_sign_in_at: user.user.last_sign_in_at
      });
    }
    
    // 6. Check user roles
    console.log('\n6. Checking user roles...');
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId);
    
    if (userRolesError) {
      console.error('❌ Error checking user roles:', userRolesError);
    } else {
      console.log('👥 User roles:', userRoles);
    }
    
    // 7. Try to perform the same operation that's failing
    console.log('\n7. Testing tenant_profiles INSERT operation...');
    
    // First, let's see what data might be causing the issue
    // Check existing tenant_profiles for this user
    const { data: existingProfile, error: existingError } = await supabase
      .from('tenant_profiles')
      .select('*')
      .eq('user_id', userId);
    
    if (existingError) {
      console.error('❌ Error checking existing profile:', existingError);
    } else {
      console.log('📄 Existing tenant profile:', existingProfile);
    }
    
    // 8. Check constraints and triggers
    console.log('\n8. Checking table constraints...');
    const { data: constraints, error: constraintsError } = await supabase
      .from('information_schema.table_constraints')
      .select('constraint_name, constraint_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'tenant_profiles');
    
    if (constraintsError) {
      console.error('❌ Error checking constraints:', constraintsError);
    } else {
      console.log('🔗 Table constraints:');
      constraints.forEach(constraint => {
        console.log(`  - ${constraint.constraint_name}: ${constraint.constraint_type}`);
      });
    }
    
    // 9. Check for any triggers
    console.log('\n9. Checking triggers...');
    const { data: triggers, error: triggersError } = await supabase
      .from('information_schema.triggers')
      .select('trigger_name, event_manipulation, action_timing')
      .eq('event_object_schema', 'public')
      .eq('event_object_table', 'tenant_profiles');
    
    if (triggersError) {
      console.error('❌ Error checking triggers:', triggersError);
    } else {
      console.log('⚡ Triggers:');
      if (triggers.length === 0) {
        console.log('  - No triggers found');
      } else {
        triggers.forEach(trigger => {
          console.log(`  - ${trigger.trigger_name}: ${trigger.action_timing} ${trigger.event_manipulation}`);
        });
      }
    }
    
    console.log('\n✅ Diagnostic complete!');
    
  } catch (error) {
    console.error('❌ Unexpected error during diagnosis:', error);
  }
}

// Run the diagnostic
debugTenantProfilesError();
