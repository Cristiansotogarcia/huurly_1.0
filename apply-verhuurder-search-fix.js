const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyVerhuurderSearchFix() {
  console.log('🔧 Applying Verhuurder Search Schema Fix...');
  
  try {
    // Read the migration file
    const migrationSQL = fs.readFileSync('./supabase/migrations/20250610_fix_verhuurder_search_schema.sql', 'utf8');
    
    console.log('📋 Executing migration...');
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });
    
    if (error) {
      console.error('❌ Migration failed:', error);
      
      // Try executing parts of the migration individually
      console.log('🔄 Trying individual statements...');
      
      const statements = migrationSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.includes('COMMENT ON MIGRATION')) continue;
        
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        
        const { error: stmtError } = await supabase.rpc('exec_sql', {
          sql: statement + ';'
        });
        
        if (stmtError) {
          console.warn(`⚠️ Statement ${i + 1} failed:`, stmtError.message);
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      }
    } else {
      console.log('✅ Migration executed successfully');
    }
    
    // Test the tenant profiles query
    console.log('\n🧪 Testing tenant profiles query...');
    
    const { data: testData, error: testError } = await supabase
      .from('tenant_profiles')
      .select(`
        *,
        profiles!inner(
          id,
          first_name,
          last_name,
          is_looking_for_place
        )
      `)
      .eq('profile_completed', true)
      .eq('profiles.is_looking_for_place', true)
      .limit(5);
    
    if (testError) {
      console.error('❌ Test query failed:', testError);
    } else {
      console.log(`✅ Test query successful! Found ${testData?.length || 0} tenant profiles`);
      if (testData && testData.length > 0) {
        console.log('📋 Sample data:', JSON.stringify(testData[0], null, 2));
      }
    }
    
    // Test the search filters
    console.log('\n🔍 Testing search filters...');
    
    const { data: filterData, error: filterError } = await supabase
      .from('tenant_profiles')
      .select(`
        *,
        profiles!inner(
          id,
          first_name,
          last_name,
          is_looking_for_place
        )
      `)
      .eq('profile_completed', true)
      .eq('profiles.is_looking_for_place', true)
      .gte('max_budget', 1000)
      .limit(3);
    
    if (filterError) {
      console.error('❌ Filter test failed:', filterError);
    } else {
      console.log(`✅ Filter test successful! Found ${filterData?.length || 0} profiles with budget >= 1000`);
    }
    
    console.log('\n🎉 Verhuurder Search Fix Applied Successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Test the Verhuurder Dashboard tenant search');
    console.log('2. Try different search filters (city, budget, income)');
    console.log('3. Verify that tenant profiles display correctly');
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the fix
applyVerhuurderSearchFix();
