import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface DashboardStats {
  profileViews: number;
  invitations: number;
  applications: number;
  acceptedApplications: number;
}

export interface VerhuurderStats {
  totalProperties: number;
  activeProperties: number;
  totalTenants: number;
  pendingApplications: number;
  monthlyRevenue: number;
}

export interface BeoordelaarStats {
  pendingDocuments: number;
  reviewedToday: number;
  totalReviewed: number;
  averageReviewTime: number;
}

export interface BeheerderStats {
  totalUsers: number;
  activeUsers: number;
  totalProperties: number;
  totalRevenue: number;
  systemHealth: 'good' | 'warning' | 'critical';
}

export class DashboardService {
  /**
   * Get dashboard statistics for huurder (tenant)
   */
  static async getHuurderStats(userId: string): Promise<{ success: boolean; data?: DashboardStats; error?: any }> {
    try {
      logger.info('Fetching huurder stats for user:', userId);

      // Get profile views from tenant_profiles table
      const { data: tenantProfile, error: profileError } = await supabase
        .from('tenant_profiles')
        .select('profile_views')
        .eq('user_id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        logger.error('Error fetching tenant profile:', profileError);
      }

      // Get invitations count from property_applications
      const { data: invitations, error: invitationsError } = await supabase
        .from('property_applications')
        .select('id')
        .eq('tenant_id', userId)
        .eq('status', 'invited');

      if (invitationsError) {
        logger.error('Error fetching invitations:', invitationsError);
      }

      // Get total applications count
      const { data: applications, error: applicationsError } = await supabase
        .from('property_applications')
        .select('id')
        .eq('tenant_id', userId);

      if (applicationsError) {
        logger.error('Error fetching applications:', applicationsError);
      }

      // Get accepted applications count
      const { data: acceptedApplications, error: acceptedError } = await supabase
        .from('property_applications')
        .select('id')
        .eq('tenant_id', userId)
        .eq('status', 'accepted');

      if (acceptedError) {
        logger.error('Error fetching accepted applications:', acceptedError);
      }

      const stats: DashboardStats = {
        profileViews: tenantProfile?.profile_views || 0,
        invitations: invitations?.length || 0,
        applications: applications?.length || 0,
        acceptedApplications: acceptedApplications?.length || 0
      };

      logger.info('Huurder stats fetched successfully:', stats);
      return { success: true, data: stats };

    } catch (error) {
      logger.error('Error in getHuurderStats:', error);
      return { success: false, error };
    }
  }

  /**
   * Get dashboard statistics for verhuurder (landlord)
   */
  static async getVerhuurderStats(userId: string): Promise<{ success: boolean; data?: VerhuurderStats; error?: any }> {
    try {
      logger.info('Fetching verhuurder stats for user:', userId);

      // Get total properties
      const { data: totalProperties, error: propertiesError } = await supabase
        .from('properties')
        .select('id')
        .eq('landlord_id', userId);

      if (propertiesError) {
        logger.error('Error fetching total properties:', propertiesError);
      }

      // Get active properties (available for rent)
      const { data: activeProperties, error: activeError } = await supabase
        .from('properties')
        .select('id')
        .eq('landlord_id', userId)
        .eq('status', 'available');

      if (activeError) {
        logger.error('Error fetching active properties:', activeError);
      }

      // Get total tenants (rented properties)
      const { data: totalTenants, error: tenantsError } = await supabase
        .from('properties')
        .select('id')
        .eq('landlord_id', userId)
        .eq('status', 'rented');

      if (tenantsError) {
        logger.error('Error fetching total tenants:', tenantsError);
      }

      // Get pending applications
      const { data: pendingApplications, error: pendingError } = await supabase
        .from('property_applications')
        .select('id')
        .eq('landlord_id', userId)
        .eq('status', 'pending');

      if (pendingError) {
        logger.error('Error fetching pending applications:', pendingError);
      }

      // Calculate monthly revenue (simplified - would need more complex logic in real app)
      const { data: rentedProperties, error: rentError } = await supabase
        .from('properties')
        .select('rent_amount')
        .eq('landlord_id', userId)
        .eq('status', 'rented');

      if (rentError) {
        logger.error('Error fetching rented properties for revenue:', rentError);
      }

      const monthlyRevenue = rentedProperties?.reduce((total, property) => {
        return total + (property.rent_amount || 0);
      }, 0) || 0;

      const stats: VerhuurderStats = {
        totalProperties: totalProperties?.length || 0,
        activeProperties: activeProperties?.length || 0,
        totalTenants: totalTenants?.length || 0,
        pendingApplications: pendingApplications?.length || 0,
        monthlyRevenue
      };

      logger.info('Verhuurder stats fetched successfully:', stats);
      return { success: true, data: stats };

    } catch (error) {
      logger.error('Error in getVerhuurderStats:', error);
      return { success: false, error };
    }
  }

