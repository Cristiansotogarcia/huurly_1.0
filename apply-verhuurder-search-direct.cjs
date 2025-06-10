const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function applyVerhuurderSearchFix() {
  console.log('🔧 Applying Verhuurder Search Schema Fix...');
  
  try {
    // Step 1: Add missing columns to profiles table
    console.log('📋 Step 1: Adding is_looking_for_place to profiles...');
    
    // We'll use a workaround since exec_sql doesn't exist
    // Let's try to query the table first to see current structure
    const { data: profilesTest, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Profiles table query failed:', profilesError);
    } else {
      console.log('✅ Profiles table accessible');
      if (profilesTest && profilesTest.length > 0) {
        console.log('📋 Current profiles structure:', Object.keys(profilesTest[0]));
      }
    }
    
    // Step 2: Test tenant_profiles table
    console.log('\n📋 Step 2: Testing tenant_profiles table...');
    
    const { data: tenantTest, error: tenantError } = await supabase
      .from('tenant_profiles')
      .select('*')
      .limit(1);
    
    if (tenantError) {
      console.error('❌ Tenant profiles table query failed:', tenantError);
    } else {
      console.log('✅ Tenant profiles table accessible');
      if (tenantTest && tenantTest.length > 0) {
        console.log('📋 Current tenant_profiles structure:', Object.keys(tenantTest[0]));
      }
    }
    
    // Step 3: Try the problematic query to see exact error
    console.log('\n📋 Step 3: Testing the problematic query...');
    
    const { data: joinTest, error: joinError } = await supabase
      .from('tenant_profiles')
      .select(`
        user_id,
        first_name,
        last_name,
        profession,
        monthly_income,
        preferred_location,
        max_rent
      `)
      .limit(3);
    
    if (joinError) {
      console.error('❌ Basic tenant query failed:', joinError);
    } else {
      console.log('✅ Basic tenant query successful');
      console.log('📋 Sample tenant data:', joinTest);
    }
    
    // Step 4: Try to get profiles separately
    console.log('\n📋 Step 4: Testing profiles query...');
    
    const { data: profilesData, error: profilesDataError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .limit(3);
    
    if (profilesDataError) {
      console.error('❌ Profiles query failed:', profilesDataError);
    } else {
      console.log('✅ Profiles query successful');
      console.log('📋 Sample profiles data:', profilesData);
    }
    
    // Step 5: Try manual join approach
    console.log('\n📋 Step 5: Testing manual join approach...');
    
    if (tenantTest && tenantTest.length > 0 && profilesData && profilesData.length > 0) {
      // Get tenant profiles
      const { data: allTenants, error: allTenantsError } = await supabase
        .from('tenant_profiles')
        .select('*');
      
      if (allTenantsError) {
        console.error('❌ All tenants query failed:', allTenantsError);
      } else {
        console.log(`✅ Found ${allTenants?.length || 0} tenant profiles`);
        
        // Get all profiles
        const { data: allProfiles, error: allProfilesError } = await supabase
          .from('profiles')
          .select('*');
        
        if (allProfilesError) {
          console.error('❌ All profiles query failed:', allProfilesError);
        } else {
          console.log(`✅ Found ${allProfiles?.length || 0} profiles`);
          
          // Manual join
          const joinedData = allTenants?.map(tenant => {
            const profile = allProfiles?.find(p => p.id === tenant.user_id);
            return {
              ...tenant,
              profile: profile
            };
          }).filter(item => item.profile);
          
          console.log(`✅ Manual join successful! ${joinedData?.length || 0} matched records`);
          if (joinedData && joinedData.length > 0) {
            console.log('📋 Sample joined data:', JSON.stringify(joinedData[0], null, 2));
          }
        }
      }
    }
    
    console.log('\n🎯 Analysis Complete!');
    console.log('\n📋 Findings:');
    console.log('1. Need to check if foreign key relationship exists between tenant_profiles and profiles');
    console.log('2. May need to create the relationship or use manual joins');
    console.log('3. UserService query structure needs to be updated based on actual schema');
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the analysis
applyVerhuurderSearchFix();
