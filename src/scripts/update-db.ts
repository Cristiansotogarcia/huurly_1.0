import { createClient } from '@supabase/supabase-js';
import type { PostgrestError } from '@supabase/supabase-js';
import { logger } from '../lib/logger';
import dotenv from 'dotenv';

// This script requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment.
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient<PostgrestError>(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Function to execute raw SQL queries
async function executeRawSQL(sql: string): Promise<{ data: any; error: PostgrestError | null }> {
  try {
    // Using supabase.rpc to execute raw SQL might not work for schema changes; consider using a direct Postgres connection if available
    const { data, error } = await supabase.rpc('sql', { query: sql });
    if (error) throw error;
    return { data, error };
  } catch (error) {
     logger.error('Error executing SQL:', error);
    throw error;
  }
}

async function main() {
  // SQL to drop the 'Manager' value from the enum
  const sql = `
  DO $$
  BEGIN
    IF EXISTS (
      SELECT 1 FROM pg_type WHERE typname = 'user_role'
        AND 'Manager' = ANY(enum_range(NULL::user_role))
    ) THEN
      ALTER TYPE public.user_role RENAME TO user_role_old;
      CREATE TYPE public.user_role AS ENUM ('Huurder', 'Verhuurder', 'Beheerder', 'Beoordelaar');
      ALTER TABLE public.user_roles
        ALTER COLUMN role TYPE public.user_role USING role::text::public.user_role;
      DROP TYPE public.user_role_old;
    END IF;
  END
  $$;
  `;

  try {
    const { error } = await executeRawSQL(sql);
    if (error) {
       logger.error('Error altering enum:', error.message);
      return;
    }
     logger.info('Enum updated successfully');
  } catch (error) {
     logger.error('Unexpected error:', error);
  }
}

main();
