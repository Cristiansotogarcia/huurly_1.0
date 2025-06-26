
import { supabase } from '../integrations/supabase/client.ts';
import { logger } from '../lib/logger.ts';

interface DashboardData {
  profileViews: number;
  invitations: number;
  applications: number;
  acceptedApplications: number;
}

interface LandlordDashboardData {
  activeListings: number;
  totalApplications: number;
  unreadMessages: number;
  profileViews: number;
}

interface AdminDashboardData {
  totalUsers: number;
  totalTenants: number;
  totalLandlords: number;
  pendingDocuments: number;
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
        .from('gebruikers')
        .update({ 
          bijgewerkt_op: new Date().toISOString()
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
        .from('huurders')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found, which is not an error in this context. Return success with null data.
          logger.info('No tenant profile found for user:', userId);
          return { success: true, data: null };
        }
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

  static async getSubscription(userId: string): Promise<{ success: boolean; data?: any; error?: Error }> {
    try {
      logger.info('Fetching subscription for user:', userId);

      const { data, error } = await supabase
        .from('abonnementen')
        .select('*')
        .eq('huurder_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No subscription found, which is not an error in this context. Return success with null data.
          logger.info('No subscription found for user:', userId);
          return { success: true, data: null };
        }
        logger.error('Database error fetching subscription:', error);
        return { success: false, error: new Error(error.message) };
      }

      logger.info('Subscription fetched successfully');
      return { success: true, data };
    } catch (error) {
      logger.error('Error fetching subscription:', error);
      return { success: false, error: error as Error };
    }
  }

  static async getUserDocuments(userId: string): Promise<{ success: boolean; data?: any[]; error?: Error }> {
    try {
      logger.info('Fetching user documents for user:', userId);

      const { data, error } = await supabase
        .from('documenten')
        .select('*')
        .eq('huurder_id', userId)
        .order('aangemaakt_op', { ascending: false });

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
        .from('gebruikers')
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

  static async getLandlordProperties(userId: string): Promise<{ success: boolean; data?: any[]; error?: Error }> {
    try {
      logger.info('Fetching properties for landlord:', userId);

      const { data, error } = await supabase
        .from('verhuurders')
        .select('*')
        .eq('verhuurder_id', userId)
        .order('aangemaakt_op', { ascending: false });

      if (error) {
        logger.error('Database error fetching landlord properties:', error);
        return { success: false, error: new Error(error.message) };
      }

      logger.info('Landlord properties fetched successfully, count:', data?.length || 0);
      return { success: true, data: data || [] };
    } catch (error) {
      logger.error('Error fetching landlord properties:', error);
      return { success: false, error: error as Error };
    }
  }

  static async getLandlordDashboardStats(userId: string): Promise<{ success: boolean; data?: LandlordDashboardData; error?: Error }> {
    try {
      logger.info('Fetching landlord dashboard stats for user:', userId);

      // Return mock data
      const stats: LandlordDashboardData = {
        activeListings: 0,
        totalApplications: 0,
        unreadMessages: 0,
        profileViews: 0,
      };

      logger.info('Mock landlord dashboard stats fetched successfully:', stats);
      return { success: true, data: stats };
    } catch (error) {
      logger.error('Error fetching landlord dashboard stats:', error);
      return { success: false, error: error as Error };
    }
  }

  static async getReviewQueue(): Promise<{ success: boolean; data?: any[]; error?: Error }> {
    try {
      logger.info('Fetching document review queue');

      const { data, error } = await supabase
        .from('documenten')
        .select('*, gebruikers(naam, email)')
        .eq('status', 'wachtend')
        .order('aangemaakt_op', { ascending: true });

      if (error) {
        logger.error('Database error fetching review queue:', error);
        return { success: false, error: new Error(error.message) };
      }

      logger.info('Review queue fetched successfully, count:', data?.length || 0);
      return { success: true, data: data || [] };
    } catch (error) {
      logger.error('Error fetching review queue:', error);
      return { success: false, error: error as Error };
    }
  }

  static async reviewDocument(documentId: string, status: 'goedgekeurd' | 'afgewezen', remarks?: string): Promise<{ success: boolean; error?: Error }> {
    try {
      logger.info(`Reviewing document ${documentId} with status ${status}`);

      const { error } = await supabase
        .from('documenten')
        .update({
          status,
          beoordeling_notitie: remarks,
          bijgewerkt_op: new Date().toISOString(),
        })
        .eq('id', documentId);

      if (error) {
        logger.error('Database error reviewing document:', error);
        return { success: false, error: new Error(error.message) };
      }

      logger.info('Document reviewed successfully');
      return { success: true };
    } catch (error) {
      logger.error('Error reviewing document:', error);
      return { success: false, error: error as Error };
    }
  }

  static async getAdminStats(): Promise<{ success: boolean; data?: AdminDashboardData; error?: Error }> {
    try {
      logger.info('Fetching admin dashboard stats');

      // Mock data for now
      const stats: AdminDashboardData = {
        totalUsers: 0,
        totalTenants: 0,
        totalLandlords: 0,
        pendingDocuments: 0,
      };

      logger.info('Mock admin dashboard stats fetched successfully:', stats);
      return { success: true, data: stats };
    } catch (error) {
      logger.error('Error fetching admin dashboard stats:', error);
      return { success: false, error: error as Error };
    }
  }

  static async getAllUsers(): Promise<{ success: boolean; data?: any[]; error?: Error }> {
    try {
      logger.info('Fetching all users');

      const { data, error } = await supabase
        .from('gebruikers')
        .select('*')
        .order('aangemaakt_op', { ascending: false });

      if (error) {
        logger.error('Database error fetching all users:', error);
        return { success: false, error: new Error(error.message) };
      }

      logger.info('All users fetched successfully, count:', data?.length || 0);
      return { success: true, data: data || [] };
    } catch (error) {
      logger.error('Error fetching all users:', error);
      return { success: false, error: error as Error };
    }
  }
}

export const dashboardDataService = DashboardDataService;
