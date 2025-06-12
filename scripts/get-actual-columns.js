const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function getActualColumns() {
  console.log('🔍 GETTING ACTUAL TENANT_PROFILES COLUMNS FROM SUPABASE');
  console.log('=' .repeat(60));
  
  try {
    // Get actual data to see what columns exist
    const { data, error } = await supabase
      .from('tenant_profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ No data in tenant_profiles table');
      
      // Try to get table structure another way
      const { data: emptyData, error: emptyError } = await supabase
        .from('tenant_profiles')
        .select('*')
        .eq('user_id', 'non-existent-id')
        .limit(1);
      
      if (emptyError) {
        console.log('Table structure check failed:', emptyError.message);
        return;
      }
      
      console.log('✅ Table exists but is empty');
      return;
    }
    
    const actualColumns = Object.keys(data[0]);
    console.log(`\n📊 FOUND ${actualColumns.length} COLUMNS IN TENANT_PROFILES:`);
    console.log('-' .repeat(60));
    
    // Sort columns alphabetically for easier reading
    const sortedColumns = actualColumns.sort();
    
    sortedColumns.forEach((col, index) => {
      const value = data[0][col];
      let type = 'unknown';
      let sample = '';
      
      if (value === null) {
        type = 'NULL';
        sample = '(null)';
      } else if (typeof value === 'string') {
        type = 'text';
        sample = value.length > 20 ? `"${value.substring(0, 20)}..."` : `"${value}"`;
      } else if (typeof value === 'number') {
        type = Number.isInteger(value) ? 'integer' : 'decimal';
        sample = value.toString();
      } else if (typeof value === 'boolean') {
        type = 'boolean';
        sample = value.toString();
      } else if (Array.isArray(value)) {
        type = 'array';
        sample = `[${value.length} items]`;
      } else if (typeof value === 'object') {
        type = 'jsonb';
        sample = '{object}';
      }
      
      console.log(`${(index + 1).toString().padStart(2)}. ${col.padEnd(35)} ${type.padEnd(10)} ${sample}`);
    });
    
    // Now do the analysis
    analyzeColumns(sortedColumns);
    
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
}

function analyzeColumns(actualColumns) {
  console.log('\n🔍 DETAILED ANALYSIS');
  console.log('=' .repeat(50));
  
  // What the modal currently uses
  const modalFields = [
    'first_name', 'last_name', 'phone', 'date_of_birth', 'nationality', 'sex', 'profile_picture_url',
    'marital_status', 'has_children', 'number_of_children', 'children_ages',
    'profession', 'employer', 'employment_status', 'work_contract_type', 'monthly_income', 'housing_allowance_eligible',
    'has_partner', 'partner_name', 'partner_profession', 'partner_monthly_income', 'partner_employment_status',
    'preferred_city', 'preferred_districts', 'max_commute_time', 'transportation_preference',
    'min_budget', 'max_budget', 'preferred_bedrooms', 'preferred_property_type', 'furnished_preference', 
    'desired_amenities', 'has_pets', 'pet_details', 'smokes', 'smoking_details',
    'bio', 'motivation',
    'user_id', 'profile_completed', 'created_at', 'updated_at', 'total_household_income', 'family_composition'
  ];
  
  const usedColumns = actualColumns.filter(col => modalFields.includes(col));
  const unusedColumns = actualColumns.filter(col => !modalFields.includes(col));
  const missingColumns = modalFields.filter(field => !actualColumns.includes(field));
  
  console.log(`\n✅ COLUMNS USED IN MODAL (${usedColumns.length}):`);
  usedColumns.forEach(col => console.log(`   • ${col}`));
  
  console.log(`\n❌ COLUMNS NOT USED IN MODAL (${unusedColumns.length}):`);
  unusedColumns.forEach(col => console.log(`   • ${col}`));
  
  if (missingColumns.length > 0) {
    console.log(`\n⚠️  MODAL EXPECTS BUT MISSING (${missingColumns.length}):`);
    missingColumns.forEach(col => console.log(`   • ${col}`));
  }
  
  // Business value analysis
  console.log('\n💡 BUSINESS VALUE OF UNUSED COLUMNS:');
  console.log('-' .repeat(45));
  
  const highValue = [];
  const mediumValue = [];
  const lowValue = [];
  
  unusedColumns.forEach(col => {
    const value = analyzeBusinessValue(col);
    if (value.priority === 'high') {
      highValue.push(`${col} - ${value.reason}`);
    } else if (value.priority === 'medium') {
      mediumValue.push(`${col} - ${value.reason}`);
    } else {
      lowValue.push(`${col} - ${value.reason}`);
    }
  });
  
  if (highValue.length > 0) {
    console.log('\n🏆 HIGH VALUE - ADD TO MODAL:');
    highValue.forEach(item => console.log(`   • ${item}`));
  }
  
  if (mediumValue.length > 0) {
    console.log('\n📈 MEDIUM VALUE - CONSIDER:');
    mediumValue.forEach(item => console.log(`   • ${item}`));
  }
  
  if (lowValue.length > 0) {
    console.log('\n🗑️  LOW VALUE - CONSIDER REMOVING:');
    lowValue.forEach(item => console.log(`   • ${item}`));
  }
  
  // Find duplicates
  console.log('\n🔍 POTENTIAL DUPLICATES:');
  console.log('-' .repeat(30));
  findDuplicates(actualColumns);
  
  // Summary
  console.log('\n📋 SUMMARY:');
  console.log('=' .repeat(30));
  console.log(`Total columns: ${actualColumns.length}`);
  console.log(`Used in modal: ${usedColumns.length} (${Math.round(usedColumns.length/actualColumns.length*100)}%)`);
  console.log(`High-value unused: ${highValue.length}`);
  console.log(`Should consider removing: ${lowValue.length}`);
  
  if (highValue.length > 0) {
    console.log('\n🎯 TOP RECOMMENDATION:');
    console.log(`   ${highValue[0]}`);
  }
}

