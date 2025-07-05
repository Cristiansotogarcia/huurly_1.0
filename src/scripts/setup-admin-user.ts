/**
 * Admin User Setup Script
 * 
 * This script should be run after the admin user "Cristiansotogarcia@gmail.com" 
 * has signed up through the normal registration flow.
 * 
 * It will update their role to 'admin' in the database.
 */

import { supabase } from '../integrations/supabase/client';

const ADMIN_EMAIL = 'Cristiansotogarcia@gmail.com';

export async function setupAdminUser(): Promise<void> {
  try {
    console.log('Setting up admin user...');
    
    // Update the user's role to admin
    const { data, error } = await supabase
      .from('gebruikers')
      .update({ 
        rol: 'admin',
        profiel_compleet: true 
      })
      .eq('email', ADMIN_EMAIL)
      .select();

    if (error) {
      console.error('Error updating admin user:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log(`User ${ADMIN_EMAIL} not found. Please ensure they have signed up first.`);
      return;
    }

    console.log('Admin user setup completed successfully:', data[0]);
  } catch (error) {
    console.error('Failed to setup admin user:', error);
    throw error;
  }
}

// Uncomment the following line to run this script directly
// setupAdminUser().catch(console.error);