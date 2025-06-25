const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('🚀 APPLYING GUARANTOR AND TIMING FIELDS MIGRATION');
  console.log('=' .repeat(60));

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250612_add_guarantor_and_timing_fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded successfully');
    console.log('🔧 Executing migration...');

    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });

    if (error) {
      console.error('❌ Migration failed:', error);
      return;
    }

    console.log('✅ Migration executed successfully!');
    
    // Verify the new columns exist
    console.log('\n🔍 Verifying new columns...');
    
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'tenant_profiles')
      .in('column_name', [
        'guarantor_available',
        'guarantor_name', 
        'guarantor_phone',
        'guarantor_income',
        'guarantor_relationship',
        'income_proof_available',
        'move_in_date_preferred',
        'move_in_date_earliest',
        'availability_flexible'
      ]);

    if (columnError) {
      console.error('❌ Error verifying columns:', columnError);
      return;
    }

    const foundColumns = columns?.map(col => col.column_name) || [];
    const expectedColumns = [
      'guarantor_available',
      'guarantor_name', 
      'guarantor_phone',
      'guarantor_income',
      'guarantor_relationship',
      'income_proof_available',
      'move_in_date_preferred',
      'move_in_date_earliest',
      'availability_flexible'
    ];

    console.log(`✅ Found ${foundColumns.length}/${expectedColumns.length} new columns:`);
    foundColumns.forEach(col => console.log(`   • ${col}`));

    if (foundColumns.length === expectedColumns.length) {
      console.log('\n🎉 MIGRATION COMPLETED SUCCESSFULLY!');
      console.log('\n📋 Next Steps:');
      console.log('   1. Update the profile creation modal to include new fields');
      console.log('   2. Test profile creation with guarantor information');
      console.log('   3. Test profile creation with timing preferences');
      console.log('   4. Verify Dutch date format (dd/mm/yyyy) works correctly');
    } else {
      console.log('\n⚠️  Some columns may be missing. Please check the migration manually.');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

applyMigration();
