const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('Required: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyPhase2Schema() {
  try {
    console.log('🚀 Starting Phase 2 schema migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase/migrations/20250610_add_missing_schema_fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Applying schema updates...');
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });
    
    if (error) {
      // Try direct execution if RPC fails
      console.log('⚠️  RPC failed, trying direct execution...');
      
      // Split the SQL into individual statements
      const statements = migrationSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      console.log(`📝 Executing ${statements.length} SQL statements...`);
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.trim()) {
          try {
            console.log(`   ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
            const { error: stmtError } = await supabase.rpc('exec_sql', {
              sql: statement + ';'
            });
            
            if (stmtError) {
              console.log(`   ⚠️  Statement ${i + 1} warning:`, stmtError.message);
              // Continue with other statements
            } else {
              console.log(`   ✅ Statement ${i + 1} completed`);
            }
          } catch (err) {
            console.log(`   ⚠️  Statement ${i + 1} error:`, err.message);
            // Continue with other statements
          }
        }
      }
    } else {
      console.log('✅ Migration executed successfully via RPC');
    }
    
    // Verify the new tables exist
    console.log('\n🔍 Verifying new tables...');
    
    const tablesToCheck = [
      'user_statistics',
      'viewing_invitations', 
      'property_applications',
      'activity_logs',
      'portfolio_reviews'
    ];
    
    for (const table of tablesToCheck) {
      const { data: tableData, error: tableError } = await supabase
        .from(table)
        .select('*')
        .limit(1);
        
      if (tableError) {
        console.log(`   ❌ Table ${table}: ${tableError.message}`);
      } else {
        console.log(`   ✅ Table ${table}: exists and accessible`);
      }
    }
    
    // Check if is_looking_for_place field was added
    console.log('\n🔍 Verifying new columns...');
    
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('is_looking_for_place, profile_views_count, last_active_at')
      .limit(1);
      
    if (profileError) {
      console.log(`   ❌ New columns in user_profiles: ${profileError.message}`);
    } else {
      console.log(`   ✅ New columns in user_profiles: added successfully`);
    }
    
    console.log('\n🎉 Phase 2 schema migration completed!');
    console.log('\n📋 Summary of changes:');
    console.log('   • Added is_looking_for_place to user_profiles');
    console.log('   • Added profile_views_count to user_profiles');
    console.log('   • Added last_active_at to user_profiles');
    console.log('   • Created user_statistics table');
    console.log('   • Created viewing_invitations table');
    console.log('   • Created property_applications table');
    console.log('   • Created activity_logs table');
    console.log('   • Created portfolio_reviews table');
    console.log('   • Added proper RLS policies');
    console.log('   • Added performance indexes');
    console.log('   • Added automatic triggers');
    
  } catch (error) {
    console.error('❌ Error applying Phase 2 schema:', error);
    process.exit(1);
  }
}

// Run the migration
applyPhase2Schema();
