import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE ||
  process.env.SUPABASE_SERVICE_API_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('Missing Supabase env. Ensure VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY) are set in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Allow overriding via CLI args: node scripts/create-test-huurder.mjs email password
const argvEmail = process.argv[2];
const argvPassword = process.argv[3];

const rand = Math.random().toString(36).slice(2, 8);
const email = argvEmail || `test.huurder+${rand}@example.com`;
const password = argvPassword || `Huurly!${Math.random().toString(36).slice(2, 6)}aA1`;
const firstName = 'Test';
const lastName = `Huurder${rand}`;

async function ensureRow(table, payload, onConflictColumns = undefined) {
  const builder = supabase.from(table).upsert(payload, onConflictColumns ? { onConflict: onConflictColumns } : undefined);
  const { error } = await builder;
  if (error) {
    // If constraint mismatch (e.g., unique), try update
    console.error(`[${table}] upsert error:`, error);
    throw error;
  }
}

async function main() {
  console.log('Creating test huurder user via service role...');
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      last_name: lastName,
      role: 'huurder'
    }
  });

  if (createErr || !created?.user) {
    console.error('Failed to create auth user:', createErr);
    process.exit(1);
  }

  const userId = created.user.id;
  console.log('Auth user created:', userId);

  // Create profile rows similar to admin flow
  // 1) gebruikers
  await ensureRow('gebruikers', {
    id: userId,
    email,
    naam: `${firstName} ${lastName}`,
    rol: 'huurder',
    profiel_compleet: false
  }, 'id');

  // 2) gebruiker_rollen (table lacks a unique constraint on user_id; handle manually)
  {
    const { data: existingRole, error: roleFetchErr } = await supabase
      .from('gebruiker_rollen')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (roleFetchErr && roleFetchErr.code !== 'PGRST116') {
      console.error('Error checking gebruiker_rollen:', roleFetchErr);
      throw roleFetchErr;
    }
    if (existingRole) {
      const { error: roleUpdateErr } = await supabase
        .from('gebruiker_rollen')
        .update({
          role: 'Huurder',
          subscription_status: 'pending'
        })
        .eq('user_id', userId);
      if (roleUpdateErr) {
        console.error('Error updating gebruiker_rollen:', roleUpdateErr);
        throw roleUpdateErr;
      }
    } else {
      const { error: roleInsertErr } = await supabase
        .from('gebruiker_rollen')
        .insert({
          user_id: userId,
          role: 'Huurder',
          subscription_status: 'pending'
        });
      if (roleInsertErr) {
        console.error('Error inserting gebruiker_rollen:', roleInsertErr);
        throw roleInsertErr;
      }
    }
  }

  // 3) huurders base row (minimal required)
  await ensureRow('huurders', {
    id: userId,
    voornaam: firstName,
    achternaam: lastName
  }, 'id');

  console.log('Seeded base rows: gebruikers, gebruiker_rollen, huurders');

  // Fetch back the rows to confirm
  const { data: tenantRow } = await supabase.from('huurders').select('*').eq('id', userId).maybeSingle();
  const { data: profileRow } = await supabase.from('gebruikers').select('*').eq('id', userId).maybeSingle();

  const result = {
    credentials: { email, password },
    userId,
    profile: profileRow,
    tenant: tenantRow
  };
  console.log('TEST_HUURDER_RESULT=' + JSON.stringify(result, null, 2));
}

main().catch((e) => {
  console.error('Unexpected error:', e);
  process.exit(1);
});
