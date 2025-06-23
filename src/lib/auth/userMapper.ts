
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { roleMapper } from './roleMapper';
import { paymentChecker } from './paymentChecker';

class UserMapper {
  /**
   * Map Supabase user to our User type
   */
  async mapSupabaseUserToUser(supabaseUser: SupabaseUser): Promise<User> {
    try {
      // Get profile data
      const { data: profileData } = await supabase
        .from('gebruikers')
        .select('naam, rol')
        .eq('id', supabaseUser.id)
        .single();

      // Check payment status
      const hasPayment = await paymentChecker.checkPaymentStatus(supabaseUser.id);

      const name = profileData?.naam || `${supabaseUser.user_metadata?.first_name || ''} ${supabaseUser.user_metadata?.last_name || ''}`.trim() || supabaseUser.email?.split('@')[0] || 'User';

      // Map the role with fallback - use rol from profile or determine from email
      const dbRole = profileData?.rol || roleMapper.determineRoleFromEmail(supabaseUser.email);
      const mappedRole = roleMapper.mapRoleFromDatabase(dbRole, supabaseUser.email);

      logger.info('Auth mapping - Email:', supabaseUser.email, 'DB Role:', dbRole, 'Mapped Role:', mappedRole);

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
