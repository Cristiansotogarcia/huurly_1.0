// This file initializes the Supabase client for use in the frontend.
// DO NOT expose the service key or use this client in backend-only logic.

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

// Load env variables (must be defined in .env)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Throw error if missing (so it's not silently insecure)
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables')
}

// Export typed Supabase client
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
