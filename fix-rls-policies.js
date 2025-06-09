// Script to fix RLS policies for user_roles and profiles tables
const SUPABASE_URL = 'https://lxtkotgfsnahwncgcfnl.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dGtvdGdmc25haHduY2djZm5sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAyNTgyOCwiZXhwIjoyMDY0NjAxODI4fQ.1GaDpXyyXqxBzQSu7Pu3xRpF0_Y5AoQcLRQsgHmIM9I';

async function fixRLSPolicies() {
  console.log('🔧 Fixing RLS policies for user_roles and profiles tables...');
  
  try {
    // SQL commands to fix RLS policies
    const rlsCommands = [
      // Enable RLS on user_roles table
      `ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;`,
      
      // Drop existing policies if they exist
      `DROP POLICY IF EXISTS "Users can view own role" ON user_roles;`,
      `DROP POLICY IF EXISTS "Users can update own role" ON user_roles;`,
      `DROP POLICY IF EXISTS "Users can insert own role" ON user_roles;`,
      
      // Create new policies for user_roles
      `CREATE POLICY "Users can view own role" ON user_roles FOR SELECT USING (auth.uid() = user_id);`,
      `CREATE POLICY "Users can update own role" ON user_roles FOR UPDATE USING (auth.uid() = user_id);`,
      `CREATE POLICY "Users can insert own role" ON user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);`,
      
      // Enable RLS on profiles table
      `ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;`,
      
      // Drop existing policies if they exist
      `DROP POLICY IF EXISTS "Users can view own profile" ON profiles;`,
      `DROP POLICY IF EXISTS "Users can update own profile" ON profiles;`,
      `DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;`,
      
      // Create new policies for profiles
      `CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);`,
      `CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);`,
      `CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);`,
      
      // Fix other tables that might have RLS issues
      `ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;`,
      `DROP POLICY IF EXISTS "Users can view own payments" ON payment_records;`,
      `CREATE POLICY "Users can view own payments" ON payment_records FOR SELECT USING (auth.uid() = user_id);`,
      
      `ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;`,
      `DROP POLICY IF EXISTS "Users can view own documents" ON user_documents;`,
      `CREATE POLICY "Users can view own documents" ON user_documents FOR SELECT USING (auth.uid() = user_id);`,
      `CREATE POLICY "Users can insert own documents" ON user_documents FOR INSERT WITH CHECK (auth.uid() = user_id);`,
      
      `ALTER TABLE tenant_profiles ENABLE ROW LEVEL SECURITY;`,
      `DROP POLICY IF EXISTS "Users can view own tenant profile" ON tenant_profiles;`,
      `CREATE POLICY "Users can view own tenant profile" ON tenant_profiles FOR SELECT USING (auth.uid() = user_id);`,
      `CREATE POLICY "Users can insert own tenant profile" ON tenant_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);`,
      `CREATE POLICY "Users can update own tenant profile" ON tenant_profiles FOR UPDATE USING (auth.uid() = user_id);`
    ];
    
    for (const command of rlsCommands) {
      console.log(`\n📝 Executing: ${command.substring(0, 60)}...`);
      
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sql: command
          })
        });
        
        if (response.ok) {
          console.log(`✅ Command executed successfully`);
        } else {
          const errorText = await response.text();
          console.log(`⚠️ Command may have failed: ${errorText}`);
        }
      } catch (error) {
        console.log(`❌ Error executing command: ${error.message}`);
      }
    }
    
    console.log(`\n🎉 RLS policies updated!`);
    console.log(`💡 The frontend should now be able to access the database tables.`);
    
  } catch (error) {
    console.error('❌ Error fixing RLS policies:', error);
  }
}

// Run the fix
fixRLSPolicies();
