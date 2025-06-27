const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('🔍 Checking tenant_profiles table structure...\n');
  
  try {
    // Get a sample record to see all available columns
    const { data, error } = await supabase
      .from('tenant_profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error:', error.message);
      return;
    }
    
    if (data && data.length > 0) {
      const columns = Object.keys(data[0]);
      console.log('📋 All columns in tenant_profiles table:');
      console.log('=' .repeat(50));
      
      columns.forEach((col, index) => {
        console.log(`${(index + 1).toString().padStart(2)}. ${col}`);
      });
      
      console.log(`\n📊 Total: ${columns.length} columns`);
      
      // Now analyze usage
      analyzeColumns(columns);
      
    } else {
      console.log('No data found in tenant_profiles table');
    }
    
  } catch (error) {
    console.error('Failed to check schema:', error.message);
  }
}

function analyzeColumns(allColumns) {
  console.log('\n🔍 ANALYSIS: Column Usage in 7-Step Modal');
  console.log('=' .repeat(60));
  
  // Columns currently used in the modal
  const usedColumns = [
    'user_id', 'first_name', 'last_name', 'phone', 'date_of_birth', 
    'nationality', 'sex', 'profielfoto_url',
    'marital_status', 'has_children', 'number_of_children', 'children_ages',
    'profession', 'employer', 'employment_status', 'work_contract_type', 
    'monthly_income', 'housing_allowance_eligible',
    'has_partner', 'partner_name', 'partner_profession', 
    'partner_monthly_income', 'partner_employment_status',
    'preferred_city', 'preferred_districts', 'max_commute_time', 
    'transportation_preference',
    'min_budget', 'max_budget', 'preferred_bedrooms', 'preferred_property_type',
    'furnished_preference', 'desired_amenities', 'has_pets', 'pet_details',
    'smokes', 'smoking_details', 'bio', 'motivation',
    'profile_completed', 'created_at', 'updated_at',
    'total_household_income', 'family_composition'
  ];
  
  const systemColumns = ['id', 'user_id', 'created_at', 'updated_at'];
  
  const used = [];
  const unused = [];
  const system = [];
  
  allColumns.forEach(col => {
    if (systemColumns.includes(col)) {
      system.push(col);
    } else if (usedColumns.includes(col)) {
      used.push(col);
    } else {
      unused.push(col);
    }
  });
  
  console.log(`\n✅ USED IN MODAL (${used.length}):`);
  used.forEach(col => console.log(`   • ${col}`));
  
  console.log(`\n🔧 SYSTEM FIELDS (${system.length}):`);
  system.forEach(col => console.log(`   • ${col}`));
  
  console.log(`\n❌ NOT USED IN MODAL (${unused.length}):`);
  unused.forEach(col => console.log(`   • ${col}`));
  
  // Analyze unused columns for potential value
  console.log('\n💡 RECOMMENDATIONS:');
  console.log('=' .repeat(40));
  
  const recommendations = analyzeUnusedColumns(unused);
  
  console.log('\n🗑️  COLUMNS TO CONSIDER REMOVING:');
  recommendations.toRemove.forEach(col => console.log(`   • ${col}`));
  
  console.log('\n➕ COLUMNS TO CONSIDER ADDING TO MODAL:');
  recommendations.toAdd.forEach(item => console.log(`   • ${item.column} - ${item.suggestion}`));
  
  console.log('\n🔍 POTENTIAL DUPLICATES:');
  findDuplicates(allColumns);
}

function analyzeUnusedColumns(unusedColumns) {
  const toAdd = [];
  const toRemove = [];
  
  unusedColumns.forEach(col => {
    const suggestion = getColumnRecommendation(col);
    if (suggestion) {
      toAdd.push({ column: col, suggestion });
    } else {
      toRemove.push(col);
    }
  });
  
  return { toAdd, toRemove };
}

