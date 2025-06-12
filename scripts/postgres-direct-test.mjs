import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

console.log('=== DIRECT POSTGRESQL CONNECTION TEST ===');

const connectionString = process.env.supabase_postgres;
console.log('Connection string:', connectionString.replace(/:[^:@]*@/, ':****@'));

const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

try {
  console.log('\nConnecting to PostgreSQL...');
  await client.connect();
  console.log('✅ Connected successfully!');

  // Test 1: Basic query
  console.log('\n1. Testing basic query...');
  const result1 = await client.query('SELECT NOW() as current_time');
  console.log('Current time:', result1.rows[0].current_time);

  // Test 2: Check tenant_profiles table
  console.log('\n2. Checking tenant_profiles table...');
  const result2 = await client.query(`
    SELECT COUNT(*) as total_rows 
    FROM tenant_profiles
  `);
  console.log('Total rows in tenant_profiles:', result2.rows[0].total_rows);

  // Test 3: Get table structure
  console.log('\n3. Getting table structure...');
  const result3 = await client.query(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_name = 'tenant_profiles' 
    ORDER BY ordinal_position
  `);
  
  console.log(`Found ${result3.rows.length} columns:`);
  result3.rows.forEach((col, index) => {
    console.log(`${(index + 1).toString().padStart(2)}. ${col.column_name.padEnd(30)} ${col.data_type.padEnd(20)} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
  });

  // Test 4: Sample data
  console.log('\n4. Getting sample data...');
  const result4 = await client.query(`
    SELECT * FROM tenant_profiles LIMIT 3
  `);
  
  if (result4.rows.length > 0) {
    console.log(`Sample data (${result4.rows.length} rows):`);
    result4.rows.forEach((row, index) => {
      console.log(`Row ${index + 1}:`, {
        user_id: row.user_id,
        first_name: row.first_name,
        last_name: row.last_name,
        profile_completed: row.profile_completed
      });
    });
  } else {
    console.log('No data found in tenant_profiles table');
  }

  // Test 5: Test insert capability
  console.log('\n5. Testing insert capability...');
  const testUserId = 'test-postgres-' + Date.now();
  
  try {
    const insertResult = await client.query(`
      INSERT INTO tenant_profiles (user_id, first_name, last_name, profile_completed)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [testUserId, 'Test', 'PostgreSQL', false]);
    
    console.log('✅ Insert successful!');
    console.log('Inserted row:', insertResult.rows[0]);
    
    // Clean up
    await client.query('DELETE FROM tenant_profiles WHERE user_id = $1', [testUserId]);
    console.log('🧹 Test record cleaned up');
    
  } catch (insertError) {
    console.log('❌ Insert failed:', insertError.message);
  }

  // Test 6: Check RLS policies
  console.log('\n6. Checking RLS policies...');
  const result6 = await client.query(`
    SELECT schemaname, tablename, rowsecurity 
    FROM pg_tables 
    WHERE tablename = 'tenant_profiles'
  `);
  
  if (result6.rows.length > 0) {
    console.log('RLS enabled:', result6.rows[0].rowsecurity);
  }

} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Code:', error.code);
} finally {
  await client.end();
  console.log('\n🔌 Connection closed');
}

console.log('\n=== TEST COMPLETE ===');
