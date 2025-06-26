import 'tsconfig-paths/register.js';
import { strict as assert } from 'node:assert';
import { userMapper } from '../src/lib/auth/userMapper.ts';
import { supabase } from '../src/integrations/supabase/client.ts';

// Mock supabase "from" chain to return role data without hitting network
const originalFrom = supabase.from.bind(supabase);

// Simple supabase.from stub
supabase.from = function(table: string) {
  assert.equal(table, 'gebruikers');
  return {
    select() { return this; },
    eq() { return this; },
    single() {
      return Promise.resolve({ data: { naam: 'Test', rol: 'huurder', abonnementen: { status: 'actief' } } });
    }
  } as any;
};

const supabaseUser = {
  id: '123',
  email: 'test@example.com',
  user_metadata: {},
  email_confirmed_at: 'now',
  created_at: 'now'
} as any;

(async () => {
  const user = await userMapper.mapSupabaseUserToUser(supabaseUser);
  assert.equal(user.role, 'huurder');
  assert.equal(user.hasPayment, true);
  console.log('userMapper tests passed');
})();

// Restore original
supabase.from = originalFrom;
