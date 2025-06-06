import { createClient } from '@supabase/supabase-js';
import type { PostgrestError } from '@supabase/supabase-js';

const SUPABASE_URL = "https://lxtkotgfsnahwncgcfnl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dGtvdGdmc25haHduY2djZm5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMjU4MjgsImV4cCI6MjA2NDYwMTgyOH0.3ukJCXs7f1HOO7y7ZgfpnSIalolB1LYbFpRtLd6ZyNE";

const supabase = createClient<PostgrestError>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Function to execute raw SQL queries
async function executeRawSQL(sql: string): Promise<{ data: any; error: PostgrestError | null }> {
  try {
    // Using supabase.rpc to execute raw SQL might not work for schema changes; consider using a direct Postgres connection if available
    const { data, error } = await supabase.rpc('sql', { query: sql });
    if (error) throw error;
    return { data, error };
  } catch (error) {
    console.error('Error executing SQL:', error);
    throw error;
  }
}

async function main() {
  // SQL to alter the enum in the database
  const sql = `
  ALTER TYPE public.user_role ADD VALUES ('Beoordelaar', 'Beheerder');
  `;

  try {
    const { error } = await executeRawSQL(sql);
    if (error) {
      console.error('Error altering enum:', error.message);
      return;
    }
    console.log('Enum updated successfully');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

main();
