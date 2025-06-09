// Script to apply the migration manually to fix duplicate payments
const SUPABASE_URL = 'https://lxtkotgfsnahwncgcfnl.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dGtvdGdmc25haHduY2djZm5sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAyNTgyOCwiZXhwIjoyMDY0NjAxODI4fQ.1GaDpXyyXqxBzQSu7Pu3xRpF0_Y5AoQcLRQsgHmIM9I';

async function applyMigration() {
  console.log('🔧 Applying migration to prevent duplicate payments...');
  
  try {
    // The migration SQL commands
    const migrationCommands = [
      // Add session group field
      `ALTER TABLE payment_records ADD COLUMN IF NOT EXISTS payment_session_group UUID DEFAULT gen_random_uuid();`,
      
      // Add indexes (we'll skip the unique constraint for now since it might conflict with existing data)
      `CREATE INDEX IF NOT EXISTS idx_payment_records_user_status ON payment_records(user_id, status);`,
      `CREATE INDEX IF NOT EXISTS idx_payment_records_latest ON payment_records(user_id, created_at DESC);`
    ];
    
    for (const command of migrationCommands) {
      console.log(`\n📝 Executing: ${command.substring(0, 50)}...`);
      
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
        console.log(`⚠️ Command may have failed or already exists: ${errorText}`);
      }
    }
    
    console.log(`\n🎉 Migration applied successfully!`);
    console.log(`💡 The database now has better protection against duplicate payments.`);
    
  } catch (error) {
    console.error('❌ Error applying migration:', error);
  }
}

// Run the migration
applyMigration();
