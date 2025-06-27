const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

console.log('🔧 Enhanced Profile Fields Migration');
console.log('URL:', supabaseUrl ? 'Found' : 'Missing');
console.log('Key:', supabaseKey ? 'Found' : 'Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  try {
    console.log('\n🚀 Applying enhanced profile fields migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250612_add_enhanced_profile_fields.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Migration file not found:', migrationPath);
      return;
    }
    
    const sql = fs.readFileSync(migrationPath, 'utf8');
    console.log('📄 Migration file loaded successfully');
    
    // Test database connection first
    console.log('\n🔍 Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('tenant_profiles')
      .select('user_id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      return;
    }
    
    console.log('✅ Database connection successful');
    
    // Check if enhanced fields already exist
    console.log('\n🔍 Checking current schema...');
    const { data: currentData, error: currentError } = await supabase
      .from('tenant_profiles')
      .select('*')
      .limit(1);
    
    if (currentData && currentData.length > 0) {
      const existingColumns = Object.keys(currentData[0]);
      console.log('📋 Current columns:', existingColumns.length);
      
      const enhancedFields = ['nationality', 'sex', 'marital_status', 'has_children', 'partner_name'];
      const missingFields = enhancedFields.filter(field => !existingColumns.includes(field));
      
      if (missingFields.length === 0) {
        console.log('✅ Enhanced fields already exist!');
        return;
      }
      
      console.log('📝 Missing fields:', missingFields);
    }
    
    // Since we can't execute DDL directly, provide manual instructions
    console.log('\n📋 Manual Migration Required');
    console.log('🌐 Please go to: https://supabase.com/dashboard/project/sqhultitvpivlnlgogen/sql');
    console.log('📝 Copy and paste the following SQL:');
    console.log('\n' + '='.repeat(80));
    console.log(sql);
    console.log('='.repeat(80));
    
    // Try to add one field at a time to test
    console.log('\n🧪 Testing individual field addition...');
    
    const testFields = [
      "ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS nationality TEXT DEFAULT 'Nederlandse';",
      "ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS sex TEXT;",
      "ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS marital_status TEXT DEFAULT 'single';"
    ];
    
    for (const fieldSQL of testFields) {
      try {
        // This won't work with regular API key, but let's try
        const { error } = await supabase.rpc('exec', { sql: fieldSQL });
        if (error) {
          console.log('⚠️ DDL execution not available via API');
          break;
        } else {
          console.log('✅ Field added successfully');
        }
      } catch (err) {
        console.log('⚠️ DDL execution requires service role key');
        break;
      }
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  }
}

applyMigration();
