import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const { Client } = pg;

// Extract connection details from Supabase URL
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const dbPassword = process.env.supabase_DB_Password;

console.log('🔍 REAL TENANT_PROFILES SCHEMA ANALYSIS VIA POSTGRES');
console.log('=' .repeat(70));

if (!supabaseUrl || !dbPassword) {
  console.error('❌ Missing required environment variables');
  console.log('Required: VITE_SUPABASE_URL, SUPABASE_DB_PASSWORD');
  process.exit(1);
}

// Parse Supabase URL to get database connection details
const urlMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
if (!urlMatch) {
  console.error('❌ Invalid Supabase URL format');
  process.exit(1);
}

const projectRef = urlMatch[1];

const client = new Client({
  host: `db.${projectRef}.supabase.co`,
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: dbPassword,
  ssl: { rejectUnauthorized: false }
});

async function analyzeSchema() {
  try {
    console.log('🔌 Connecting to PostgreSQL database...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Get actual table structure
    const actualColumns = await getTableStructure();
    
    if (!actualColumns || actualColumns.length === 0) {
      console.log('❌ Could not retrieve table structure');
      return;
    }

    console.log(`📊 TENANT_PROFILES TABLE STRUCTURE (${actualColumns.length} columns):`);
    console.log('-' .repeat(80));
    console.log('Column Name'.padEnd(35) + 'Data Type'.padEnd(20) + 'Nullable'.padEnd(10) + 'Default');
    console.log('-' .repeat(80));

    actualColumns.forEach((col, index) => {
      console.log(
        `${(index + 1).toString().padStart(2)}. ${col.column_name.padEnd(32)} ${col.data_type.padEnd(17)} ${col.is_nullable.padEnd(8)} ${col.column_default || 'NULL'}`
      );
    });

    // Analyze usage vs actual schema
    await analyzeUsageVsActual(actualColumns);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

async function getTableStructure() {
  try {
    const query = `
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length,
        numeric_precision,
        numeric_scale
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'tenant_profiles'
      ORDER BY ordinal_position;
    `;

    const result = await client.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error getting table structure:', error.message);
    return null;
  }
}

async function analyzeUsageVsActual(actualColumns) {
  console.log('\n🔍 USAGE ANALYSIS: Modal vs Database Reality');
  console.log('=' .repeat(70));

  // Fields currently used in the 7-step modal
  const modalFields = [
    // Step 1: Personal Information
    'first_name', 'last_name', 'phone', 'date_of_birth', 'nationality', 'sex', 'profile_picture_url',
    
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

  const actualColumnNames = actualColumns.map(col => col.column_name);
  
  const usedInModal = actualColumnNames.filter(col => modalFields.includes(col));
  const unusedInModal = actualColumnNames.filter(col => !modalFields.includes(col));
  const missingFromDB = modalFields.filter(field => !actualColumnNames.includes(field));

  console.log(`\n✅ COLUMNS USED IN MODAL (${usedInModal.length}):`);
  usedInModal.forEach(col => console.log(`   • ${col}`));

  console.log(`\n❌ COLUMNS NOT USED IN MODAL (${unusedInModal.length}):`);
  unusedInModal.forEach(col => console.log(`   • ${col}`));

  if (missingFromDB.length > 0) {
    console.log(`\n⚠️  MODAL EXPECTS BUT MISSING FROM DB (${missingFromDB.length}):`);
    missingFromDB.forEach(field => console.log(`   • ${field}`));
  }

  // Business value analysis
  console.log('\n💡 BUSINESS VALUE ANALYSIS OF UNUSED COLUMNS:');
  console.log('-' .repeat(55));

  const businessAnalysis = analyzeBusinessValue(unusedInModal);

  if (businessAnalysis.highValue.length > 0) {
    console.log('\n🏆 HIGH BUSINESS VALUE - SHOULD ADD TO MODAL:');
    businessAnalysis.highValue.forEach(item => {
      console.log(`   • ${item.column.padEnd(30)} - ${item.reason}`);
    });
  }

  if (businessAnalysis.mediumValue.length > 0) {
    console.log('\n📈 MEDIUM BUSINESS VALUE - CONSIDER ADDING:');
    businessAnalysis.mediumValue.forEach(item => {
      console.log(`   • ${item.column.padEnd(30)} - ${item.reason}`);
    });
  }

  if (businessAnalysis.lowValue.length > 0) {
    console.log('\n🗑️  LOW/NO BUSINESS VALUE - CONSIDER REMOVING:');
    businessAnalysis.lowValue.forEach(item => {
      console.log(`   • ${item.column.padEnd(30)} - ${item.reason}`);
    });
  }

  // Check for potential duplicates
  console.log('\n🔍 POTENTIAL DUPLICATES ANALYSIS:');
  console.log('-' .repeat(45));
  findPotentialDuplicates(actualColumnNames);

  // Generate actionable recommendations
  generateRecommendations(businessAnalysis, actualColumnNames, usedInModal);

  // Get sample data for better analysis
  await getSampleData(unusedInModal);
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
  const col = columnName.toLowerCase();

  // High business value patterns
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

  // Medium business value patterns
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

  // Low business value patterns
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
    if (col.includes(pattern)) {
      return { value: 'high', reason };
    }
  }

  // Check medium value patterns
  for (const [pattern, reason] of Object.entries(mediumValuePatterns)) {
    if (col.includes(pattern)) {
      return { value: 'medium', reason };
    }
  }

  // Check low value patterns
  for (const [pattern, reason] of Object.entries(lowValuePatterns)) {
    if (col.includes(pattern)) {
      return { value: 'low', reason };
    }
  }

  // Default analysis based on column name
  if (col.includes('_id') || col.includes('_at')) {
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
  console.log('=' .repeat(55));

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

async function getSampleData(unusedColumns) {
  if (unusedColumns.length === 0) return;

  console.log('\n📋 SAMPLE DATA ANALYSIS:');
  console.log('-' .repeat(35));

  try {
    // Get a sample record to see actual data
    const sampleQuery = `SELECT ${unusedColumns.slice(0, 10).join(', ')} FROM tenant_profiles LIMIT 1`;
    const result = await client.query(sampleQuery);
    
    if (result.rows.length > 0) {
      const sampleData = result.rows[0];
      console.log('\nSample values for unused columns:');
      Object.entries(sampleData).forEach(([col, value]) => {
        let displayValue = value;
        if (value === null) {
          displayValue = '(null)';
        } else if (typeof value === 'string' && value.length > 30) {
          displayValue = `"${value.substring(0, 30)}..."`;
        } else if (typeof value === 'string') {
          displayValue = `"${value}"`;
        }
        console.log(`   ${col.padEnd(25)}: ${displayValue}`);
      });
    }
  } catch (error) {
    console.log('Could not retrieve sample data:', error.message);
  }
}

// Run the analysis
analyzeSchema().catch(console.error);
