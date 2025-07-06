
import { supabase } from '../../integrations/supabase/client.ts';
import { User } from '../../types/index.ts';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { logger } from '../logger.ts';
import { roleMapper } from './roleMapper.ts';

class UserMapper {
  /**
   * Map Supabase user to our User type
   */
  async mapSupabaseUserToUser(supabaseUser: SupabaseUser): Promise<User> {
    try {
      logger.info('Mapping database role:', supabaseUser.id);
      
      // Get profile data - use maybeSingle to handle missing data gracefully
      const { data: profileData, error: profileError } = await supabase
        .from('gebruikers')
        .select('naam, rol')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      if (profileError) {
        logger.warn('Error fetching profile data:', profileError);
      }

      // Check for active subscription - use separate query to avoid join errors
      let hasPayment = false;
      try {
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('abonnementen')
          .select('status')
          .eq('huurder_id', supabaseUser.id)
          .eq('status', 'actief')
          .limit(1);

        if (subscriptionError) {
          logger.warn('Error checking subscription:', subscriptionError);
        }

        hasPayment = subscriptionData && subscriptionData.length > 0;
      } catch (error) {
        logger.warn('Could not check subscription status:', error);
        hasPayment = false;
      }

      const name = profileData?.naam || `${supabaseUser.user_metadata?.first_name || ''} ${supabaseUser.user_metadata?.last_name || ''}`.trim() || supabaseUser.email?.split('@')[0] || 'User';

      // Map the role with fallback - use rol from profile or determine from email
      const dbRole = profileData?.rol || roleMapper.determineRoleFromEmail(supabaseUser.email);
      const mappedRole = roleMapper.mapRoleFromDatabase(dbRole, supabaseUser.email);

      logger.info('Auth mapping - Email:', supabaseUser.email?.substring(0, 5) + '***');

      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        role: mappedRole,
        name,
        avatar: supabaseUser.user_metadata?.avatar_url,
        isActive: supabaseUser.email_confirmed_at !== null,
        createdAt: supabaseUser.created_at,
        hasPayment,
      };
    } catch (error) {
      logger.error('Error mapping user:', error);
      // Fallback mapping in case of any errors
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        role: roleMapper.determineRoleFromEmail(supabaseUser.email),
        name: supabaseUser.email?.split('@')[0] || 'User',
        avatar: supabaseUser.user_metadata?.avatar_url,
        isActive: supabaseUser.email_confirmed_at !== null,
        createdAt: supabaseUser.created_at,
        hasPayment: false,
      };
    }
  }
}

export const userMapper = new UserMapper();
