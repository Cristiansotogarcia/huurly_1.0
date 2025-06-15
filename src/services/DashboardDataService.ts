
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface DashboardData {
  profileViews: number;
  invitations: number;
  applications: number;
  acceptedApplications: number;
}

export class DashboardDataService {
  static async getTenantDashboardStats(userId: string): Promise<{ success: boolean; data?: DashboardData; error?: Error }> {
    try {
      logger.info('Fetching tenant dashboard stats for user:', userId);

      // Return mock data since analytics tables don't exist
      const stats: DashboardData = {
        profileViews: 0,
        invitations: 0,
        applications: 0,
        acceptedApplications: 0,
      };

      logger.info('Mock dashboard stats fetched successfully:', stats);
      return { success: true, data: stats };
    } catch (error) {
      logger.error('Error fetching tenant dashboard stats:', error);
      return { success: false, error: error as Error };
    }
  }

  static async updateProfileVisibility(userId: string, isVisible: boolean): Promise<{ success: boolean; error?: Error }> {
    try {
      logger.info('Updating profile visibility for user:', userId, 'to:', isVisible);

      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_looking_for_place: isVisible,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        logger.error('Database error updating profile visibility:', error);
        return { success: false, error: new Error(error.message) };
      }

      logger.info('Profile visibility updated successfully');
      return { success: true };
    } catch (error) {
      logger.error('Error updating profile visibility:', error);
      return { success: false, error: error as Error };
    }
  }

  static async getTenantProfile(userId: string): Promise<{ success: boolean; data?: any; error?: Error }> {
    try {
      logger.info('Fetching tenant profile for user:', userId);

      const { data, error } = await supabase
        .from('tenant_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        logger.error('Database error fetching tenant profile:', error);
        return { success: false, error: new Error(error.message) };
      }

      logger.info('Tenant profile fetched successfully');
      return { success: true, data };
    } catch (error) {
      logger.error('Error fetching tenant profile:', error);
      return { success: false, error: error as Error };
    }
  }

  static async getUserDocuments(userId: string): Promise<{ success: boolean; data?: any[]; error?: Error }> {
    try {
      logger.info('Fetching user documents for user:', userId);

      const { data, error } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Database error fetching user documents:', error);
        return { success: false, error: new Error(error.message) };
      }

      logger.info('User documents fetched successfully, count:', data?.length || 0);
      return { success: true, data: data || [] };
    } catch (error) {
      logger.error('Error fetching user documents:', error);
      return { success: false, error: error as Error };
    }
  }

  static async getProfile(userId: string): Promise<{ success: boolean; data?: any; error?: Error }> {
    try {
      logger.info('Fetching profile for user:', userId);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        logger.error('Database error fetching profile:', error);
        return { success: false, error: new Error(error.message) };
      }

      logger.info('Profile fetched successfully');
      return { success: true, data };
    } catch (error) {
      logger.error('Error fetching profile:', error);
      return { success: false, error: error as Error };
    }
  }
}

export const dashboardDataService = DashboardDataService;
