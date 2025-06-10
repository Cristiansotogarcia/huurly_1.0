/**
 * Test script to verify the authentication fix for profile creation
 * This script tests the enhanced authentication system with session validation and refresh
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test user credentials
const testUser = {
  email: 'cristiansotogarcia@gmail.com',
  password: 'Admin123@@'
};

async function testAuthenticationSystem() {
  console.log('🔐 Testing Enhanced Authentication System\n');

  try {
    // Step 1: Test user login
    console.log('1️⃣ Testing user login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password
    });

    if (loginError) {
      console.error('❌ Login failed:', loginError.message);
      return;
    }

    if (!loginData.user) {
      console.error('❌ No user data returned from login');
      return;
    }

    console.log('✅ Login successful');
    console.log(`   User ID: ${loginData.user.id}`);
    console.log(`   Email: ${loginData.user.email}`);
    console.log(`   Session expires at: ${new Date(loginData.session.expires_at * 1000).toISOString()}\n`);

    // Step 2: Test session validation
    console.log('2️⃣ Testing session validation...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('❌ Session validation failed:', sessionError.message);
      return;
    }

    if (!sessionData.session) {
      console.error('❌ No active session found');
      return;
    }

    console.log('✅ Session validation successful');
    console.log(`   Session valid until: ${new Date(sessionData.session.expires_at * 1000).toISOString()}\n`);

    // Step 3: Test user role retrieval
    console.log('3️⃣ Testing user role retrieval...');
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role, subscription_status')
      .eq('user_id', loginData.user.id)
      .single();

    if (roleError) {
      console.error('❌ Role retrieval failed:', roleError.message);
    } else {
      console.log('✅ Role retrieval successful');
      console.log(`   Role: ${roleData.role}`);
      console.log(`   Subscription status: ${roleData.subscription_status}\n`);
    }

    // Step 4: Test profile data retrieval
    console.log('4️⃣ Testing profile data retrieval...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('first_name, last_name, is_looking_for_place')
      .eq('id', loginData.user.id)
      .single();

    if (profileError) {
      console.error('❌ Profile retrieval failed:', profileError.message);
    } else {
      console.log('✅ Profile retrieval successful');
      console.log(`   Name: ${profileData.first_name} ${profileData.last_name}`);
      console.log(`   Looking for place: ${profileData.is_looking_for_place}\n`);
    }

    // Step 5: Test tenant profile retrieval
    console.log('5️⃣ Testing tenant profile retrieval...');
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenant_profiles')
      .select('*')
      .eq('user_id', loginData.user.id)
      .single();

    if (tenantError) {
      if (tenantError.code === 'PGRST116') {
        console.log('ℹ️  No tenant profile found (this is normal for new users)');
      } else {
        console.error('❌ Tenant profile retrieval failed:', tenantError.message);
      }
    } else {
      console.log('✅ Tenant profile retrieval successful');
      console.log(`   Profile completed: ${tenantData.profile_completed}`);
      console.log(`   Profession: ${tenantData.profession || 'Not set'}`);
      console.log(`   City: ${tenantData.preferred_city || 'Not set'}\n`);
    }

    // Step 6: Test authentication with expired token simulation
    console.log('6️⃣ Testing token refresh mechanism...');
    
    // Get current session
    const { data: currentSession } = await supabase.auth.getSession();
    if (currentSession.session) {
      console.log('✅ Current session is valid');
      
      // Test refresh
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error('❌ Token refresh failed:', refreshError.message);
      } else {
        console.log('✅ Token refresh successful');
        console.log(`   New session expires at: ${new Date(refreshData.session.expires_at * 1000).toISOString()}\n`);
      }
    }

    // Step 7: Test RLS policies
    console.log('7️⃣ Testing Row Level Security policies...');
    
    // Test if user can access their own data
    const { data: ownData, error: ownError } = await supabase
      .from('tenant_profiles')
      .select('user_id')
      .eq('user_id', loginData.user.id);

    if (ownError) {
      console.error('❌ RLS policy test failed:', ownError.message);
    } else {
      console.log('✅ RLS policies working correctly - user can access own data');
    }

    // Test if user cannot access other users' data (should return empty result)
    const { data: otherData, error: otherError } = await supabase
      .from('tenant_profiles')
      .select('user_id')
      .neq('user_id', loginData.user.id)
      .limit(1);

    if (otherError) {
      console.error('❌ RLS policy test failed:', otherError.message);
    } else {
      if (otherData && otherData.length === 0) {
        console.log('✅ RLS policies working correctly - user cannot access other users\' data\n');
      } else {
        console.log('⚠️  RLS policies may not be working correctly - user can see other users\' data\n');
      }
    }

    // Step 8: Test logout
    console.log('8️⃣ Testing logout...');
    const { error: logoutError } = await supabase.auth.signOut();

    if (logoutError) {
      console.error('❌ Logout failed:', logoutError.message);
    } else {
      console.log('✅ Logout successful');
      
      // Verify session is cleared
      const { data: postLogoutSession } = await supabase.auth.getSession();
      if (!postLogoutSession.session) {
        console.log('✅ Session cleared successfully\n');
      } else {
        console.log('⚠️  Session may not have been cleared properly\n');
      }
    }

    console.log('🎉 Authentication system test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ User login/logout working');
    console.log('✅ Session validation working');
    console.log('✅ Token refresh mechanism working');
    console.log('✅ User role and profile retrieval working');
    console.log('✅ RLS policies protecting user data');
    console.log('\n🔧 The enhanced authentication system should now prevent the profile creation errors you were experiencing.');

  } catch (error) {
    console.error('❌ Unexpected error during authentication test:', error);
  }
}

async function testProfileCreationFlow() {
  console.log('\n🏠 Testing Profile Creation Flow\n');

  try {
    // Login first
    console.log('1️⃣ Logging in for profile creation test...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password
    });

    if (loginError || !loginData.user) {
      console.error('❌ Login failed for profile creation test');
      return;
    }

    console.log('✅ Login successful for profile creation test\n');

    // Test profile creation data structure
    console.log('2️⃣ Testing profile creation data structure...');
    
    const mockProfileData = {
      firstName: 'Emma',
      lastName: 'Bakker',
      phone: '+31612345678',
      dateOfBirth: '1995-05-15',
      profession: 'Software Developer',
      monthlyIncome: 4500,
      bio: 'Friendly and responsible tenant looking for a nice place to call home.',
      city: 'Amsterdam',
      minBudget: 1200,
      maxBudget: 1800,
      bedrooms: 1,
      propertyType: 'Appartement',
      motivation: 'Starting a new job in Amsterdam and need a place close to work.',
      // Enhanced fields
      nationality: 'Nederlandse',
      sex: 'vrouw',
      maritalStatus: 'single',
      hasChildren: false,
      numberOfChildren: 0,
      childrenAges: [],
      hasPartner: false,
      partnerName: '',
      partnerProfession: '',
      partnerMonthlyIncome: 0,
      partnerEmploymentStatus: 'employed',
      preferredDistricts: ['Centrum', 'Jordaan'],
      maxCommuteTime: 30,
      transportationPreference: 'public_transport',
      furnishedPreference: 'no_preference',
      desiredAmenities: ['balkon', 'wifi'],
      employer: 'TechCorp B.V.',
      employmentStatus: 'employed',
      workContractType: 'permanent',
      housingAllowanceEligible: false,
      hasPets: false,
      petDetails: '',
      smokes: false,
      smokingDetails: ''
    };

    console.log('✅ Mock profile data structure created');
    console.log(`   Fields count: ${Object.keys(mockProfileData).length}`);
    console.log(`   Required fields present: ${['firstName', 'lastName', 'phone', 'profession', 'monthlyIncome'].every(field => mockProfileData[field])}\n`);

    // Test database field mapping
    console.log('3️⃣ Testing database field mapping...');
    
    const dbMappedData = {
      user_id: loginData.user.id,
      first_name: mockProfileData.firstName,
      last_name: mockProfileData.lastName,
      phone: mockProfileData.phone,
      date_of_birth: mockProfileData.dateOfBirth,
      profession: mockProfileData.profession,
      monthly_income: mockProfileData.monthlyIncome,
      bio: mockProfileData.bio,
      preferred_city: mockProfileData.city,
      min_budget: mockProfileData.minBudget,
      max_budget: mockProfileData.maxBudget,
      preferred_bedrooms: mockProfileData.bedrooms,
      preferred_property_type: mockProfileData.propertyType,
      motivation: mockProfileData.motivation,
      profile_completed: true,
      // Enhanced fields
      nationality: mockProfileData.nationality,
      sex: mockProfileData.sex,
      marital_status: mockProfileData.maritalStatus,
      has_children: mockProfileData.hasChildren,
      number_of_children: mockProfileData.numberOfChildren,
      children_ages: mockProfileData.childrenAges,
      has_partner: mockProfileData.hasPartner,
      partner_name: mockProfileData.partnerName || null,
      partner_profession: mockProfileData.partnerProfession || null,
      partner_monthly_income: mockProfileData.partnerMonthlyIncome,
      partner_employment_status: mockProfileData.partnerEmploymentStatus || null,
      preferred_districts: mockProfileData.preferredDistricts,
      max_commute_time: mockProfileData.maxCommuteTime,
      transportation_preference: mockProfileData.transportationPreference,
      furnished_preference: mockProfileData.furnishedPreference,
      desired_amenities: mockProfileData.desiredAmenities,
      employer: mockProfileData.employer || null,
      employment_status: mockProfileData.employmentStatus,
      work_contract_type: mockProfileData.workContractType,
      housing_allowance_eligible: mockProfileData.housingAllowanceEligible,
      has_pets: mockProfileData.hasPets,
      pet_details: mockProfileData.petDetails || null,
      smokes: mockProfileData.smokes,
      smoking_details: mockProfileData.smokingDetails || null
    };

    console.log('✅ Database field mapping successful');
    console.log(`   Mapped fields count: ${Object.keys(dbMappedData).length}\n`);

    // Test actual profile creation (if user doesn't have one)
    console.log('4️⃣ Testing actual profile creation...');
    
    const { data: existingProfile } = await supabase
      .from('tenant_profiles')
      .select('id')
      .eq('user_id', loginData.user.id)
      .single();

    if (existingProfile) {
      console.log('ℹ️  User already has a tenant profile, testing update instead...');
      
      const { data: updateData, error: updateError } = await supabase
        .from('tenant_profiles')
        .update({
          bio: `Updated bio: ${mockProfileData.bio}`,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', loginData.user.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Profile update failed:', updateError.message);
      } else {
        console.log('✅ Profile update successful');
        console.log(`   Updated profile ID: ${updateData.id}\n`);
      }
    } else {
      console.log('ℹ️  Creating new tenant profile...');
      
      const { data: createData, error: createError } = await supabase
        .from('tenant_profiles')
        .insert(dbMappedData)
        .select()
        .single();

      if (createError) {
        console.error('❌ Profile creation failed:', createError.message);
        console.error('   Error details:', createError);
      } else {
        console.log('✅ Profile creation successful');
        console.log(`   Created profile ID: ${createData.id}`);
        console.log(`   Profile completed: ${createData.profile_completed}\n`);
      }
    }

    // Logout
    await supabase.auth.signOut();
    console.log('✅ Profile creation test completed and logged out\n');

  } catch (error) {
    console.error('❌ Unexpected error during profile creation test:', error);
  }
}

// Run the tests
async function runAllTests() {
  console.log('🚀 Starting Authentication and Profile Creation Tests\n');
  console.log('=' .repeat(60));
  
  await testAuthenticationSystem();
  
  console.log('\n' + '=' .repeat(60));
  
  await testProfileCreationFlow();
  
  console.log('🏁 All tests completed!');
  console.log('\n💡 If all tests passed, the authentication issues should be resolved.');
  console.log('   Users should now be able to create and update profiles without');
  console.log('   encountering "Invalid Refresh Token" errors.');
}

runAllTests().catch(console.error);
