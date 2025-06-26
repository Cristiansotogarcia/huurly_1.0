
import { supabase } from '../integrations/supabase/client.ts';
import { logger } from '../lib/logger.ts';

export interface HuurderStats {
  profielWeergaven: number;
  uitnodigingen: number;
  sollicitaties: number;
  geaccepteerdeSollicitaties: number;
}

export interface VerhuurderStats {
  totaalAantalPanden: number;
  actievePanden: number;
  totaalAantalHuurders: number;
  openstaandeSollicitaties: number;
  maandelijkseInkomsten: number;
}

export interface BeoordelaarStats {
  openstaandeDocumenten: number;
  vandaagBeoordeeld: number;
  totaalBeoordeeld: number;
  gemiddeldeBeoordelingstijd: number;
}

export interface BeheerderStats {
  totalUsers: number;
  activeUsers: number;
  totalProperties: number;
  totalRevenue: number;
  systemHealth: 'good' | 'warning' | 'critical';
}

export interface DashboardResponse<T> {
  success: boolean;
  data?: T;
  error?: any;
}

export class DashboardService {
  /**
   * Get dashboard statistics for huurder (tenant)
   */
  static async getHuurderStats(userId: string): Promise<DashboardResponse<HuurderStats>> {
    try {
      logger.info('Fetching huurder stats for user:', userId);

      // Get profile views from tenant_profiles table
      const { data: tenantProfile, error: profileError } = await supabase
        .from('huurders')
        .select('profiel_weergaven')
        .eq('id', userId)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        logger.error('Error fetching tenant profile:', profileError);
      }

      // Since property_applications table doesn't exist, return mock data
      const stats: HuurderStats = {
        profielWeergaven: tenantProfile?.profile_views || 0,
        uitnodigingen: 0,
        sollicitaties: 0,
        geaccepteerdeSollicitaties: 0
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
  static async getVerhuurderStats(userId: string): Promise<DashboardResponse<VerhuurderStats>> {
    try {
      logger.info('Fetching verhuurder stats for user:', userId);

      // Since properties table doesn't exist, return mock data
      const stats: VerhuurderStats = {
        totaalAantalPanden: 0,
        actievePanden: 0,
        totaalAantalHuurders: 0,
        openstaandeSollicitaties: 0,
        maandelijkseInkomsten: 0
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
  static async getBeoordelaarStats(userId: string): Promise<DashboardResponse<BeoordelaarStats>> {
    try {
      logger.info('Fetching beoordelaar stats for user:', userId);

      // Get pending documents count
      const { count: pendingCount, error: pendingError } = await supabase
        .from('documenten')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (pendingError) {
        logger.error('Error fetching pending documents count:', pendingError);
      }

      // Get documents reviewed today count
      const today = new Date().toISOString().split('T')[0];
      const { count: reviewedTodayCount, error: todayError } = await supabase
        .from('documenten')
        .select('*', { count: 'exact', head: true })
        .eq('approved_by', userId)
        .gte('approved_at', `${today}T00:00:00.000Z`)
        .lt('approved_at', `${today}T23:59:59.999Z`);

      if (todayError) {
        logger.error('Error fetching documents reviewed today count:', todayError);
      }

      // Get total reviewed documents count
      const { count: totalReviewedCount, error: totalError } = await supabase
        .from('documenten')
        .select('*', { count: 'exact', head: true })
        .eq('approved_by', userId)
        .neq('status', 'pending');

      if (totalError) {
        logger.error('Error fetching total reviewed documents count:', totalError);
      }

      // Calculate average review time (simplified)
      const averageReviewTime = 2.5; // hours - would calculate from actual data in production

      const stats: BeoordelaarStats = {
        openstaandeDocumenten: pendingCount || 0,
        vandaagBeoordeeld: reviewedTodayCount || 0,
        totaalBeoordeeld: totalReviewedCount || 0,
        gemiddeldeBeoordelingstijd: averageReviewTime
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
  static async getBeheerderStats(): Promise<DashboardResponse<BeheerderStats>> {
    try {
      logger.info('Fetching beheerder stats');

      // Get total users count
      const { count: totalUsersCount, error: usersError } = await supabase
        .from('gebruiker_rollen')
        .select('*', { count: 'exact', head: true });

      if (usersError) {
        logger.error('Error fetching total users count:', usersError);
      }

      // Get active users count (with active subscriptions)
      const { count: activeUsersCount, error: activeError } = await supabase
        .from('gebruiker_rollen')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_status', 'active');

      if (activeError) {
        logger.error('Error fetching active users count:', activeError);
      }

      // Calculate total revenue from payments
      const { data: payments, error: paymentsError } = await supabase
        .from('betalingen')
        .select('bedrag')
        .eq('status', 'completed');

      if (paymentsError) {
        logger.error('Error fetching payments:', paymentsError);
      }

      const totalRevenue = payments?.reduce((total, payment) => {
        return total + (Number(payment.bedrag) || 0);
      }, 0) || 0;

      // System health check (simplified)
      const systemHealth: 'good' | 'warning' | 'critical' = 'good';

      const stats: BeheerderStats = {
        totalUsers: totalUsersCount || 0,
        activeUsers: activeUsersCount || 0,
        totalProperties: 0, // No properties table exists
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
  static async getRecentActivity(userId: string, role: string, limit: number = 10): Promise<DashboardResponse<any[]>> {
    try {
      logger.info('Fetching recent activity for user:', userId, 'role:', role);

      let data: any[] = [];
      
      switch (role) {
        case 'huurder':
          // Since property_applications doesn't exist, return empty array
          data = [];
          break;

        case 'verhuurder':
          // Since property_applications doesn't exist, return empty array
          data = [];
          break;

        case 'beoordelaar':
          const { data: beoordelaarData, error: beoordelaarError } = await supabase
            .from('documenten')
            .select('id, document_type, status, approved_at')
            .eq('approved_by', userId)
            .order('approved_at', { ascending: false })
            .limit(limit);
          
          if (beoordelaarError) {
            logger.error('Error fetching beoordelaar activity:', beoordelaarError);
            return { success: false, error: beoordelaarError };
          }
          data = beoordelaarData || [];
          break;

        default:
          return { success: false, error: 'Invalid role' };
      }

      logger.info('Recent activity fetched successfully:', data.length, 'items');
      return { success: true, data };

    } catch (error) {
      logger.error('Error in getRecentActivity:', error);
      return { success: false, error };
    }
  }
}

export default DashboardService;
