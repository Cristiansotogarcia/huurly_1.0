import { createClient } from '@supabase/supabase-js';
import { logger } from '../lib/logger';
import dotenv from 'dotenv';

// This script requires SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in the environment.
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function queryUserRoles() {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*');
    
    if (error) {
       logger.error('Error fetching user roles:', error);
      return;
    }
    
     logger.info('User Roles Data:', data);
  } catch (error) {
     logger.error('An error occurred:', error);
  }
}

queryUserRoles();
