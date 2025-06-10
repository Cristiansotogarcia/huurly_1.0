const { createClient } = require('@supabase/supabase-js');

// Database credentials from .env
const SUPABASE_URL = 'https://lxtkotgfsnahwncgcfnl.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dGtvdGdmc25haHduY2djZm5sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAyNTgyOCwiZXhwIjoyMDY0NjAxODI4fQ.1GaDpXyyXqxBzQSu7Pu3xRpF0_Y5AoQcLRQsgHmIM9I';

console.log('🔍 SIMPLE TENANT_PROFILES DIAGNOSIS');
console.log('===================================');

async function simpleDiagnosis() {
  try {
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    console.log('✅ Supabase client created');

    // 1. Check if we can connect to the database
    console.log('\n1. Testing database connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);

    if (connectionError) {
      console.error('❌ Database connection failed:', connectionError);
      return;
    }
    console.log('✅ Database connection successful');

    // 2. Check if tenant_profiles table exists
    console.log('\n2. Checking if tenant_profiles table exists...');
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
      
      // Show what tables do exist
      const { data: allTables, error: allTablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .order('table_name');

      if (!allTablesError && allTables) {
        console.log('\n📋 Existing tables:');
        allTables.forEach(table => console.log(`   - ${table.table_name}`));
      }
      return;
    }

    console.log('✅ tenant_profiles table exists');

    // 3. Check table structure
    console.log('\n3. Checking table structure...');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', 'tenant_profiles')
      .order('ordinal_position');

    if (columnsError) {
      console.error('❌ Error checking columns:', columnsError);
    } else {
      console.log('✅ Table columns:');
      columns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }

    // 4. Test simple SELECT
    console.log('\n4. Testing SELECT operation...');
    const { data: selectData, error: selectError } = await supabase
      .from('tenant_profiles')
      .select('*')
      .limit(1);

    if (selectError) {
      console.error('❌ SELECT failed:', selectError);
    } else {
      console.log(`✅ SELECT works, found ${selectData.length} records`);
    }

    // 5. Test INSERT with minimal data
    console.log('\n5. Testing INSERT operation...');
    const testData = {
      user_id: '929577f0-2124-4157-98e5-81656d0b8e83',
      first_name: 'Test',
      last_name: 'User'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('tenant_profiles')
      .insert(testData)
      .select();

    if (insertError) {
      console.error('❌ INSERT failed:', insertError);
      console.log('   This is likely the cause of the 400 error!');
      console.log(`   Error code: ${insertError.code}`);
      console.log(`   Error message: ${insertError.message}`);
      console.log(`   Error details: ${insertError.details}`);
      console.log(`   Error hint: ${insertError.hint}`);
    } else {
      console.log('✅ INSERT works:', insertData);
      
      // Clean up
      await supabase
        .from('tenant_profiles')
        .delete()
        .eq('user_id', '929577f0-2124-4157-98e5-81656d0b8e83');
      console.log('✅ Test data cleaned up');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

simpleDiagnosis().then(() => {
  console.log('\n🏁 Diagnosis complete');
}).catch(error => {
  console.error('❌ Fatal error:', error);
});
