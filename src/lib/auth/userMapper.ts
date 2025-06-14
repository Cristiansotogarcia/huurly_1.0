
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
      // Get user role with better error handling
      logger.info('Fetching role for user:', supabaseUser.email);
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role, subscription_status')
        .eq('user_id', supabaseUser.id)
        .single();

      if (roleError) {
        logger.error('Error fetching user role:', roleError);
        // If we can't get the role, create a default one
        await this.createDefaultRole(supabaseUser.id, supabaseUser.email);
      }

      // Get profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', supabaseUser.id)
        .single();

      // Check payment status
      const hasPayment = await paymentChecker.checkPaymentStatus(supabaseUser.id);

      const firstName = profileData?.first_name || supabaseUser.user_metadata?.first_name || '';
      const lastName = profileData?.last_name || supabaseUser.user_metadata?.last_name || '';
      const name = `${firstName} ${lastName}`.trim() || supabaseUser.email?.split('@')[0] || 'User';

      // Map the role with fallback
      const dbRole = roleData?.role || roleMapper.determineRoleFromEmail(supabaseUser.email);
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

  /**
   * Create default role for user if none exists
   */
  private async createDefaultRole(userId: string, email?: string): Promise<void> {
    try {
      const role = roleMapper.determineRoleFromEmail(email);
      const dbRole = roleMapper.mapRoleToDatabase(role);
      
      logger.info('Creating default role for user:', email, 'Role:', dbRole);
      
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: dbRole,
          subscription_status: 'inactive',
        });

      if (error) {
        logger.error('Error creating default role:', error);
      }
    } catch (error) {
      logger.error('Error in createDefaultRole:', error);
    }
  }
}

export const userMapper = new UserMapper();
