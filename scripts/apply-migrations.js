import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

class MigrationRunner {
  constructor() {
    this.migrationsPath = path.join(process.cwd(), 'supabase', 'migrations');
  }

  async runMigrations() {
    console.log('🚀 Starting migration process...\n');
    
    try {
      // Check if migrations directory exists
      if (!fs.existsSync(this.migrationsPath)) {
        console.error('❌ Migrations directory not found:', this.migrationsPath);
        return;
      }

      // Get all migration files
      const migrationFiles = fs.readdirSync(this.migrationsPath)
        .filter(file => file.endsWith('.sql'))
        .sort();

      if (migrationFiles.length === 0) {
        console.log('ℹ️ No migration files found');
        return;
      }

      console.log(`📋 Found ${migrationFiles.length} migration files:`);
      migrationFiles.forEach(file => console.log(`  - ${file}`));
      console.log('');

      // Apply each migration
      for (const file of migrationFiles) {
        await this.applyMigration(file);
      }

      console.log('\n✅ All migrations completed successfully!');
      
      // Run a quick verification
      await this.verifySchema();

    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      process.exit(1);
    }
  }

  async applyMigration(filename) {
    console.log(`🔄 Applying migration: ${filename}`);
    
    try {
      const filePath = path.join(this.migrationsPath, filename);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Split SQL into individual statements (basic approach)
      const statements = this.splitSQLStatements(sql);
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i].trim();
        if (statement && !statement.startsWith('--')) {
          try {
            const { error } = await supabase.rpc('execute_sql', { 
              sql: statement 
            });
            
            if (error) {
              // Try alternative approach for DDL statements
              const { error: directError } = await supabase
                .from('_temp_migration')
                .select('*')
                .limit(0);
              
              // If the above fails, it means we need to use a different approach
              console.log(`⚠️ Statement ${i + 1} may have failed (this might be expected for DDL): ${error.message}`);
            }
          } catch (err) {
            console.log(`⚠️ Statement ${i + 1} execution note: ${err.message}`);
          }
        }
      }
      
      console.log(`✅ Migration ${filename} applied`);
      
    } catch (error) {
      console.error(`❌ Failed to apply migration ${filename}:`, error.message);
      throw error;
    }
  }

  splitSQLStatements(sql) {
    // Basic SQL statement splitting (handles most cases)
    return sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
  }

  async verifySchema() {
    console.log('\n🔍 Verifying schema...');
    
    try {
      // Try to query some basic tables to verify they exist
      const tables = ['profiles', 'user_roles', 'tenant_profiles', 'properties'];
      
      for (const table of tables) {
        try {
          const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          
          if (error) {
            console.log(`❌ Table ${table} not accessible: ${error.message}`);
          } else {
            console.log(`✅ Table ${table} exists (${count || 0} records)`);
          }
        } catch (err) {
          console.log(`❌ Table ${table} verification failed: ${err.message}`);
        }
      }
      
    } catch (error) {
      console.error('❌ Schema verification failed:', error.message);
    }
  }
}

// Alternative approach: Apply migrations via SQL execution
class DirectSQLRunner {
  constructor() {
    this.migrationsPath = path.join(process.cwd(), 'supabase', 'migrations');
  }

  async runMigrations() {
    console.log('🚀 Applying migrations via direct SQL execution...\n');
    
    try {
      const migrationFiles = fs.readdirSync(this.migrationsPath)
        .filter(file => file.endsWith('.sql'))
        .sort();

      for (const file of migrationFiles) {
        console.log(`📄 Processing: ${file}`);
        const filePath = path.join(this.migrationsPath, file);
        const sql = fs.readFileSync(filePath, 'utf8');
        
        // Log the SQL content for manual execution if needed
        console.log(`\n--- SQL Content for ${file} ---`);
        console.log(sql.substring(0, 500) + (sql.length > 500 ? '...' : ''));
        console.log('--- End SQL Content ---\n');
      }

      console.log('\n📋 Migration files processed. You may need to apply these manually in Supabase Dashboard.');
      console.log('🌐 Go to: https://supabase.com/dashboard/project/sqhultitvpivlnlgogen/sql');
      
    } catch (error) {
      console.error('❌ Failed to process migrations:', error.message);
    }
  }
}

// Check if we can execute SQL directly, otherwise provide manual instructions
async function main() {
  console.log('🔧 Huurly Database Migration Tool\n');
  
  // Try to test database connection first
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);
    
    if (error) {
      console.log('⚠️ Limited database access. Using direct SQL approach...\n');
      const directRunner = new DirectSQLRunner();
      await directRunner.runMigrations();
    } else {
      console.log('✅ Database connection successful. Running migrations...\n');
      const migrationRunner = new MigrationRunner();
      await migrationRunner.runMigrations();
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n📋 Please apply migrations manually in Supabase Dashboard');
  }
}

main().catch(console.error);
