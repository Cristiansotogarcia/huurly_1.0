const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 DIRECT TENANT_PROFILES TABLE ANALYSIS');
console.log('=' .repeat(60));

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getTableStructure() {
  try {
    console.log('📋 Fetching actual table data to analyze structure...\n');
    
    // Get a sample record to see all columns
    const { data, error } = await supabase
      .from('tenant_profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error fetching data:', error.message);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ No data found in tenant_profiles table');
      return;
    }
    
    const actualColumns = Object.keys(data[0]);
    console.log(`📊 ACTUAL TABLE COLUMNS (${actualColumns.length} total):`);
    console.log('-' .repeat(50));
    
    actualColumns.forEach((col, index) => {
      const value = data[0][col];
      let type = 'unknown';
      
      if (value === null) {
        type = 'NULL';
      } else if (typeof value === 'string') {
        type = 'text';
      } else if (typeof value === 'number') {
        type = Number.isInteger(value) ? 'integer' : 'decimal';
      } else if (typeof value === 'boolean') {
        type = 'boolean';
      } else if (Array.isArray(value)) {
        type = 'array';
      } else if (typeof value === 'object') {
        type = 'jsonb';
      }
      
      console.log(`${(index + 1).toString().padStart(2)}. ${col.padEnd(35)} ${type.padEnd(10)} ${value === null ? '(null)' : ''}`);
    });
    
    // Now analyze what's used vs unused
    analyzeColumnUsage(actualColumns);
    
  } catch (error) {
    console.error('❌ Failed to analyze table:', error.message);
  }
}

function analyzeColumnUsage(actualColumns) {
  console.log('\n🔍 USAGE ANALYSIS: Modal vs Database');
  console.log('=' .repeat(50));
  
  // Fields currently used in the 7-step modal
  const modalFields = [
    // Step 1: Personal Information
    'first_name', 'last_name', 'phone', 'date_of_birth', 'nationality', 'sex', 'profielfoto_url',
    
    // Step 2: Family & Relationship
    'marital_status', 'has_children', 'number_of_children', 'children_ages',
    
    // Step 3: Work & Employment
    'profession', 'employer', 'employment_status', 'work_contract_type', 'monthly_income', 'housing_allowance_eligible',
    
    // Step 4: Partner Information
    'has_partner', 'partner_name', 'partner_profession', 'partner_monthly_income', 'partner_employment_status',
    
    // Step 5: Location Preferences
    'preferred_city', 'preferred_districts', 'max_commute_time', 'transportation_preference',
    
    // Step 6: Housing & Lifestyle
    'min_budget', 'max_budget', 'preferred_bedrooms', 'preferred_property_type', 'furnished_preference', 
    'desired_amenities', 'has_pets', 'pet_details', 'smokes', 'smoking_details',
    
    // Step 7: About You
    'bio', 'motivation',
    
    // System fields
    'user_id', 'profile_completed', 'created_at', 'updated_at', 'total_household_income', 'family_composition'
  ];
  
  const usedInModal = actualColumns.filter(col => modalFields.includes(col));
  const unusedInModal = actualColumns.filter(col => !modalFields.includes(col));
  const missingFromDB = modalFields.filter(field => !actualColumns.includes(field));
  
  console.log(`\n✅ USED IN MODAL (${usedInModal.length}):`);
  usedInModal.forEach(col => console.log(`   • ${col}`));
  
  console.log(`\n❌ NOT USED IN MODAL (${unusedInModal.length}):`);
  unusedInModal.forEach(col => console.log(`   • ${col}`));
  
  if (missingFromDB.length > 0) {
    console.log(`\n⚠️  MODAL EXPECTS BUT MISSING FROM DB (${missingFromDB.length}):`);
    missingFromDB.forEach(field => console.log(`   • ${field}`));
  }
  
  // Analyze business value of unused columns
  console.log('\n💡 BUSINESS VALUE ANALYSIS:');
  console.log('-' .repeat(40));
  
  const businessAnalysis = analyzeBusinessValue(unusedInModal);
  
  if (businessAnalysis.highValue.length > 0) {
    console.log('\n🏆 HIGH BUSINESS VALUE - ADD TO MODAL:');
    businessAnalysis.highValue.forEach(item => {
      console.log(`   • ${item.column.padEnd(30)} - ${item.reason}`);
    });
  }
  
  if (businessAnalysis.mediumValue.length > 0) {
    console.log('\n📈 MEDIUM BUSINESS VALUE - CONSIDER:');
    businessAnalysis.mediumValue.forEach(item => {
      console.log(`   • ${item.column.padEnd(30)} - ${item.reason}`);
    });
  }
  
  if (businessAnalysis.lowValue.length > 0) {
    console.log('\n🗑️  LOW VALUE - CONSIDER REMOVING:');
    businessAnalysis.lowValue.forEach(item => {
      console.log(`   • ${item.column.padEnd(30)} - ${item.reason}`);
    });
  }
  
  // Check for duplicates
  console.log('\n🔍 POTENTIAL DUPLICATES:');
  console.log('-' .repeat(30));
  findDuplicates(actualColumns);
  
  // Summary and recommendations
  console.log('\n📋 SUMMARY & RECOMMENDATIONS:');
  console.log('=' .repeat(40));
  console.log(`• Total columns: ${actualColumns.length}`);
  console.log(`• Used in modal: ${usedInModal.length} (${Math.round(usedInModal.length/actualColumns.length*100)}%)`);
  console.log(`• High-value unused: ${businessAnalysis.highValue.length}`);
  console.log(`• Should remove: ${businessAnalysis.lowValue.length}`);
  
  if (businessAnalysis.highValue.length > 0) {
    console.log('\n🎯 TOP RECOMMENDATION:');
    console.log(`   Add "${businessAnalysis.highValue[0].column}" to modal first`);
    console.log(`   Reason: ${businessAnalysis.highValue[0].reason}`);
  }
}

