import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

// Use the same variable names as our environment variables to avoid confusion
const SUPABASE_URL = import.meta.env.SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.SUPABASE_ANON_KEY as string

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
