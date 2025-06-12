const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeRealSchema() {
  console.log('🔍 REAL TENANT_PROFILES SCHEMA ANALYSIS');
  console.log('=' .repeat(60));
  
  try {
    // Get actual table structure from Supabase
    const actualColumns = await getActualTableColumns();
    
    if (!actualColumns) {
      console.error('❌ Could not retrieve table structure');
      return;
    }
    
    console.log(`\n📊 ACTUAL TABLE STRUCTURE (${actualColumns.length} columns):`);
    console.log('-' .repeat(60));
    
    actualColumns.forEach((col, index) => {
      console.log(`${(index + 1).toString().padStart(2)}. ${col.name.padEnd(30)} ${col.type.padEnd(15)} ${col.nullable ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Analyze usage vs actual schema
    analyzeUsageVsActual(actualColumns);
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
}

async function getActualTableColumns() {
  try {
    // Method 1: Try to get schema from information_schema
    const { data: schemaData, error: schemaError } = await supabase
      .rpc('exec', { 
        sql: `
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default
          FROM information_schema.columns 
          WHERE table_name = 'tenant_profiles' 
          ORDER BY ordinal_position;
        `
      });
    
    if (!schemaError && schemaData) {
      return schemaData.map(col => ({
        name: col.column_name,
        type: col.data_type,
        nullable: col.is_nullable === 'YES',
        default: col.column_default
      }));
    }
    
    // Method 2: Fallback - get sample record to see columns
    console.log('📋 Using fallback method - sampling actual data...\n');
    
    const { data: sampleData, error: sampleError } = await supabase
      .from('tenant_profiles')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.error('Error getting sample data:', sampleError.message);
      return null;
    }
    
    if (!sampleData || sampleData.length === 0) {
      console.log('⚠️ No data in tenant_profiles table');
      return [];
    }
    
    // Extract column names and try to infer types
    const columns = Object.keys(sampleData[0]).map(colName => {
      const value = sampleData[0][colName];
      let type = 'unknown';
      
      if (value === null) {
        type = 'nullable';
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
      
      return {
        name: colName,
        type: type,
        nullable: value === null,
        default: null
      };
    });
    
    return columns;
    
  } catch (error) {
    console.error('Error getting table columns:', error.message);
    return null;
  }
}

function analyzeUsageVsActual(actualColumns) {
  console.log('\n🔍 USAGE ANALYSIS: Modal vs Actual Schema');
  console.log('=' .repeat(60));
  
  // Define what the modal currently uses
  const modalFields = {
    // Step 1: Personal Information
    step1: ['first_name', 'last_name', 'phone', 'date_of_birth', 'nationality', 'sex', 'profile_picture_url'],
    
    // Step 2: Family & Relationship
    step2: ['marital_status', 'has_children', 'number_of_children', 'children_ages'],
    
    // Step 3: Work & Employment
    step3: ['profession', 'employer', 'employment_status', 'work_contract_type', 'monthly_income', 'housing_allowance_eligible'],
    
    // Step 4: Partner Information
    step4: ['has_partner', 'partner_name', 'partner_profession', 'partner_monthly_income', 'partner_employment_status'],
    
    // Step 5: Location Preferences
    step5: ['preferred_city', 'preferred_districts', 'max_commute_time', 'transportation_preference'],
    
    // Step 6: Housing & Lifestyle
    step6: ['min_budget', 'max_budget', 'preferred_bedrooms', 'preferred_property_type', 'furnished_preference', 'desired_amenities', 'has_pets', 'pet_details', 'smokes', 'smoking_details'],
    
    // Step 7: About You
    step7: ['bio', 'motivation'],
    
    // System fields
    system: ['user_id', 'profile_completed', 'created_at', 'updated_at', 'total_household_income', 'family_composition']
  };
  
  const allModalFields = Object.values(modalFields).flat();
  const actualColumnNames = actualColumns.map(col => col.name);
  
  // Categorize columns
  const usedInModal = [];
  const unusedInModal = [];
  const missingFromSchema = [];
  
  // Check which actual columns are used in modal
  actualColumnNames.forEach(colName => {
    if (allModalFields.includes(colName)) {
      usedInModal.push(colName);
    } else {
      unusedInModal.push(colName);
    }
  });
  
  // Check which modal fields are missing from schema
  allModalFields.forEach(fieldName => {
    if (!actualColumnNames.includes(fieldName)) {
      missingFromSchema.push(fieldName);
    }
  });
  
  console.log(`\n✅ COLUMNS USED IN MODAL (${usedInModal.length}):`);
  usedInModal.forEach(col => console.log(`   • ${col}`));
  
  console.log(`\n❌ COLUMNS NOT USED IN MODAL (${unusedInModal.length}):`);
  unusedInModal.forEach(col => console.log(`   • ${col}`));
  
  if (missingFromSchema.length > 0) {
    console.log(`\n⚠️  MODAL FIELDS MISSING FROM SCHEMA (${missingFromSchema.length}):`);
    missingFromSchema.forEach(field => console.log(`   • ${field}`));
  }
  
  // Analyze unused columns for business value
  console.log('\n💡 BUSINESS VALUE ANALYSIS OF UNUSED COLUMNS:');
  console.log('-' .repeat(50));
  
  const businessValueAnalysis = analyzeBusinessValue(unusedInModal);
  
  console.log('\n🏆 HIGH BUSINESS VALUE - SHOULD ADD TO MODAL:');
  businessValueAnalysis.highValue.forEach(item => {
    console.log(`   • ${item.column.padEnd(25)} - ${item.reason}`);
  });
  
  console.log('\n📈 MEDIUM BUSINESS VALUE - CONSIDER ADDING:');
  businessValueAnalysis.mediumValue.forEach(item => {
    console.log(`   • ${item.column.padEnd(25)} - ${item.reason}`);
  });
  
  console.log('\n🗑️  LOW/NO BUSINESS VALUE - CONSIDER REMOVING:');
  businessValueAnalysis.lowValue.forEach(item => {
    console.log(`   • ${item.column.padEnd(25)} - ${item.reason}`);
  });
  
  // Check for potential duplicates
  console.log('\n🔍 POTENTIAL DUPLICATES ANALYSIS:');
  console.log('-' .repeat(40));
  findPotentialDuplicates(actualColumnNames);
  
  // Generate recommendations
  generateRecommendations(businessValueAnalysis, actualColumnNames, usedInModal);
}

function analyzeBusinessValue(unusedColumns) {
  const highValue = [];
  const mediumValue = [];
  const lowValue = [];
  
  unusedColumns.forEach(col => {
    const analysis = getBusinessValueAnalysis(col);
    
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

function getBusinessValueAnalysis(columnName) {
  const highValuePatterns = {
    'guarantor': 'Critical for landlord confidence and risk assessment',
    'emergency_contact': 'Important for safety and responsibility',
    'move_in_date': 'Essential for matching timing requirements',
    'references': 'Key trust signal for landlords',
    'income_proof': 'Verification capability increases credibility',
    'work_from_home': 'Relevant for space and internet requirements',
    'parking': 'Important filter for urban areas',
    'lease_duration': 'Helps match tenant/landlord preferences'
  };
  
  const mediumValuePatterns = {
    'previous_landlord': 'Useful for reference checking',
    'rental_history': 'Experience indicator',
    'current_living': 'Context for housing search',
    'reason_for_moving': 'Helps understand motivation',
    'budget_flexibility': 'Useful for negotiation',
    'viewing_availability': 'Practical scheduling information',
    'storage': 'Specific housing requirement',
    'noise_tolerance': 'Lifestyle matching'
  };
  
  const lowValuePatterns = {
    'id': 'System field',
    'created_at': 'System field',
    'updated_at': 'System field',
    'is_active': 'Redundant with profile_completed',
    'is_verified': 'Should be in separate verification table',
    'last_login': 'Belongs in user activity tracking',
    'subscription': 'Belongs in user_roles table',
    'payment': 'Belongs in payment_records table'
  };
  
  // Check high value patterns
  for (const [pattern, reason] of Object.entries(highValuePatterns)) {
    if (columnName.toLowerCase().includes(pattern)) {
      return { value: 'high', reason };
    }
  }
  
  // Check medium value patterns
  for (const [pattern, reason] of Object.entries(mediumValuePatterns)) {
    if (columnName.toLowerCase().includes(pattern)) {
      return { value: 'medium', reason };
    }
  }
  
  // Check low value patterns
  for (const [pattern, reason] of Object.entries(lowValuePatterns)) {
    if (columnName.toLowerCase().includes(pattern)) {
      return { value: 'low', reason };
    }
  }
  
  // Default analysis based on column name
  if (columnName.includes('_id') || columnName.includes('_at')) {
    return { value: 'low', reason: 'System/reference field' };
  }
  
  return { value: 'medium', reason: 'Needs manual review for business value' };
}

function findPotentialDuplicates(columnNames) {
  const duplicateGroups = {
    'Income': columnNames.filter(col => col.includes('income')),
    'Budget': columnNames.filter(col => col.includes('budget')),
    'Name': columnNames.filter(col => col.includes('name') && !col.includes('username')),
    'Phone': columnNames.filter(col => col.includes('phone') || col.includes('mobile')),
    'Email': columnNames.filter(col => col.includes('email')),
    'City': columnNames.filter(col => col.includes('city')),
    'Preferred': columnNames.filter(col => col.includes('preferred')),
    'Partner': columnNames.filter(col => col.includes('partner')),
    'Children': columnNames.filter(col => col.includes('child')),
    'Employment': columnNames.filter(col => col.includes('employ')),
    'Status': columnNames.filter(col => col.includes('status')),
    'Date': columnNames.filter(col => col.includes('date')),
    'Contact': columnNames.filter(col => col.includes('contact'))
  };
  
  Object.entries(duplicateGroups).forEach(([category, cols]) => {
    if (cols.length > 1) {
      console.log(`   ${category.padEnd(12)}: ${cols.join(', ')}`);
    }
  });
}

function generateRecommendations(businessValueAnalysis, actualColumns, usedColumns) {
  console.log('\n📋 ACTIONABLE RECOMMENDATIONS:');
  console.log('=' .repeat(50));
  
  console.log('\n🎯 IMMEDIATE ACTIONS (High Impact):');
  if (businessValueAnalysis.highValue.length > 0) {
    businessValueAnalysis.highValue.forEach((item, index) => {
      console.log(`   ${index + 1}. ADD "${item.column}" to modal - ${item.reason}`);
    });
  } else {
    console.log('   ✅ No high-value unused columns found');
  }
  
  console.log('\n📈 FUTURE ENHANCEMENTS (Medium Impact):');
  if (businessValueAnalysis.mediumValue.length > 0) {
    businessValueAnalysis.mediumValue.slice(0, 5).forEach((item, index) => {
      console.log(`   ${index + 1}. Consider adding "${item.column}" - ${item.reason}`);
    });
  }
  
  console.log('\n🗑️  CLEANUP OPPORTUNITIES:');
  if (businessValueAnalysis.lowValue.length > 0) {
    businessValueAnalysis.lowValue.slice(0, 5).forEach((item, index) => {
      console.log(`   ${index + 1}. Consider removing "${item.column}" - ${item.reason}`);
    });
  }
  
  console.log('\n📊 SUMMARY STATISTICS:');
  console.log(`   • Total columns in table: ${actualColumns.length}`);
  console.log(`   • Used in modal: ${usedColumns.length} (${Math.round(usedColumns.length/actualColumns.length*100)}%)`);
  console.log(`   • High business value unused: ${businessValueAnalysis.highValue.length}`);
  console.log(`   • Medium business value unused: ${businessValueAnalysis.mediumValue.length}`);
  console.log(`   • Low business value unused: ${businessValueAnalysis.lowValue.length}`);
}

// Run the analysis
analyzeRealSchema();
