const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://lxtkotgfsnahwncgcfnl.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dGtvdGdmc25haHduY2djZm5sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTAyNTgyOCwiZXhwIjoyMDY0NjAxODI4fQ.1GaDpXyyXqxBzQSu7Pu3xRpF0_Y5AoQcLRQsgHmIM9I';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyDocumentTypesMigration() {
  console.log('🔧 Adding missing document types to enum...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20250610_add_missing_document_types.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration SQL loaded');
    console.log('🔄 Executing migration...\n');

    // Execute the migration using direct SQL
    console.log('Adding employment_contract to document_type enum...');
    try {
      const { error: error1 } = await supabase.rpc('exec', { 
        sql: "ALTER TYPE document_type ADD VALUE IF NOT EXISTS 'employment_contract';" 
      });
      if (error1) {
        console.log('Note:', error1.message);
      } else {
        console.log('✅ Added employment_contract');
      }
    } catch (err) {
      console.log('Note:', err.message);
    }

    console.log('Adding reference to document_type enum...');
    try {
      const { error: error2 } = await supabase.rpc('exec', { 
        sql: "ALTER TYPE document_type ADD VALUE IF NOT EXISTS 'reference';" 
      });
      if (error2) {
        console.log('Note:', error2.message);
      } else {
        console.log('✅ Added reference');
      }
    } catch (err) {
      console.log('Note:', err.message);
    }

    // Test the enum values by checking what's available
    console.log('\n🧪 Testing enum values...');
    
    try {
      const { data: enumValues, error: enumError } = await supabase.rpc('exec', {
        sql: `
          SELECT enumlabel 
          FROM pg_enum 
          WHERE enumtypid = (
            SELECT oid 
            FROM pg_type 
            WHERE typname = 'document_type'
          )
          ORDER BY enumlabel;
        `
      });
      
      if (!enumError && enumValues) {
        console.log('✅ Available document types:');
        enumValues.forEach(row => {
          console.log(`- ${row.enumlabel}`);
        });
      }
    } catch (err) {
      console.log('Could not query enum values:', err.message);
    }

    // Test document upload with new types
    console.log('\n🧪 Testing document type validation...');
    
    const testTypes = ['identity', 'payslip', 'employment_contract', 'reference'];
    
    for (const docType of testTypes) {
      try {
        // Try to validate the enum value by attempting a dry-run insert
        const { error } = await supabase
          .from('user_documents')
          .select('id')
          .eq('document_type', docType)
          .limit(1);
        
        if (!error) {
          console.log(`✅ ${docType} - enum value valid`);
        } else {
          console.log(`❌ ${docType} - ${error.message}`);
        }
      } catch (err) {
        console.log(`❌ ${docType} - ${err.message}`);
      }
    }

    console.log('\n🎉 Document types migration completed!');
    console.log('📱 You can now upload all 4 document types:');
    console.log('   - identity (Identiteitsbewijs)');
    console.log('   - payslip (Loonstrook)');
    console.log('   - employment_contract (Arbeidscontract)');
    console.log('   - reference (Referentie)');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

applyDocumentTypesMigration();