  /**
   * Get dashboard statistics for beoordelaar (reviewer)
   */
  static async getBeoordelaarStats(userId: string): Promise<{ success: boolean; data?: BeoordelaarStats; error?: any }> {
    try {
      logger.info('Fetching beoordelaar stats for user:', userId);

      // Get pending documents
      const { data: pendingDocuments, error: pendingError } = await supabase
        .from('user_documents')
        .select('id')
        .eq('status', 'pending');

      if (pendingError) {
        logger.error('Error fetching pending documents:', pendingError);
      }

      // Get documents reviewed today
      const today = new Date().toISOString().split('T')[0];
      const { data: reviewedToday, error: todayError } = await supabase
        .from('user_documents')
        .select('id')
        .eq('reviewed_by', userId)
        .gte('reviewed_at', `${today}T00:00:00.000Z`)
        .lt('reviewed_at', `${today}T23:59:59.999Z`);

      if (todayError) {
        logger.error('Error fetching documents reviewed today:', todayError);
      }

      // Get total reviewed documents
      const { data: totalReviewed, error: totalError } = await supabase
        .from('user_documents')
        .select('id')
        .eq('reviewed_by', userId)
        .not('status', 'eq', 'pending');

      if (totalError) {
        logger.error('Error fetching total reviewed documents:', totalError);
      }

      // Calculate average review time (simplified)
      const averageReviewTime = 2.5; // hours - would calculate from actual data

      const stats: BeoordelaarStats = {
        pendingDocuments: pendingDocuments?.length || 0,
        reviewedToday: reviewedToday?.length || 0,
        totalReviewed: totalReviewed?.length || 0,
        averageReviewTime
      };

      logger.info('Beoordelaar stats fetched successfully:', stats);
      return { success: true, data: stats };

    } catch (error) {
      logger.error('Error in getBeoordelaarStats:', error);
      return { success: false, error };
    }
  }

  /**
   * Get dashboard statistics for beheerder (admin)
   */
  static async getBeheerderStats(): Promise<{ success: boolean; data?: BeheerderStats; error?: any }> {
    try {
      logger.info('Fetching beheerder stats');

      // Get total users
      const { data: totalUsers, error: usersError } = await supabase
        .from('user_roles')
        .select('user_id');

      if (usersError) {
        logger.error('Error fetching total users:', usersError);
      }

      // Get active users (logged in within last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: activeUsers, error: activeError } = await supabase
        .from('user_roles')
        .select('user_id')
        .gte('updated_at', thirtyDaysAgo.toISOString());

      if (activeError) {
        logger.error('Error fetching active users:', activeError);
      }

      // Get total properties
      const { data: totalProperties, error: propertiesError } = await supabase
        .from('properties')
        .select('id');

      if (propertiesError) {
        logger.error('Error fetching total properties:', propertiesError);
      }

      // Calculate total revenue (simplified)
      const { data: payments, error: paymentsError } = await supabase
        .from('payment_records')
        .select('amount')
        .eq('status', 'completed');

      if (paymentsError) {
        logger.error('Error fetching payments:', paymentsError);
      }

      const totalRevenue = payments?.reduce((total, payment) => {
        return total + (payment.amount || 0);
      }, 0) || 0;

      // System health check (simplified)
      const systemHealth: 'good' | 'warning' | 'critical' = 'good';

      const stats: BeheerderStats = {
        totalUsers: totalUsers?.length || 0,
        activeUsers: activeUsers?.length || 0,
        totalProperties: totalProperties?.length || 0,
        totalRevenue,
        systemHealth
      };

      logger.info('Beheerder stats fetched successfully:', stats);
      return { success: true, data: stats };

    } catch (error) {
      logger.error('Error in getBeheerderStats:', error);
      return { success: false, error };
    }
  }

  /**
   * Get recent activity for any user role
   */
  static async getRecentActivity(userId: string, role: string, limit: number = 10): Promise<{ success: boolean; data?: any[]; error?: any }> {
    try {
      logger.info('Fetching recent activity for user:', userId, 'role:', role);

      let query;
      
      switch (role) {
        case 'huurder':
          query = supabase
            .from('property_applications')
            .select(`
              id,
              status,
              created_at,
              properties (
                title,
                address
              )
            `)
            .eq('tenant_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);
          break;

        case 'verhuurder':
          query = supabase
            .from('property_applications')
            .select(`
              id,
              status,
              created_at,
              properties (
                title,
                address
              ),
              user_profiles (
                first_name,
                last_name
              )
            `)
            .eq('landlord_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);
          break;

        case 'beoordelaar':
          query = supabase
            .from('user_documents')
            .select(`
              id,
              document_type,
              status,
              reviewed_at,
              user_profiles (
                first_name,
                last_name
              )
            `)
            .eq('reviewed_by', userId)
            .order('reviewed_at', { ascending: false })
            .limit(limit);
          break;

        default:
          return { success: false, error: 'Invalid role' };
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Error fetching recent activity:', error);
        return { success: false, error };
      }

      logger.info('Recent activity fetched successfully:', data?.length || 0, 'items');
      return { success: true, data: data || [] };

    } catch (error) {
      logger.error('Error in getRecentActivity:', error);
      return { success: false, error };
    }
  }
}

export default DashboardService;
