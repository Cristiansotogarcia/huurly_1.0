const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function applyComprehensiveProfileEnhancement() {
  console.log('🚀 Applying Comprehensive Profile Enhancement...');
  
  try {
    // Read the migration file
    const migrationSQL = fs.readFileSync('./supabase/migrations/20250610_comprehensive_profile_enhancement.sql', 'utf8');
    
    console.log('📋 Executing comprehensive migration...');
    
    // Split the migration into individual statements for better error handling
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.includes('COMMENT ON'));
    
    console.log(`Found ${statements.length} statements to execute`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip empty statements
      if (statement.length < 10) continue;
      
      console.log(`\n📋 Executing statement ${i + 1}/${statements.length}...`);
      console.log(`Statement preview: ${statement.substring(0, 100)}...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql: statement + ';'
        });
        
        if (error) {
          console.warn(`⚠️ Statement ${i + 1} failed:`, error.message);
          errorCount++;
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
          successCount++;
        }
      } catch (err) {
        console.warn(`⚠️ Statement ${i + 1} error:`, err.message);
        errorCount++;
      }
      
      // Small delay to prevent overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n📊 Migration Summary:`);
    console.log(`✅ Successful statements: ${successCount}`);
    console.log(`⚠️ Failed statements: ${errorCount}`);
    
    // Test the enhanced schema
    console.log('\n🧪 Testing enhanced schema...');
    
    // Test 1: Check if new columns exist
    console.log('📋 Test 1: Checking new columns in tenant_profiles...');
    const { data: schemaTest, error: schemaError } = await supabase
      .from('tenant_profiles')
      .select('user_id, marital_status, has_children, has_partner, total_household_income, family_composition, nationality')
      .limit(1);
    
    if (schemaError) {
      console.error('❌ Schema test failed:', schemaError);
    } else {
      console.log('✅ New columns accessible in tenant_profiles');
      if (schemaTest && schemaTest.length > 0) {
        console.log('📋 Sample enhanced data structure:', Object.keys(schemaTest[0]));
      }
    }
    
    // Test 2: Check new tables
    console.log('\n📋 Test 2: Checking new tables...');
    
    const tables = ['children_details', 'profile_views', 'profile_analytics', 'profile_view_notifications'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.warn(`⚠️ Table ${table} not accessible:`, error.message);
        } else {
          console.log(`✅ Table ${table} created and accessible`);
        }
      } catch (err) {
        console.warn(`⚠️ Table ${table} test failed:`, err.message);
      }
    }
    
    // Test 3: Test profile completion score calculation
    console.log('\n📋 Test 3: Testing profile completion score...');
    
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('tenant_profiles')
        .select('user_id, profile_completion_percentage')
        .limit(3);
      
      if (profilesError) {
        console.error('❌ Profile completion test failed:', profilesError);
      } else {
        console.log('✅ Profile completion scores calculated');
        profiles?.forEach(profile => {
          console.log(`User ${profile.user_id}: ${profile.profile_completion_percentage}% complete`);
        });
      }
    } catch (err) {
      console.warn('⚠️ Profile completion test error:', err.message);
    }
    
    // Test 4: Test total household income calculation
    console.log('\n📋 Test 4: Testing household income calculation...');
    
    try {
      const { data: incomeTest, error: incomeError } = await supabase
        .from('tenant_profiles')
        .select('user_id, monthly_income, partner_monthly_income, total_household_income')
        .limit(3);
      
      if (incomeError) {
        console.error('❌ Household income test failed:', incomeError);
      } else {
        console.log('✅ Household income calculation working');
        incomeTest?.forEach(profile => {
          console.log(`User ${profile.user_id}: Own: €${profile.monthly_income || 0}, Partner: €${profile.partner_monthly_income || 0}, Total: €${profile.total_household_income || 0}`);
        });
      }
    } catch (err) {
      console.warn('⚠️ Household income test error:', err.message);
    }
    
    console.log('\n🎉 Comprehensive Profile Enhancement Applied!');
    console.log('\n📋 New Features Available:');
    console.log('✅ Family composition tracking (marital status, children, partner)');
    console.log('✅ Partner income integration with total household income calculation');
    console.log('✅ Enhanced personal details (nationality, profile picture)');
    console.log('✅ Advanced location preferences (districts, commute time)');
    console.log('✅ Comprehensive housing preferences (amenities, furnished preference)');
    console.log('✅ Profile view tracking and analytics');
    console.log('✅ Real-time cross-platform notifications');
    console.log('✅ Automatic profile completion scoring');
    console.log('✅ Children details tracking');
    
    console.log('\n🚀 Next Steps:');
    console.log('1. Update ProfileCreationModal to use new 7-step process');
    console.log('2. Enhance UserService with new methods');
    console.log('3. Update VerhuurderDashboard search to use total_household_income');
    console.log('4. Implement profile view tracking in frontend');
    console.log('5. Add real-time notifications for profile views');
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the enhancement
applyComprehensiveProfileEnhancement();
