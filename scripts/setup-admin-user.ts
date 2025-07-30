import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://sqhultitvpivlnlgogen.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupAdminUser(email: string) {
  try {
    
    // First, check if user exists in auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching auth users:', authError);
      return;
    }
    
    const authUser = authUsers.users.find(user => user.email === email);
    
    if (!authUser) {
      console.error(`No authenticated user found with email: ${email}`);
      authUsers.users.forEach(user => {
      });
      return;
    }
    
    
    // Check if user exists in gebruikers table
    const { data: existingUser, error: fetchError } = await supabase
      .from('gebruikers')
      .select('*')
      .eq('id', authUser.id)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking existing user:', fetchError);
      return;
    }
    
    if (existingUser) {
      // User exists, update their role to admin
      const { error: updateError } = await supabase
        .from('gebruikers')
        .update({ 
          rol: 'admin',
          bijgewerkt_op: new Date().toISOString()
        })
        .eq('id', authUser.id);
      
      if (updateError) {
        console.error('Error updating user role:', updateError);
        return;
      }
      
    } else {
      // User doesn't exist in gebruikers table, create them as admin
      const { error: insertError } = await supabase
        .from('gebruikers')
        .insert({
          id: authUser.id,
          email: authUser.email!,
          naam: authUser.user_metadata?.first_name 
            ? `${authUser.user_metadata.first_name} ${authUser.user_metadata.last_name || ''}`.trim()
            : authUser.email!.split('@')[0],
          rol: 'admin',
          profiel_compleet: true
        });
      
      if (insertError) {
        console.error('Error creating admin user:', insertError);
        return;
      }
      
    }
    
    // Verify the change
    const { data: updatedUser, error: verifyError } = await supabase
      .from('gebruikers')
      .select('*')
      .eq('id', authUser.id)
      .single();
    
    if (verifyError) {
      console.error('Error verifying user update:', verifyError);
      return;
    }
    
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Get email from command line argument
const targetEmail = process.argv[2];

if (!targetEmail) {
  console.error('Please provide an email address as a command-line argument.');
  process.exit(1);
}


setupAdminUser(targetEmail)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
