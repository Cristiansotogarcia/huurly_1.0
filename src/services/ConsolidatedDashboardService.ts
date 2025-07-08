import { supabase } from '../integrations/supabase/client';
import { DatabaseService, DatabaseResponse } from '../lib/database';
import { logger } from '../lib/logger';
import { TenantProfile, Subscription, TenantDashboardData } from '../types';
import { Document } from './DocumentService';
import { optimizedSubscriptionService } from './OptimizedSubscriptionService';

interface ConsolidatedDashboardData {
  stats: TenantDashboardData;
  documents: Document[];
  tenantProfile: TenantProfile | null;
  subscription: Subscription | null;
  profilePictureUrl: string | null;
  hasProfile: boolean;
}

export class ConsolidatedDashboardService extends DatabaseService {
  /**
   * Fetch all dashboard data in a single optimized query
   */
  async getHuurderDashboardData(userId: string): Promise<DatabaseResponse<ConsolidatedDashboardData>> {
    return this.executeQuery(async () => {
      logger.info('Fetching consolidated dashboard data for user:', userId);

      try {
        // Execute all queries in parallel for maximum performance
        const [
          statsResult,
          documentsResult,
          profileResult,
          subscriptionResult,
          profilePictureResult
        ] = await Promise.allSettled([
          // Get dashboard stats
          supabase
            .from('dashboard_stats')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle(),
          
          // Get user documents
          supabase
            .from('documenten')
            .select('*')
            .eq('huurder_id', userId)
            .order('aangemaakt_op', { ascending: false }),
          
          // Get tenant profile
          supabase
            .from('huurders')
            .select('*')
            .eq('id', userId)
            .maybeSingle(),
          
          // Get active subscription using optimized service
          optimizedSubscriptionService.checkSubscriptionStatus(userId),
          
          // Get profile picture URL from storage
          this.getProfilePictureUrl(userId)
        ]);

        // Process results
        const stats = statsResult.status === 'fulfilled' && statsResult.value.data
          ? statsResult.value.data
          : { profileViews: 0, invitations: 0, applications: 0, acceptedApplications: 0 };

        const documents = documentsResult.status === 'fulfilled' && documentsResult.value.data
          ? documentsResult.value.data
          : [];

        const tenantProfile = profileResult.status === 'fulfilled' && profileResult.value.data
          ? profileResult.value.data
          : null;

        const subscription = subscriptionResult.status === 'fulfilled' && subscriptionResult.value.success && subscriptionResult.value.data?.hasActiveSubscription
          ? { status: 'active', ...subscriptionResult.value.data }
          : null;

        const profilePictureUrl = profilePictureResult.status === 'fulfilled'
          ? profilePictureResult.value
          : null;

        const hasProfile = !!tenantProfile;

        const consolidatedData: ConsolidatedDashboardData = {
          stats,
          documents,
          tenantProfile,
          subscription,
          profilePictureUrl,
          hasProfile
        };

        logger.info('Successfully fetched consolidated dashboard data');
        return { data: consolidatedData, error: null };

      } catch (error) {
        logger.error('Error fetching consolidated dashboard data:', error);
        throw error;
      }
    });
  }

  /**
   * Get profile picture URL from storage
   */
  private async getProfilePictureUrl(userId: string): Promise<string | null> {
    try {
      const { data } = await supabase.storage
        .from('profile-pictures')
        .list(`${userId}/`, {
          limit: 1,
          sortBy: { column: 'updated_at', order: 'desc' }
        });

      if (data && data.length > 0) {
        const { data: { publicUrl } } = supabase.storage
          .from('profile-pictures')
          .getPublicUrl(`${userId}/${data[0].name}`);
        
        return publicUrl;
      }
      
      return null;
    } catch (error) {
      logger.error('Error getting profile picture URL:', error);
      return null;
    }
  }

  /**
   * Update subscription cache when payment is successful
   */
  async refreshSubscriptionStatus(userId: string): Promise<DatabaseResponse<Subscription | null>> {
    return this.executeQuery(async () => {
      // Use optimized subscription service with cache refresh
      const result = await optimizedSubscriptionService.refreshSubscriptionStatus(userId);
      
      if (result.success && result.data?.hasActiveSubscription) {
        return { data: { status: 'active', ...result.data } as Subscription, error: null };
      }

      return { data: null, error: null };
    });
  }
}

export const consolidatedDashboardService = new ConsolidatedDashboardService();