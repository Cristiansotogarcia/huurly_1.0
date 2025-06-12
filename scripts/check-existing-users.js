import { createClient } from '@supabase/supabase-js';

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
  console.log('🔍 Checking for existing users...\n');
  
  try {
    // Try to query auth.users table directly
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error accessing auth users:', authError.message);
    } else {
      console.log(`✅ Found ${authUsers.users.length} users in auth.users:`);
      authUsers.users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.email} (ID: ${user.id.substring(0, 8)}...)`);
      });
    }
    
    // Check if public schema tables exist
    console.log('\n🔍 Checking public schema tables...');
    
    // Try to query information_schema
    const { data: tables, error: tablesError } = await supabase
      .rpc('execute_sql', { 
        sql: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`
      });
    
    if (tablesError) {
      console.log('⚠️ Cannot execute SQL directly:', tablesError.message);
      
      // Try alternative approach - check if we can access any known tables
      const testTables = ['profiles', 'user_roles', 'tenant_profiles'];
      
      for (const table of testTables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1);
          
          if (!error) {
            console.log(`✅ Table '${table}' exists and is accessible`);
          } else {
            console.log(`❌ Table '${table}' error: ${error.message}`);
          }
        } catch (err) {
          console.log(`❌ Table '${table}' not accessible: ${err.message}`);
        }
      }
    } else {
      console.log('✅ Public schema tables:');
      if (tables && tables.length > 0) {
        tables.forEach(row => {
          console.log(`  - ${row.table_name}`);
        });
      } else {
        console.log('  No tables found in public schema');
      }
    }
    
    // Check for specific user
    console.log('\n🔍 Looking for cristiansotogarcia@gmail.com...');
    const targetUser = authUsers.users.find(user => user.email === 'cristiansotogarcia@gmail.com');
    
    if (targetUser) {
      console.log('✅ Found target user:');
      console.log(`  Email: ${targetUser.email}`);
      console.log(`  ID: ${targetUser.id}`);
      console.log(`  Created: ${targetUser.created_at}`);
      console.log(`  Confirmed: ${targetUser.email_confirmed_at ? 'Yes' : 'No'}`);
    } else {
      console.log('❌ Target user cristiansotogarcia@gmail.com not found');
    }
    
  } catch (error) {
    console.error('❌ Error checking users:', error.message);
  }
}

checkUsers().catch(console.error);
