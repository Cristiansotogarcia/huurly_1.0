import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

console.log('=== DETAILED SUPABASE ANALYSIS ===');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Test 1: Check if table exists and get structure
console.log('\n1. Testing table structure...');
try {
  const { data, error } = await supabase
    .from('tenant_profiles')
    .select('*')
    .limit(1);
  
  if (error) {
    console.log('ERROR accessing table:', error.message);
    console.log('Error code:', error.code);
    console.log('Error details:', error.details);
  } else {
    console.log('SUCCESS: Table accessible');
    console.log('Rows returned:', data ? data.length : 0);
    if (data && data.length > 0) {
      console.log('Columns found:', Object.keys(data[0]).length);
      console.log('Sample columns:', Object.keys(data[0]).slice(0, 10).join(', '));
    } else {
      console.log('Table is empty');
    }
  }
} catch (err) {
  console.log('CATCH ERROR:', err.message);
}

// Test 2: Test with service key
console.log('\n2. Testing with service key...');
try {
  const serviceSupabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  const { data, error } = await serviceSupabase
    .from('tenant_profiles')
    .select('*')
    .limit(1);
  
  if (error) {
    console.log('ERROR with service key:', error.message);
  } else {
    console.log('SUCCESS with service key');
    console.log('Rows returned:', data ? data.length : 0);
  }
} catch (err) {
  console.log('CATCH ERROR with service key:', err.message);
}

// Test 3: Test other tables
console.log('\n3. Testing other tables...');
const tables = ['users', 'user_roles', 'properties'];

for (const table of tables) {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`${table}: ERROR - ${error.message}`);
    } else {
      console.log(`${table}: SUCCESS - ${data ? data.length : 0} rows`);
    }
  } catch (err) {
    console.log(`${table}: CATCH ERROR - ${err.message}`);
  }
}

// Test 4: Test insert capability
console.log('\n4. Testing insert capability...');
try {
  const testData = {
    user_id: 'test-connection-' + Date.now(),
    first_name: 'Test',
    last_name: 'Connection',
    profile_completed: false
  };
  
  const { data, error } = await supabase
    .from('tenant_profiles')
    .insert(testData)
    .select();
  
  if (error) {
    console.log('INSERT ERROR:', error.message);
    console.log('Error code:', error.code);
    if (error.code === '42501') {
      console.log('This is likely due to RLS policies - which is expected');
    }
  } else {
    console.log('INSERT SUCCESS');
    // Clean up
    if (data && data.length > 0) {
      await supabase
        .from('tenant_profiles')
        .delete()
        .eq('user_id', testData.user_id);
      console.log('Test record cleaned up');
    }
  }
} catch (err) {
  console.log('INSERT CATCH ERROR:', err.message);
}

console.log('\n=== ANALYSIS COMPLETE ===');
