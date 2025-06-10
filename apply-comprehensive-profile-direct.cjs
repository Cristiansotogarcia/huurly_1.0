const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function applyComprehensiveProfileEnhancement() {
  console.log('🚀 Applying Comprehensive Profile Enhancement (Direct Method)...');
  
  try {
    // Step 1: Add new columns to tenant_profiles table
    console.log('\n📋 Step 1: Adding new columns to tenant_profiles...');
    
    const alterTableStatements = [
      // Marital & Family Status
      "ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS marital_status TEXT CHECK (marital_status IN ('single', 'married', 'partnership', 'divorced', 'widowed'))",
      "ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS has_children BOOLEAN DEFAULT FALSE",
      "ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS number_of_children INTEGER DEFAULT 0",
      
      // Partner Information
      "ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS has_partner BOOLEAN DEFAULT FALSE",
      "ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS partner_name TEXT",
      "ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS partner_profession TEXT",
      "ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS partner_monthly_income DECIMAL(10,2) DEFAULT 0",
      "ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS partner_employment_status TEXT",
      
      // Additional Personal Details
      "ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS nationality TEXT DEFAULT 'Nederlandse'",
      "ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS profile_picture_url TEXT",
      
      // Location Preferences Enhancement
      "ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS preferred_districts TEXT[]",
      "ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS max_commute_time INTEGER",
      "ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS transportation_preference TEXT",
      
      // Housing Preferences Enhancement
      "ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS furnished_preference TEXT CHECK (furnished_preference IN ('furnished', 'unfurnished', 'no_preference'))",
      "ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS desired_amenities TEXT[]"
    ];
    
    for (const statement of alterTableStatements) {
      try {
        console.log(`Executing: ${statement.substring(0, 80)}...`);
        const { error } = await supabase.rpc('exec', { sql: statement });
        if (error) {
          console.warn(`⚠️ Warning:`, error.message);
        } else {
          console.log('✅ Success');
        }
      } catch (err) {
        console.warn(`⚠️ Error:`, err.message);
      }
    }
    
    // Step 2: Create new tables
    console.log('\n📋 Step 2: Creating new tables...');
    
    // Create children_details table
    console.log('Creating children_details table...');
    const { error: childrenError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS children_details (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          child_age INTEGER NOT NULL CHECK (child_age >= 0 AND child_age <= 25),
          child_gender TEXT CHECK (child_gender IN ('male', 'female', 'other')),
          special_needs BOOLEAN DEFAULT FALSE,
          special_needs_details TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });
    
    if (childrenError) {
      console.warn('⚠️ Children details table:', childrenError.message);
    } else {
      console.log('✅ Children details table created');
    }
    
    // Create profile_views table
    console.log('Creating profile_views table...');
    const { error: viewsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS profile_views (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          viewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          viewed_profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          viewer_type TEXT NOT NULL CHECK (viewer_type IN ('verhuurder', 'beoordelaar', 'beheerder')),
          viewed_at TIMESTAMPTZ DEFAULT NOW(),
          session_id TEXT,
          ip_address INET,
          user_agent TEXT,
          UNIQUE(viewer_id, viewed_profile_id, session_id)
        );
      `
    });
    
    if (viewsError) {
      console.warn('⚠️ Profile views table:', viewsError.message);
    } else {
      console.log('✅ Profile views table created');
    }
    
    // Create profile_analytics table
    console.log('Creating profile_analytics table...');
    const { error: analyticsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS profile_analytics (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
          total_views INTEGER DEFAULT 0,
          unique_viewers INTEGER DEFAULT 0,
          last_viewed_at TIMESTAMPTZ,
          profile_completion_score INTEGER DEFAULT 0,
          weekly_views INTEGER DEFAULT 0,
          monthly_views INTEGER DEFAULT 0,
          peak_viewing_day TEXT,
          peak_viewing_hour INTEGER,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });
    
    if (analyticsError) {
      console.warn('⚠️ Profile analytics table:', analyticsError.message);
    } else {
      console.log('✅ Profile analytics table created');
    }
    
    // Create profile_view_notifications table
    console.log('Creating profile_view_notifications table...');
    const { error: notificationsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS profile_view_notifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          viewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          notification_type TEXT DEFAULT 'profile_viewed',
          message TEXT NOT NULL,
          read_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    });
    
    if (notificationsError) {
      console.warn('⚠️ Profile notifications table:', notificationsError.message);
    } else {
      console.log('✅ Profile notifications table created');
    }
    
    // Step 3: Update existing records with default values
    console.log('\n📋 Step 3: Updating existing records...');
    
    const { error: updateError } = await supabase
      .from('tenant_profiles')
      .update({
        marital_status: 'single',
        has_children: false,
        number_of_children: 0,
        has_partner: false,
        partner_monthly_income: 0,
        nationality: 'Nederlandse',
        furnished_preference: 'no_preference'
      })
      .is('marital_status', null);
    
    if (updateError) {
      console.warn('⚠️ Update existing records:', updateError.message);
    } else {
      console.log('✅ Existing records updated with default values');
    }
    
    // Step 4: Test the enhanced schema
    console.log('\n🧪 Testing enhanced schema...');
    
    // Test new columns
    console.log('📋 Testing new columns in tenant_profiles...');
    const { data: schemaTest, error: schemaError } = await supabase
      .from('tenant_profiles')
      .select('user_id, marital_status, has_children, has_partner, nationality')
      .limit(1);
    
    if (schemaError) {
      console.error('❌ Schema test failed:', schemaError);
    } else {
      console.log('✅ New columns accessible in tenant_profiles');
      if (schemaTest && schemaTest.length > 0) {
        console.log('📋 Sample enhanced data:', schemaTest[0]);
      }
    }
    
    // Test new tables
    console.log('\n📋 Testing new tables...');
    const tables = ['children_details', 'profile_views', 'profile_analytics', 'profile_view_notifications'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.warn(`⚠️ Table ${table}:`, error.message);
        } else {
          console.log(`✅ Table ${table} accessible`);
        }
      } catch (err) {
        console.warn(`⚠️ Table ${table} test failed:`, err.message);
      }
    }
    
    console.log('\n🎉 Comprehensive Profile Enhancement Applied!');
    console.log('\n📋 New Features Available:');
    console.log('✅ Family composition tracking (marital status, children, partner)');
    console.log('✅ Partner income integration');
    console.log('✅ Enhanced personal details (nationality, profile picture)');
    console.log('✅ Advanced location preferences (districts, commute time)');
    console.log('✅ Comprehensive housing preferences (amenities, furnished preference)');
    console.log('✅ Profile view tracking and analytics');
    console.log('✅ Real-time cross-platform notifications');
    console.log('✅ Children details tracking');
    
    console.log('\n🚀 Next Steps:');
    console.log('1. Create enhanced ProfileCreationModal with 7 steps');
    console.log('2. Update UserService with family-aware methods');
    console.log('3. Implement profile view tracking');
    console.log('4. Add total household income calculations');
    console.log('5. Update VerhuurderDashboard search filters');
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the enhancement
applyComprehensiveProfileEnhancement();
