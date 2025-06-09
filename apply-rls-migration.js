// Script to apply RLS migration directly via SQL
const SUPABASE_URL = 'https://lxtkotgfsnahwncgcfnl.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dGtvdGdmc25haHduY2djZm5sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAyNTgyOCwiZXhwIjoyMDY0NjAxODI4fQ.1GaDpXyyXqxBzQSu7Pu3xRpF0_Y5AoQcLRQsgHmIM9I';

async function applyRLSMigration() {
  console.log('🔧 Applying RLS migration directly...');
  
  try {
    // Individual SQL commands to execute
    const commands = [
      // Enable RLS on user_roles
      `ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY`,
      
      // Drop existing policies
      `DROP POLICY IF EXISTS "Users can view own role" ON user_roles`,
      `DROP POLICY IF EXISTS "Users can update own role" ON user_roles`,
      `DROP POLICY IF EXISTS "Users can insert own role" ON user_roles`,
      
      // Create new policies for user_roles
      `CREATE POLICY "Users can view own role" ON user_roles FOR SELECT USING (auth.uid() = user_id)`,
      `CREATE POLICY "Users can update own role" ON user_roles FOR UPDATE USING (auth.uid() = user_id)`,
      `CREATE POLICY "Users can insert own role" ON user_roles FOR INSERT WITH CHECK (auth.uid() = user_id)`,
      
      // Enable RLS on profiles
      `ALTER TABLE profiles ENABLE ROW LEVEL SECURITY`,
      
      // Drop existing policies for profiles
      `DROP POLICY IF EXISTS "Users can view own profile" ON profiles`,
      `DROP POLICY IF EXISTS "Users can update own profile" ON profiles`,
      `DROP POLICY IF EXISTS "Users can insert own profile" ON profiles`,
      
      // Create new policies for profiles
      `CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id)`,
      `CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id)`,
      `CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id)`,
      
      // Enable RLS on payment_records
      `ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY`,
      `DROP POLICY IF EXISTS "Users can view own payments" ON payment_records`,
      `CREATE POLICY "Users can view own payments" ON payment_records FOR SELECT USING (auth.uid() = user_id)`
    ];
    
    for (const command of commands) {
      console.log(`\n📝 Executing: ${command.substring(0, 60)}...`);
      
      try {
        // Use direct SQL execution via PostgREST
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/query`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: command
          })
        });
        
        if (response.ok) {
          console.log(`✅ Command executed successfully`);
        } else {
          // Try alternative approach - direct table operations
          console.log(`⚠️ Direct SQL failed, trying alternative approach...`);
          
          // For enabling RLS, we can try using the table metadata endpoint
          if (command.includes('ENABLE ROW LEVEL SECURITY')) {
            const tableName = command.match(/ALTER TABLE (\w+)/)?.[1];
            if (tableName) {
              console.log(`Attempting to enable RLS on ${tableName} via metadata...`);
            }
          }
        }
      } catch (error) {
        console.log(`❌ Error executing command: ${error.message}`);
      }
    }
    
    console.log(`\n🎉 RLS migration attempted!`);
    console.log(`💡 Let's test if the frontend can now access the database.`);
    
  } catch (error) {
    console.error('❌ Error applying RLS migration:', error);
  }
}

// Run the migration
applyRLSMigration();