function analyzeBusinessValue(unusedColumns) {
  const highValue = [];
  const mediumValue = [];
  const lowValue = [];
  
  unusedColumns.forEach(col => {
    const analysis = getBusinessValue(col);
    
    if (analysis.value === 'high') {
      highValue.push({ column: col, reason: analysis.reason });
    } else if (analysis.value === 'medium') {
      mediumValue.push({ column: col, reason: analysis.reason });
    } else {
      lowValue.push({ column: col, reason: analysis.reason });
    }
  });
  
  return { highValue, mediumValue, lowValue };
}

function getBusinessValue(columnName) {
  const col = columnName.toLowerCase();
  
  // High business value patterns
  if (col.includes('guarantor')) {
    return { value: 'high', reason: 'Critical for landlord confidence and risk assessment' };
  }
  if (col.includes('emergency') && col.includes('contact')) {
    return { value: 'high', reason: 'Important for safety and responsibility' };
  }
  if (col.includes('move_in') || col.includes('movein')) {
    return { value: 'high', reason: 'Essential for matching timing requirements' };
  }
  if (col.includes('reference')) {
    return { value: 'high', reason: 'Key trust signal for landlords' };
  }
  if (col.includes('income_proof') || col.includes('proof')) {
    return { value: 'high', reason: 'Verification capability increases credibility' };
  }
  if (col.includes('work_from_home') || col.includes('remote')) {
    return { value: 'high', reason: 'Relevant for space and internet requirements' };
  }
  if (col.includes('parking')) {
    return { value: 'high', reason: 'Important filter for urban areas' };
  }
  
  // Medium business value patterns
  if (col.includes('previous') || col.includes('rental_history')) {
    return { value: 'medium', reason: 'Useful for reference checking' };
  }
  if (col.includes('current_living') || col.includes('living_situation')) {
    return { value: 'medium', reason: 'Context for housing search' };
  }
  if (col.includes('reason') && col.includes('moving')) {
    return { value: 'medium', reason: 'Helps understand motivation' };
  }
  if (col.includes('lease_duration') || col.includes('lease_length')) {
    return { value: 'medium', reason: 'Helps match tenant/landlord preferences' };
  }
  if (col.includes('storage') || col.includes('berging')) {
    return { value: 'medium', reason: 'Specific housing requirement' };
  }
  if (col.includes('viewing') || col.includes('availability')) {
    return { value: 'medium', reason: 'Practical scheduling information' };
  }
  
  // Low business value patterns
  if (col.includes('id') && col !== 'user_id') {
    return { value: 'low', reason: 'System field' };
  }
  if (col.includes('created_at') || col.includes('updated_at')) {
    return { value: 'low', reason: 'System timestamp' };
  }
  if (col.includes('is_active') || col.includes('is_verified')) {
    return { value: 'low', reason: 'Should be in separate verification table' };
  }
  if (col.includes('subscription') || col.includes('payment')) {
    return { value: 'low', reason: 'Belongs in user_roles/payment_records table' };
  }
  if (col.includes('last_login') || col.includes('login')) {
    return { value: 'low', reason: 'Belongs in user activity tracking' };
  }
  
  // Default to medium for manual review
  return { value: 'medium', reason: 'Needs manual review for business value' };
}

function findDuplicates(columns) {
  const groups = {
    'Income': columns.filter(col => col.includes('income')),
    'Budget': columns.filter(col => col.includes('budget')),
    'Name': columns.filter(col => col.includes('name') && !col.includes('username')),
    'Phone': columns.filter(col => col.includes('phone') || col.includes('mobile')),
    'Email': columns.filter(col => col.includes('email')),
    'City': columns.filter(col => col.includes('city')),
    'Preferred': columns.filter(col => col.includes('preferred')),
    'Partner': columns.filter(col => col.includes('partner')),
    'Children': columns.filter(col => col.includes('child')),
    'Employment': columns.filter(col => col.includes('employ')),
    'Status': columns.filter(col => col.includes('status')),
    'Date': columns.filter(col => col.includes('date')),
    'Contact': columns.filter(col => col.includes('contact'))
  };
  
  Object.entries(groups).forEach(([category, cols]) => {
    if (cols.length > 1) {
      console.log(`   ${category.padEnd(12)}: ${cols.join(', ')}`);
    }
  });
}

// Run the analysis
getTableStructure();
