import { createClient } from '@supabase/supabase-js';

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTenantProfileCreation() {
  console.log('🔍 Testing tenant profile creation process...\n');
  
  try {
    // 1. Check tenant_profiles table structure
    console.log('📋 Checking tenant_profiles table structure...');
    
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_columns', { table_name: 'tenant_profiles' })
      .catch(() => null);
    
    if (!tableInfo) {
      // Alternative approach - try to describe the table
      console.log('⚠️ Cannot get table structure via RPC, trying direct query...');
      
      const { data: sampleData, error: sampleError } = await supabase
        .from('tenant_profiles')
        .select('*')
        .limit(1);
      
      if (sampleError) {
        console.error('❌ Error accessing tenant_profiles table:', sampleError.message);
        return;
      }
      
      console.log('✅ tenant_profiles table is accessible');
      if (sampleData && sampleData.length > 0) {
        console.log('📊 Sample record structure:');
        console.log(Object.keys(sampleData[0]).join(', '));
      }
    }
    
    // 2. Test with existing user cristiansotogarcia@gmail.com
    console.log('\n🔍 Testing with existing user cristiansotogarcia@gmail.com...');
    
    const targetEmail = 'cristiansotogarcia@gmail.com';
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error accessing auth users:', authError.message);
      return;
    }
    
    const targetUser = authUsers.users.find(user => user.email === targetEmail);
    if (!targetUser) {
      console.error('❌ Target user not found');
      return;
    }
    
    console.log(`✅ Found user: ${targetUser.email} (ID: ${targetUser.id})`);
    
    // 3. Check current tenant profile
    console.log('\n📋 Checking current tenant profile...');
    
    const { data: currentProfile, error: profileError } = await supabase
      .from('tenant_profiles')
      .select('*')
      .eq('user_id', targetUser.id)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('❌ Error checking tenant profile:', profileError.message);
      return;
    }
    
    if (currentProfile) {
      console.log('✅ Current tenant profile exists:');
      console.log(`  - Name: ${currentProfile.first_name} ${currentProfile.last_name}`);
      console.log(`  - Phone: ${currentProfile.phone}`);
      console.log(`  - Profession: ${currentProfile.profession}`);
      console.log(`  - Monthly Income: €${currentProfile.monthly_income}`);
      console.log(`  - City: ${currentProfile.preferred_city}`);
      console.log(`  - Profile Completed: ${currentProfile.profile_completed}`);
      console.log(`  - Created: ${currentProfile.created_at}`);
      console.log(`  - Updated: ${currentProfile.updated_at}`);
    } else {
      console.log('⚠️ No tenant profile found for this user');
    }
    
    // 4. Test creating/updating tenant profile with minimal data
    console.log('\n🧪 Testing tenant profile creation/update...');
    
    const testProfileData = {
      user_id: targetUser.id,
      first_name: 'Cristian',
      last_name: 'Soto Garcia',
      phone: '+31 6 12345678',
      date_of_birth: '1990-01-01',
      profession: 'Software Developer',
      monthly_income: 4500,
      bio: 'Test bio for profile creation',
      preferred_city: 'Amsterdam',
      min_budget: 1000,
      max_budget: 2000,
      preferred_bedrooms: 1,
      preferred_property_type: 'Appartement',
      motivation: 'Test motivation for profile creation',
      profile_completed: true,
      
      // Enhanced fields
      nationality: 'Nederlandse',
      sex: 'man',
      marital_status: 'single',
      has_children: false,
      number_of_children: 0,
      children_ages: [],
      has_partner: false,
      partner_name: null,
      partner_profession: null,
      partner_monthly_income: 0,
      partner_employment_status: null,
      preferred_districts: ['Centrum', 'Jordaan'],
      max_commute_time: 30,
      transportation_preference: 'public_transport',
      furnished_preference: 'no_preference',
      desired_amenities: ['balkon', 'wifi'],
      employer: 'TechCorp B.V.',
      employment_status: 'employed',
      work_contract_type: 'permanent',
      housing_allowance_eligible: false,
      has_pets: false,
      pet_details: null,
      smokes: false,
      smoking_details: null,
      profielfoto_url: null,
    };
    
    // Try upsert operation
    const { data: upsertResult, error: upsertError } = await supabase
      .from('tenant_profiles')
      .upsert(testProfileData)
      .select()
      .single();
    
    if (upsertError) {
      console.error('❌ Error during upsert operation:');
      console.error('  Code:', upsertError.code);
      console.error('  Message:', upsertError.message);
      console.error('  Details:', upsertError.details);
      console.error('  Hint:', upsertError.hint);
      
      // Try to identify which fields are causing issues
      console.log('\n🔍 Analyzing potential field issues...');
      
      // Test with minimal required fields only
      const minimalData = {
        user_id: targetUser.id,
        first_name: 'Cristian',
        last_name: 'Soto Garcia',
        phone: '+31 6 12345678',
        date_of_birth: '1990-01-01',
        profession: 'Software Developer',
        monthly_income: 4500,
        bio: 'Test bio',
        preferred_city: 'Amsterdam',
        min_budget: 1000,
        max_budget: 2000,
        preferred_bedrooms: 1,
        preferred_property_type: 'Appartement',
        motivation: 'Test motivation',
        profile_completed: true,
      };
      
      console.log('🧪 Testing with minimal required fields...');
      const { data: minimalResult, error: minimalError } = await supabase
        .from('tenant_profiles')
        .upsert(minimalData)
        .select()
        .single();
      
      if (minimalError) {
        console.error('❌ Even minimal data failed:', minimalError.message);
      } else {
        console.log('✅ Minimal data succeeded! Issue is with enhanced fields.');
        console.log('📊 Successful minimal profile:', minimalResult.id);
      }
      
    } else {
      console.log('✅ Tenant profile upsert successful!');
      console.log(`  - Profile ID: ${upsertResult.id}`);
      console.log(`  - User ID: ${upsertResult.user_id}`);
      console.log(`  - Name: ${upsertResult.first_name} ${upsertResult.last_name}`);
      console.log(`  - Profile Completed: ${upsertResult.profile_completed}`);
      console.log(`  - Enhanced fields included: ${upsertResult.nationality}, ${upsertResult.marital_status}`);
    }
    
    // 5. Check if profiles table was also updated
    console.log('\n📋 Checking profiles table update...');
    
    const { data: profileData, error: profileCheckError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetUser.id)
      .single();
    
    if (profileCheckError) {
      console.error('❌ Error checking profiles table:', profileCheckError.message);
    } else {
      console.log('✅ Profiles table data:');
      console.log(`  - Name: ${profileData.first_name} ${profileData.last_name}`);
      console.log(`  - Looking for place: ${profileData.is_looking_for_place}`);
      console.log(`  - Updated: ${profileData.updated_at}`);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testTenantProfileCreation().catch(console.error);
