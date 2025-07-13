
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
      logger.info('Mapping user with JWT claims:', supabaseUser.id);
      
      // First try to get role from JWT app_metadata (from custom access token hook)
      let mappedRole = supabaseUser.app_metadata?.primary_role;
      let hasPayment = false;
      
      // Check subscription status from JWT claims first
      const subscriptionStatus = supabaseUser.app_metadata?.subscription_status;
      if (subscriptionStatus === 'actief') {
        hasPayment = true;
      }
      
      // If no role in JWT claims, fallback to database query
      if (!mappedRole) {
        logger.info('No role in JWT claims, falling back to database query');
        
        // Get profile data - use maybeSingle to handle missing data gracefully
        const { data: profileData, error: profileError } = await supabase
          .from('gebruikers')
          .select('naam, rol')
          .eq('id', supabaseUser.id)
          .maybeSingle();

        if (profileError) {
          logger.warn('Error fetching profile data:', profileError);
        }

        // Check for active subscription if not in JWT claims
        if (!hasPayment) {
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
        }

        // Map the role with fallback - use rol from profile or determine from email
        const dbRole = profileData?.rol || roleMapper.determineRoleFromEmail(supabaseUser.email);
        mappedRole = roleMapper.mapRoleFromDatabase(dbRole, supabaseUser.email);
      }

      // Get name from profile or user metadata
      let name = `${supabaseUser.user_metadata?.first_name || ''} ${supabaseUser.user_metadata?.last_name || ''}`.trim();
      
      // If no name in user_metadata, try to get from database
      if (!name) {
        try {
          const { data: profileData } = await supabase
            .from('gebruikers')
            .select('naam')
            .eq('id', supabaseUser.id)
            .maybeSingle();
          
          name = profileData?.naam || supabaseUser.email?.split('@')[0] || 'User';
        } catch {
          name = supabaseUser.email?.split('@')[0] || 'User';
        }
      }

      logger.info('Auth mapping - Email:', supabaseUser.email?.substring(0, 5) + '***', 'Role:', mappedRole);

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
