import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

console.log('=== SUPABASE CONNECTION TEST ===');
console.log('URL:', process.env.VITE_SUPABASE_URL);
console.log('Key exists:', !!process.env.VITE_SUPABASE_ANON_KEY);

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

try {
  console.log('Testing connection...');
  const { data, error } = await supabase
    .from('tenant_profiles')
    .select('count', { count: 'exact', head: true });
  
  if (error) {
    console.log('ERROR:', error.message);
    console.log('CODE:', error.code);
  } else {
    console.log('SUCCESS: Connection working');
    console.log('Count:', data);
  }
} catch (err) {
  console.log('CATCH ERROR:', err.message);
}

console.log('Test completed');
