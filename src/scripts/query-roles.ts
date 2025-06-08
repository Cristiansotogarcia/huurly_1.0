const { createClient } = require('@supabase/supabase-js');
const { logger } = require('../lib/logger');
const dotenv = require('dotenv');

// This script requires SUPABASE_URL and SUPABASE_SERVICE_KEY in the environment.
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

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
