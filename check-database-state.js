// Check what tables exist in the database after reset
const SUPABASE_URL = 'https://lxtkotgfsnahwncgcfnl.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dGtvdGdmc25haHduY2djZm5sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAyNTgyOCwiZXhwIjoyMDY0NjAxODI4fQ.1GaDpXyyXqxBzQSu7Pu3xRpF0_Y5AoQcLRQsgHmIM9I';

async function checkDatabaseState() {
  console.log('🔍 Checking database state after reset...');
  
  try {
    // Check what tables exist
    const tablesResponse = await fetch(`${SUPABASE_URL}/rest/v1/?select=*`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (tablesResponse.ok) {
      console.log('✅ Database is accessible');
    } else {
      console.log('❌ Database access failed:', await tablesResponse.text());
    }
    
    // Try to access specific tables
    const tablesToCheck = [
      'user_roles',
      'profiles', 
      'payment_records',
      'tenant_profiles',
      'properties'
    ];
    
    for (const table of tablesToCheck) {
      console.log(`\n📋 Checking table: ${table}`);
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?limit=1`, {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${table} exists, rows: ${data.length}`);
      } else {
        const error = await response.text();
        if (error.includes('does not exist')) {
          console.log(`❌ ${table} does not exist`);
        } else {
          console.log(`⚠️ ${table} error:`, error);
        }
      }
    }
    
    console.log('\n💡 ANALYSIS:');
    console.log('The database reset deleted essential tables.');
    console.log('We need to recreate the core tables for the application to work.');
    
  } catch (error) {
    console.error('❌ Error checking database state:', error);
  }
}

// Run the check
checkDatabaseState();
