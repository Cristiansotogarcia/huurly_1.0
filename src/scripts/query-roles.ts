const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = "https://lxtkotgfsnahwncgcfnl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dGtvdGdmc25haHduY2djZm5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMjU4MjgsImV4cCI6MjA2NDYwMTgyOH0.3ukJCXs7f1HOO7y7ZgfpnSIalolB1LYbFpRtLd6ZyNE";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function queryUserRoles() {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*');
    
    if (error) {
      console.error('Error fetching user roles:', error);
      return;
    }
    
    console.log('User Roles Data:', data);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

queryUserRoles();
