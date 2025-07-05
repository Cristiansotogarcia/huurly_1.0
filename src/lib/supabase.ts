import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

import { getEnvVar } from './env'

// Resolve Supabase credentials from environment with Vite fallback
const SUPABASE_URL =
  (getEnvVar('VITE_SUPABASE_URL') || getEnvVar('SUPABASE_URL')) as string
const SUPABASE_ANON_KEY =
  (getEnvVar('VITE_SUPABASE_ANON_KEY') || getEnvVar('SUPABASE_ANON_KEY')) as string

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