function getColumnRecommendation(columnName) {
  const recommendations = {
    // Financial & Guarantor
    'guarantor_available': 'Step 3 (Work) - Whether user has a guarantor',
    'guarantor_name': 'Step 3 (Work) - Guarantor full name',
    'guarantor_phone': 'Step 3 (Work) - Guarantor contact',
    'guarantor_income': 'Step 3 (Work) - Guarantor monthly income',
    'guarantor_relationship': 'Step 3 (Work) - Relationship to guarantor',
    'income_proof_available': 'Step 3 (Work) - Can provide income proof',
    'credit_score': 'Step 3 (Work) - Credit score if known',
    
    // Emergency & References
    'emergency_contact_name': 'Step 1 (Personal) - Emergency contact',
    'emergency_contact_phone': 'Step 1 (Personal) - Emergency contact phone',
    'emergency_contact_relationship': 'Step 1 (Personal) - Relationship',
    'references_available': 'Step 7 (About) - Has rental references',
    'previous_landlord_contact': 'Step 7 (About) - Previous landlord info',
    
    // Timing & Availability
    'move_in_date_preferred': 'Step 5 (Location) - Preferred move-in date',
    'move_in_date_earliest': 'Step 5 (Location) - Earliest possible move-in',
    'lease_duration_preference': 'Step 6 (Housing) - Preferred lease length',
    'availability_flexible': 'Step 5 (Location) - Flexible with timing',
    
    // Housing Details
    'current_living_situation': 'Step 7 (About) - Current housing situation',
    'reason_for_moving': 'Step 7 (About) - Why looking for new place',
    'rental_history_years': 'Step 7 (About) - Years of rental experience',
    'budget_flexibility': 'Step 6 (Housing) - How flexible is budget',
    'viewing_availability': 'Step 5 (Location) - When available for viewings',
    
    // Lifestyle & Preferences
    'lifestyle_preferences': 'Step 6 (Housing) - Lifestyle preferences',
    'noise_tolerance': 'Step 6 (Housing) - Tolerance for noise',
    'social_preferences': 'Step 6 (Housing) - Social vs quiet living',
    'work_from_home': 'Step 3 (Work) - Works from home',
    'parking_required': 'Step 6 (Housing) - Needs parking',
    'storage_needs': 'Step 6 (Housing) - Storage requirements',
    
    // Verification & Status
    'profile_verified': 'System - Profile verification status',
    'documents_verified': 'System - Document verification status',
    'background_check_consent': 'Step 7 (About) - Consent for background check',
    'is_student': 'Step 3 (Work) - Student status',
    'student_university': 'Step 3 (Work) - University name if student',
    
    // Communication
    'preferred_contact_method': 'Step 1 (Personal) - Email, phone, WhatsApp',
    'language_preference': 'Step 1 (Personal) - Preferred language',
    'communication_times': 'Step 1 (Personal) - Best times to contact'
  };
  
  return recommendations[columnName] || null;
}

function findDuplicates(columns) {
  const groups = {
    'Income': columns.filter(col => col.includes('income')),
    'Budget': columns.filter(col => col.includes('budget')),
    'Preferred': columns.filter(col => col.includes('preferred')),
    'Partner': columns.filter(col => col.includes('partner')),
    'Children': columns.filter(col => col.includes('child')),
    'Contact': columns.filter(col => col.includes('contact')),
    'Phone': columns.filter(col => col.includes('phone')),
    'Name': columns.filter(col => col.includes('name')),
    'Status': columns.filter(col => col.includes('status')),
    'Date': columns.filter(col => col.includes('date')),
    'Employment': columns.filter(col => col.includes('employ')),
    'Guarantor': columns.filter(col => col.includes('guarantor'))
  };
  
  Object.entries(groups).forEach(([category, cols]) => {
    if (cols.length > 1) {
      console.log(`   ${category}: ${cols.join(', ')}`);
    }
  });
}

checkSchema();
