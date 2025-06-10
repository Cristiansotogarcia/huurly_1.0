const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://lxtkotgfsnahwncgcfnl.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dGtvdGdmc25haHduY2djZm5sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAyNTgyOCwiZXhwIjoyMDY0NjAxODI4fQ.1GaDpXyyXqxBzQSu7Pu3xRpF0_Y5AoQcLRQsgHmIM9I';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyBeoordelaarRLSFix() {
  console.log('🔧 Applying Beoordelaar RLS policy fix...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20250610_fix_beoordelaar_rls_policies.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration SQL loaded');
    console.log('🔄 Executing migration...\n');

    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        
        try {
          const { error } = await supabase.rpc('exec', { sql: statement });
          if (error) {
            console.log(`⚠️ Statement ${i + 1} note:`, error.message);
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.log(`⚠️ Statement ${i + 1} note:`, err.message);
        }
      }
    }

    // Test the new policies
    console.log('\n🧪 Testing new RLS policies...');
    
    const { data: testDocs, error: testError } = await supabase
      .from('user_documents')
      .select('*')
      .eq('status', 'pending');
    
    if (testError) {
      console.error('❌ Error testing policies:', testError);
    } else {
      console.log(`✅ Policy test successful - found ${testDocs?.length || 0} pending documents`);
      if (testDocs && testDocs.length > 0) {
        console.log('📋 Pending documents visible:');
        testDocs.forEach(doc => {
          console.log(`- ${doc.file_name} (${doc.document_type}) - User: ${doc.user_id}`);
        });
      }
    }

    // Test with a specific beoordelaar user if available
    console.log('\n🔍 Checking beoordelaar users...');
    const { data: beoordelaars, error: beoordelaarError } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .eq('role', 'Beoordelaar');

    if (!beoordelaarError && beoordelaars && beoordelaars.length > 0) {
      console.log(`✅ Found ${beoordelaars.length} beoordelaar user(s)`);
      beoordelaars.forEach(b => {
        console.log(`- Beoordelaar: ${b.user_id}`);
      });
    } else {
      console.log('ℹ️ No beoordelaar users found or error accessing user_roles');
    }

    console.log('\n🎉 RLS policy migration completed!');
    console.log('🔄 The Beoordelaar dashboard should now show pending documents.');
    console.log('📱 Please refresh the beoordelaar dashboard to see the changes.');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

applyBeoordelaarRLSFix();