function analyzeBusinessValue(columnName) {
  const col = columnName.toLowerCase();
  
  // High business value
  if (col.includes('guarantor')) {
    return { priority: 'high', reason: 'Critical for landlord confidence' };
  }
  if (col.includes('emergency') || col.includes('contact')) {
    return { priority: 'high', reason: 'Safety and responsibility indicator' };
  }
  if (col.includes('move') || col.includes('available')) {
    return { priority: 'high', reason: 'Essential for timing matching' };
  }
  if (col.includes('reference')) {
    return { priority: 'high', reason: 'Key trust signal' };
  }
  if (col.includes('proof') || col.includes('document')) {
    return { priority: 'high', reason: 'Verification capability' };
  }
  if (col.includes('parking')) {
    return { priority: 'high', reason: 'Important urban filter' };
  }
  if (col.includes('work_from_home') || col.includes('remote')) {
    return { priority: 'high', reason: 'Modern work requirement' };
  }
  
  // Medium business value
  if (col.includes('previous') || col.includes('history')) {
    return { priority: 'medium', reason: 'Experience indicator' };
  }
  if (col.includes('current') || col.includes('living')) {
    return { priority: 'medium', reason: 'Context information' };
  }
  if (col.includes('lease') || col.includes('duration')) {
    return { priority: 'medium', reason: 'Preference matching' };
  }
  if (col.includes('storage') || col.includes('space')) {
    return { priority: 'medium', reason: 'Specific requirement' };
  }
  if (col.includes('reason') || col.includes('motivation')) {
    return { priority: 'medium', reason: 'Understanding context' };
  }
  
  // Low business value
  if (col.includes('id') && col !== 'user_id') {
    return { priority: 'low', reason: 'System field' };
  }
  if (col.includes('created') || col.includes('updated')) {
    return { priority: 'low', reason: 'System timestamp' };
  }
  if (col.includes('active') || col.includes('verified')) {
    return { priority: 'low', reason: 'Should be elsewhere' };
  }
  if (col.includes('subscription') || col.includes('payment')) {
    return { priority: 'low', reason: 'Wrong table' };
  }
  if (col.includes('login') || col.includes('session')) {
    return { priority: 'low', reason: 'User activity data' };
  }
  
  return { priority: 'medium', reason: 'Needs manual review' };
}

function findDuplicates(columns) {
  const groups = {
    'Income': columns.filter(col => col.includes('income')),
    'Budget': columns.filter(col => col.includes('budget')),
    'Name': columns.filter(col => col.includes('name')),
    'Phone': columns.filter(col => col.includes('phone')),
    'Email': columns.filter(col => col.includes('email')),
    'City': columns.filter(col => col.includes('city')),
    'Status': columns.filter(col => col.includes('status')),
    'Date': columns.filter(col => col.includes('date')),
    'Preferred': columns.filter(col => col.includes('preferred')),
    'Partner': columns.filter(col => col.includes('partner')),
    'Employment': columns.filter(col => col.includes('employ'))
  };
  
  Object.entries(groups).forEach(([category, cols]) => {
    if (cols.length > 1) {
      console.log(`   ${category}: ${cols.join(', ')}`);
    }
  });
}

getActualColumns();
