import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

console.log('🔍 SUPABASE CONNECTION DIAGNOSTIC TEST');
console.log('=' .repeat(60));

// Check environment variables
console.log('\n📋 ENVIRONMENT VARIABLES CHECK:');
console.log('-' .repeat(40));
console.log(`VITE_SUPABASE_URL: ${process.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
console.log(`VITE_SUPABASE_ANON_KEY: ${process.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`SUPABASE_SERVICE_KEY: ${process.env.SUPABASE_SERVICE_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`supabase_postgres: ${process.env.supabase_postgres ? '✅ Set' : '❌ Missing'}`);

if (process.env.VITE_SUPABASE_URL) {
  console.log(`URL: ${process.env.VITE_SUPABASE_URL}`);
}

// Test with anon key
async function testAnonConnection() {
  console.log('\n🔑 TESTING ANON KEY CONNECTION:');
  console.log('-' .repeat(40));
  
  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );
    
    // Test basic connection
    const { data, error } = await supabase
      .from('tenant_profiles')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log(`❌ Anon connection failed: ${error.message}`);
      console.log(`   Code: ${error.code}`);
      console.log(`   Details: ${error.details}`);
      console.log(`   Hint: ${error.hint}`);
      return false;
    } else {
      console.log(`✅ Anon connection successful`);
      console.log(`   tenant_profiles count: ${data || 'unknown'}`);
      return true;
    }
  } catch (err) {
    console.log(`❌ Anon connection error: ${err.message}`);
    return false;
  }
}

// Test with service key
async function testServiceConnection() {
  console.log('\n🔐 TESTING SERVICE KEY CONNECTION:');
  console.log('-' .repeat(40));
  
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
    
    // Test basic connection
    const { data, error } = await supabase
      .from('tenant_profiles')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log(`❌ Service connection failed: ${error.message}`);
      console.log(`   Code: ${error.code}`);
      console.log(`   Details: ${error.details}`);
      console.log(`   Hint: ${error.hint}`);
      return false;
    } else {
      console.log(`✅ Service connection successful`);
      console.log(`   tenant_profiles count: ${data || 'unknown'}`);
      return true;
    }
  } catch (err) {
    console.log(`❌ Service connection error: ${err.message}`);
    return false;
  }
}

// Test table access
async function testTableAccess() {
  console.log('\n📊 TESTING TABLE ACCESS:');
  console.log('-' .repeat(40));
  
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  );
  
  const tables = [
    'tenant_profiles',
    'users',
    'user_roles',
    'properties',
    'applications'
  ];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: accessible (${data ? data.length : 0} rows in sample)`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }
}

// Test specific queries that have been failing
async function testSpecificQueries() {
  console.log('\n🎯 TESTING SPECIFIC QUERIES:');
  console.log('-' .repeat(40));
  
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  );
  
  // Test 1: Get tenant_profiles structure
  console.log('\n1. Testing tenant_profiles structure query:');
  try {
    const { data, error } = await supabase
      .from('tenant_profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`   ❌ Failed: ${error.message}`);
    } else {
      console.log(`   ✅ Success: Got ${data ? data.length : 0} rows`);
      if (data && data.length > 0) {
        console.log(`   📋 Columns: ${Object.keys(data[0]).length} found`);
        console.log(`   📝 Sample columns: ${Object.keys(data[0]).slice(0, 5).join(', ')}...`);
      }
    }
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
  }
  
  // Test 2: Count query
  console.log('\n2. Testing count query:');
  try {
    const { count, error } = await supabase
      .from('tenant_profiles')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`   ❌ Failed: ${error.message}`);
    } else {
      console.log(`   ✅ Success: ${count} total rows`);
    }
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
  }
  
  // Test 3: Insert test (will rollback)
  console.log('\n3. Testing insert capability:');
  try {
    const testData = {
      user_id: 'test-user-' + Date.now(),
      first_name: 'Test',
      last_name: 'User',
      profile_completed: false
    };
    
    const { data, error } = await supabase
      .from('tenant_profiles')
      .insert(testData)
      .select();
    
    if (error) {
      console.log(`   ❌ Insert failed: ${error.message}`);
      console.log(`   Code: ${error.code}`);
    } else {
      console.log(`   ✅ Insert successful`);
      
      // Clean up - delete the test record
      if (data && data.length > 0) {
        await supabase
          .from('tenant_profiles')
          .delete()
          .eq('user_id', testData.user_id);
        console.log(`   🧹 Test record cleaned up`);
      }
    }
  } catch (err) {
    console.log(`   ❌ Insert error: ${err.message}`);
  }
}

// Test RLS policies
async function testRLSPolicies() {
  console.log('\n🛡️ TESTING RLS POLICIES:');
  console.log('-' .repeat(40));
  
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  );
  
  // Test without authentication
  console.log('\n1. Testing without authentication:');
  try {
    const { data, error } = await supabase
      .from('tenant_profiles')
      .select('user_id')
      .limit(5);
    
    if (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      if (error.message.includes('RLS') || error.message.includes('policy')) {
        console.log(`   💡 This suggests RLS is active and working`);
      }
    } else {
      console.log(`   ✅ Success: Got ${data ? data.length : 0} rows`);
      console.log(`   ⚠️  This suggests RLS might be too permissive`);
    }
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
  }
}

// Main test runner
async function runAllTests() {
  console.log('\n🚀 STARTING COMPREHENSIVE SUPABASE TEST');
  console.log('=' .repeat(60));
  
  const results = {
    anonConnection: false,
    serviceConnection: false,
    tableAccess: false,
    specificQueries: false,
    rlsPolicies: false
  };
  
  try {
    results.anonConnection = await testAnonConnection();
    results.serviceConnection = await testServiceConnection();
    
    if (results.anonConnection) {
      await testTableAccess();
      await testSpecificQueries();
      await testRLSPolicies();
    }
    
    // Summary
    console.log('\n📊 TEST SUMMARY:');
    console.log('=' .repeat(30));
    console.log(`Anon Connection: ${results.anonConnection ? '✅' : '❌'}`);
    console.log(`Service Connection: ${results.serviceConnection ? '✅' : '❌'}`);
    
    if (results.anonConnection) {
      console.log('\n💡 CONNECTION ANALYSIS:');
      console.log('Your Supabase connection is working correctly.');
      console.log('The connection string and keys are valid.');
      console.log('Any SQL query issues are likely due to:');
      console.log('  • RLS (Row Level Security) policies');
      console.log('  • Missing table columns');
      console.log('  • Authentication requirements');
      console.log('  • Specific query syntax issues');
    } else {
      console.log('\n❌ CONNECTION ISSUES DETECTED:');
      console.log('The Supabase connection is failing.');
      console.log('Possible causes:');
      console.log('  • Invalid URL or API keys');
      console.log('  • Network connectivity issues');
      console.log('  • Supabase project is paused/deleted');
      console.log('  • Environment variables not loaded correctly');
    }
    
  } catch (error) {
    console.error('\n💥 CRITICAL ERROR:', error.message);
  }
}

// Run the tests
runAllTests();
