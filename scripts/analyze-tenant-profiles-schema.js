const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeTenantProfilesSchema() {
  console.log('🔍 Analyzing tenant_profiles table schema...\n');
  
  try {
    // Get all columns from tenant_profiles table
    const { data: columns, error } = await supabase
      .rpc('get_table_columns', { table_name: 'tenant_profiles' })
      .catch(async () => {
        // Fallback: query information_schema directly
        const { data, error } = await supabase
          .from('information_schema.columns')
          .select('column_name, data_type, is_nullable, column_default')
          .eq('table_name', 'tenant_profiles')
          .order('ordinal_position');
        
        return { data, error };
      });

    if (error) {
      console.error('Error fetching schema:', error);
      
      // Alternative: Get a sample record to see available columns
      console.log('Trying alternative approach - fetching sample record...\n');
      
      const { data: sampleData, error: sampleError } = await supabase
        .from('tenant_profiles')
        .select('*')
        .limit(1);
      
      if (sampleError) {
        console.error('Error fetching sample data:', sampleError);
        return;
      }
      
      if (sampleData && sampleData.length > 0) {
        const columnNames = Object.keys(sampleData[0]);
        console.log('📋 Available columns in tenant_profiles table:');
        console.log('=' .repeat(60));
        
        columnNames.forEach((col, index) => {
          console.log(`${index + 1}. ${col}`);
        });
        
        console.log('\n📊 Total columns:', columnNames.length);
        
        // Analyze column usage
        analyzeColumnUsage(columnNames);
      } else {
        console.log('No data found in tenant_profiles table');
      }
      
      return;
    }
    
    console.log('📋 tenant_profiles table schema:');
    console.log('=' .repeat(80));
    console.log('Column Name'.padEnd(30) + 'Data Type'.padEnd(20) + 'Nullable'.padEnd(10) + 'Default');
    console.log('-'.repeat(80));
    
    const columnNames = [];
    columns.forEach(col => {
      columnNames.push(col.column_name);
      console.log(
        col.column_name.padEnd(30) + 
        col.data_type.padEnd(20) + 
        col.is_nullable.padEnd(10) + 
        (col.column_default || 'NULL')
      );
    });
    
    console.log('\n📊 Total columns:', columns.length);
    
    // Analyze column usage
    analyzeColumnUsage(columnNames);
    
  } catch (error) {
    console.error('Analysis failed:', error);
  }
}

function analyzeColumnUsage(columnNames) {
  console.log('\n🔍 COLUMN USAGE ANALYSIS');
  console.log('=' .repeat(80));
  
  // Define columns used in the 7-step modal
  const modalColumns = [
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
    'min_budget', 'max_budget', 'preferred_bedrooms', 'preferred_property_type', 
    'furnished_preference', 'desired_amenities', 'has_pets', 'pet_details', 'smokes', 'smoking_details',
    
    // Step 7: About You
    'bio', 'motivation',
    
    // System fields
    'user_id', 'profile_completed', 'created_at', 'updated_at',
    
    // Computed fields
    'total_household_income', 'family_composition'
  ];
  
  // Core system fields that should always exist
  const systemColumns = [
    'id', 'user_id', 'created_at', 'updated_at', 'profile_completed'
  ];
  
  // Categorize columns
  const usedInModal = [];
  const systemFields = [];
  const unusedColumns = [];
  const potentiallyUseful = [];
  
  columnNames.forEach(col => {
    if (systemColumns.includes(col)) {
      systemFields.push(col);
    } else if (modalColumns.includes(col)) {
      usedInModal.push(col);
    } else {
      unusedColumns.push(col);
      
      // Check if it might be useful to include
      if (isColumnPotentiallyUseful(col)) {
        potentiallyUseful.push(col);
      }
    }
  });
  
  console.log('\n✅ COLUMNS USED IN 7-STEP MODAL (' + usedInModal.length + '):');
  usedInModal.forEach(col => console.log(`  • ${col}`));
  
  console.log('\n🔧 SYSTEM COLUMNS (' + systemFields.length + '):');
  systemFields.forEach(col => console.log(`  • ${col}`));
  
  console.log('\n❌ UNUSED COLUMNS (' + unusedColumns.length + '):');
  unusedColumns.forEach(col => console.log(`  • ${col}`));
  
  console.log('\n💡 POTENTIALLY USEFUL UNUSED COLUMNS (' + potentiallyUseful.length + '):');
  potentiallyUseful.forEach(col => {
    console.log(`  • ${col} - ${getColumnSuggestion(col)}`);
  });
  
  console.log('\n📋 RECOMMENDATIONS:');
  console.log('=' .repeat(50));
  
  if (unusedColumns.length > potentiallyUseful.length) {
    const toRemove = unusedColumns.filter(col => !potentiallyUseful.includes(col));
    console.log('\n🗑️  COLUMNS TO CONSIDER REMOVING:');
    toRemove.forEach(col => console.log(`  • ${col}`));
  }
  
  if (potentiallyUseful.length > 0) {
    console.log('\n➕ COLUMNS TO CONSIDER ADDING TO MODAL:');
    potentiallyUseful.forEach(col => {
      console.log(`  • ${col} - ${getColumnSuggestion(col)}`);
    });
  }
  
  // Check for potential duplicates
  console.log('\n🔍 POTENTIAL DUPLICATES OR SIMILAR FIELDS:');
  findPotentialDuplicates(columnNames);
}

