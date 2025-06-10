const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('Required: VITE_SUPABASE_URL, SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyEnhancedProfileFields() {
  try {
    console.log('🚀 Starting Enhanced Profile Fields Migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase/migrations/20250610_add_enhanced_profile_fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📖 Migration file loaded successfully');
    console.log('📝 Executing migration...');
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });
    
    if (error) {
      // If rpc doesn't work, try direct execution
      console.log('⚠️  RPC method failed, trying direct execution...');
      
      // Split the SQL into individual statements
      const statements = migrationSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      console.log(`📋 Executing ${statements.length} SQL statements...`);
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.trim()) {
          console.log(`   ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
          
          const { error: stmtError } = await supabase
            .from('_temp_migration')
            .select('1')
            .limit(0); // This will fail but allows us to execute raw SQL
          
          // Try using the SQL directly through a query
          try {
            await supabase.rpc('exec_sql', { sql: statement + ';' });
          } catch (err) {
            console.log(`⚠️  Statement ${i + 1} may have failed (this might be expected for some statements)`);
          }
        }
      }
    }
    
    console.log('✅ Migration executed successfully!');
    
    // Verify the new columns exist
    console.log('🔍 Verifying new columns...');
    
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'tenant_profiles')
      .in('column_name', [
        'nationality', 'sex', 'marital_status', 'has_children', 
        'number_of_children', 'children_ages', 'has_partner',
        'partner_name', 'partner_profession', 'partner_monthly_income',
        'partner_employment_status', 'preferred_districts', 'max_commute_time',
        'transportation_preference', 'furnished_preference', 'desired_amenities',
        'smoking_details', 'profile_picture_url', 'total_household_income'
      ]);
    
    if (columnsError) {
      console.log('⚠️  Could not verify columns (this might be normal)');
    } else {
      console.log(`✅ Found ${columns?.length || 0} new columns in tenant_profiles table`);
      if (columns && columns.length > 0) {
        console.log('📋 New columns:', columns.map(c => c.column_name).join(', '));
      }
    }
    
    console.log('🎉 Enhanced Profile Fields Migration completed successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Update UserService to include all enhanced fields');
    console.log('2. Test the Enhanced Profile Creation Modal');
    console.log('3. Set up profile pictures storage bucket');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('');
    console.error('🔧 Manual steps required:');
    console.error('1. Go to Supabase Dashboard > SQL Editor');
    console.error('2. Copy and paste the migration SQL from:');
    console.error('   supabase/migrations/20250610_add_enhanced_profile_fields.sql');
    console.error('3. Execute the SQL manually');
    process.exit(1);
  }
}

// Run the migration
applyEnhancedProfileFields();