function isColumnPotentiallyUseful(columnName) {
  const usefulPatterns = [
    'guarantor', 'reference', 'emergency', 'contact', 'income_proof', 'document',
    'credit', 'score', 'rating', 'verification', 'status', 'preference',
    'requirement', 'availability', 'move_in', 'lease', 'rental'
  ];
  
  return usefulPatterns.some(pattern => 
    columnName.toLowerCase().includes(pattern)
  );
}

function getColumnSuggestion(columnName) {
  const suggestions = {
    'guarantor_available': 'Add to Step 3 (Work) - Whether user has a guarantor',
    'guarantor_name': 'Add to Step 3 (Work) - Guarantor details',
    'guarantor_income': 'Add to Step 3 (Work) - Guarantor income',
    'emergency_contact': 'Add to Step 1 (Personal) - Emergency contact info',
    'emergency_contact_phone': 'Add to Step 1 (Personal) - Emergency contact phone',
    'move_in_date': 'Add to Step 5 (Location) - Preferred move-in date',
    'lease_duration_preference': 'Add to Step 6 (Housing) - Preferred lease length',
    'previous_rental_experience': 'Add to Step 7 (About) - Previous rental history',
    'income_proof_available': 'Add to Step 3 (Work) - Whether income proof is available',
    'references_available': 'Add to Step 7 (About) - Whether references are available',
    'credit_score': 'Add to Step 3 (Work) - Credit score if available',
    'rental_budget_flexibility': 'Add to Step 6 (Housing) - Budget flexibility',
    'preferred_lease_start': 'Add to Step 5 (Location) - When they want to start',
    'current_living_situation': 'Add to Step 7 (About) - Current housing situation'
  };
  
  return suggestions[columnName] || 'Consider if this adds value to tenant profiles';
}

function findPotentialDuplicates(columnNames) {
  const duplicateGroups = [];
  
  // Group similar column names
  const groups = {
    'income': columnNames.filter(col => col.includes('income')),
    'budget': columnNames.filter(col => col.includes('budget')),
    'preferred': columnNames.filter(col => col.includes('preferred')),
    'partner': columnNames.filter(col => col.includes('partner')),
    'children': columnNames.filter(col => col.includes('child')),
    'employment': columnNames.filter(col => col.includes('employ')),
    'contact': columnNames.filter(col => col.includes('contact')),
    'phone': columnNames.filter(col => col.includes('phone')),
    'name': columnNames.filter(col => col.includes('name')),
    'status': columnNames.filter(col => col.includes('status'))
  };
  
  Object.entries(groups).forEach(([category, cols]) => {
    if (cols.length > 1) {
      console.log(`  ${category.toUpperCase()}: ${cols.join(', ')}`);
    }
  });
}

analyzeTenantProfilesSchema();
