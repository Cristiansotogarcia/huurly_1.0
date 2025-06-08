
import { supabase } from '@/integrations/supabase/client';
import { DatabaseService, DatabaseResponse } from '@/lib/database';
import { logger } from '@/lib/logger';

export interface PlatformAnalytics {
  totalUsers: number;
  activeUsers: number;
  totalProperties: number;
  successfulMatches: number;
  pendingDocuments: number;
  monthlyRevenue: number;
  userGrowth: number;
  matchSuccessRate: number;
  recentActivity: ActivityItem[];
}

export interface UserAnalytics {
  profileViews: number;
  invitationsReceived: number;
  applicationsSubmitted: number;
  acceptedApplications: number;
  pendingApplications: number;
  documentsApproved: number;
  documentsPending: number;
  monthlyStats: MonthlyStats[];
}

export interface PropertyAnalytics {
  totalProperties: number;
  activeProperties: number;
  totalViews: number;
  totalApplications: number;
  acceptedApplications: number;
  pendingApplications: number;
  monthlyRevenue: number;
  topPerformingProperties: PropertyPerformance[];
}

export interface ActivityItem {
  id: string;
  type: 'user_registration' | 'property_listed' | 'document_uploaded' | 'viewing_scheduled' | 'payment_completed';
  description: string;
  timestamp: string;
  userId?: string;
  userName?: string;
}

export interface MonthlyStats {
  month: string;
  value: number;
  change: number;
}

export interface PropertyPerformance {
  id: string;
  title: string;
  views: number;
  applications: number;
  conversionRate: number;
}

export class AnalyticsService extends DatabaseService {
  /**
   * Get platform-wide analytics (Admin only)
   */
  async getPlatformAnalytics(): Promise<DatabaseResponse<PlatformAnalytics>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: null,
        success: false,
      };
    }

    const hasPermission = await this.checkUserPermission(currentUserId, ['Beheerder']);
    if (!hasPermission) {
      return {
        data: null,
        error: null,
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const [{ count: totalUsers }, { count: activeUsers }, { count: totalProperties }, { count: successfulMatches }, { count: pendingDocuments }, { data: payments }, { count: totalApplications }] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase
          .from('user_roles')
          .select('user_id', { count: 'exact', head: true })
          .eq('subscription_status', 'active'),
        supabase.from('properties').select('id', { count: 'exact', head: true }),
        supabase
          .from('property_applications')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'accepted'),
        supabase
          .from('user_documents')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending'),
        supabase
          .from('payment_records')
          .select('amount, created_at')
          .gte('created_at', startOfMonth.toISOString()),
        supabase.from('property_applications').select('id', { count: 'exact', head: true })
      ]);

      const monthlyRevenue =
        (payments?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0) / 100;

      const matchSuccessRate = totalApplications
        ? ((successfulMatches || 0) / totalApplications) * 100
        : 0;

      const analytics: PlatformAnalytics = {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalProperties: totalProperties || 0,
        successfulMatches: successfulMatches || 0,
        pendingDocuments: pendingDocuments || 0,
        monthlyRevenue,
        userGrowth: 0,
        matchSuccessRate,
        recentActivity: []
      };

      return { data: analytics, error: null };
    });
  }

  /**
   * Get user-specific analytics
   */
  async getUserAnalytics(userId?: string): Promise<DatabaseResponse<UserAnalytics>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: null,
        success: false,
      };
    }

    const targetUserId = userId || currentUserId;

    // Check permissions
    const hasPermission = await this.checkUserPermission(targetUserId, ['Beheerder']);
    if (!hasPermission) {
      return {
        data: null,
        error: null,
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', targetUserId)
        .single();

      if (userRole?.role !== 'Huurder') {
        return {
          data: null,
          error: null,
        };
      }

      const [
        { data: tenantProfile },
        { count: invitationsReceived },
        { count: applicationsSubmitted },
        { count: acceptedApplications },
        { count: pendingApplications },
        { count: documentsApproved },
        { count: documentsPending }
      ] = await Promise.all([
        supabase
          .from('tenant_profiles')
          .select('profile_views')
          .eq('user_id', targetUserId)
          .single(),
        supabase
          .from('viewing_invitations')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', targetUserId),
        supabase
          .from('property_applications')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', targetUserId),
        supabase
          .from('property_applications')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', targetUserId)
          .eq('status', 'accepted'),
        supabase
          .from('property_applications')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', targetUserId)
          .eq('status', 'pending'),
        supabase
          .from('user_documents')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', targetUserId)
          .eq('status', 'approved'),
        supabase
          .from('user_documents')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', targetUserId)
          .eq('status', 'pending')
      ]);

      const analytics: UserAnalytics = {
        profileViews: tenantProfile?.profile_views || 0,
        invitationsReceived: invitationsReceived || 0,
        applicationsSubmitted: applicationsSubmitted || 0,
        acceptedApplications: acceptedApplications || 0,
        pendingApplications: pendingApplications || 0,
        documentsApproved: documentsApproved || 0,
        documentsPending: documentsPending || 0,
        monthlyStats: []
      };

      return { data: analytics, error: null };
    });
  }

  /**
   * Get property analytics for landlords
   */
  async getPropertyAnalytics(landlordId?: string): Promise<DatabaseResponse<PropertyAnalytics>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: null,
        success: false,
      };
    }

    const targetLandlordId = landlordId || currentUserId;

    // Check permissions
    const hasPermission = await this.checkUserPermission(targetLandlordId, ['Beheerder']);
    if (!hasPermission) {
      return {
        data: null,
        error: null,
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const { data: properties } = await supabase
        .from('properties')
        .select('id, title, status')
        .eq('landlord_id', targetLandlordId);

      if (!properties) {
        return { data: null, error: null };
      }

      const propertyIds = properties.map(p => p.id);

      const [
        { count: totalApplications },
        { count: acceptedApplications },
        { count: pendingApplications }
      ] = await Promise.all([
        supabase
          .from('property_applications')
          .select('id', { count: 'exact', head: true })
          .in('property_id', propertyIds),
        supabase
          .from('property_applications')
          .select('id', { count: 'exact', head: true })
          .in('property_id', propertyIds)
          .eq('status', 'accepted'),
        supabase
          .from('property_applications')
          .select('id', { count: 'exact', head: true })
          .in('property_id', propertyIds)
          .eq('status', 'pending')
      ]);

      const totalProperties = properties.length;
      const activeProperties = properties.filter(p => p.status === 'active').length;

      const topPerformingProperties: PropertyPerformance[] = [];

      for (const prop of properties) {
        const { count: appCount } = await supabase
          .from('property_applications')
          .select('id', { count: 'exact', head: true })
          .eq('property_id', prop.id);

        topPerformingProperties.push({
          id: prop.id,
          title: prop.title,
          views: 0,
          applications: appCount || 0,
          conversionRate: 0
        });
      }

      topPerformingProperties.sort((a, b) => b.applications - a.applications);

      const analytics: PropertyAnalytics = {
        totalProperties,
        activeProperties,
        totalViews: 0,
        totalApplications: totalApplications || 0,
        acceptedApplications: acceptedApplications || 0,
        pendingApplications: pendingApplications || 0,
        monthlyRevenue: 0,
        topPerformingProperties: topPerformingProperties.slice(0, 3)
      };

      return { data: analytics, error: null };
    });
  }

  /**
   * Get document review analytics (Reviewers only)
   */
  async getDocumentAnalytics(): Promise<DatabaseResponse<any>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: null,
        success: false,
      };
    }

    const hasPermission = await this.checkUserPermission(currentUserId, ['Beheerder']);
    if (!hasPermission) {
      return {
        data: null,
        error: null,
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const [
        { count: approved },
        { count: rejected },
        { count: pending },
        { count: weeklyCompleted },
        { data: typeData }
      ] = await Promise.all([
        supabase
          .from('user_documents')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'approved'),
        supabase
          .from('user_documents')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'rejected'),
        supabase
          .from('user_documents')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending'),
        supabase
          .from('user_documents')
          .select('id', { count: 'exact', head: true })
          .gte('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .in('status', ['approved', 'rejected']),
        supabase.from('user_documents').select('document_type, status')
      ]);

      const typeMap: Record<string, { type: string; count: number; approved: number }> = {};
      typeData?.forEach((d: any) => {
        if (!typeMap[d.document_type]) {
          typeMap[d.document_type] = { type: d.document_type, count: 0, approved: 0 };
        }
        typeMap[d.document_type].count += 1;
        if (d.status === 'approved') {
          typeMap[d.document_type].approved += 1;
        }
      });

      const analytics = {
        documentsReviewed: (approved || 0) + (rejected || 0),
        documentsApproved: approved || 0,
        documentsRejected: rejected || 0,
        avgReviewTime: 'N/A',
        pendingReviews: pending || 0,
        weeklyGoal: 50,
        weeklyCompleted: weeklyCompleted || 0,
        weeklyProgress: [],
        documentTypes: Object.values(typeMap)
      };

      return { data: analytics, error: null };
    });
  }

  /**
   * Get real-time system metrics
   */
  async getSystemMetrics(): Promise<DatabaseResponse<any>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: null,
        success: false,
      };
    }

    const hasPermission = await this.checkUserPermission(currentUserId, ['Beheerder']);
    if (!hasPermission) {
      return {
        data: null,
        error: null,
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // For demo purposes, return simulated real-time metrics
      const metrics = {
        activeUsers: Math.floor(Math.random() * 50) + 20,
        serverLoad: Math.floor(Math.random() * 30) + 10,
        responseTime: Math.floor(Math.random() * 100) + 50,
        errorRate: Math.random() * 2,
        databaseConnections: Math.floor(Math.random() * 20) + 5,
        storageUsage: Math.floor(Math.random() * 20) + 60,
        lastUpdated: new Date().toISOString()
      };

      return { data: metrics, error: null };
    });
  }

  /**
   * Track user activity
   */
  async trackActivity(
    type: ActivityItem['type'],
    description: string,
    relatedId?: string
  ): Promise<DatabaseResponse<boolean>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: null,
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // In a real implementation, this would store activity in a database table
      // For demo purposes, we'll just log it
       logger.info('Activity tracked:', {
        userId: currentUserId,
        type,
        description,
        relatedId,
        timestamp: new Date().toISOString()
      });

      await this.createAuditLog('ACTIVITY', 'user_activity', relatedId, null, {
        type,
        description,
        userId: currentUserId
      });

      return { data: true, error: null };
    });
  }

  /**
   * Get conversion funnel data
   */
  async getConversionFunnel(): Promise<DatabaseResponse<any>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: null,
        success: false,
      };
    }

    const hasPermission = await this.checkUserPermission(currentUserId, ['Beheerder']);
    if (!hasPermission) {
      return {
        data: null,
        error: null,
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // Demo conversion funnel data
      const funnelData = {
        steps: [
          { name: 'Bezoekers', value: 1000, percentage: 100 },
          { name: 'Registraties', value: 250, percentage: 25 },
          { name: 'Profiel voltooid', value: 180, percentage: 18 },
          { name: 'Documenten geüpload', value: 120, percentage: 12 },
          { name: 'Eerste bezichtiging', value: 80, percentage: 8 },
          { name: 'Huurcontract', value: 35, percentage: 3.5 }
        ],
        timeframe: 'Afgelopen 30 dagen'
      };

      return { data: funnelData, error: null };
    });
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(
    type: 'platform' | 'user' | 'property' | 'document',
    format: 'csv' | 'json' = 'json'
  ): Promise<DatabaseResponse<string>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: null,
        success: false,
      };
    }

    const hasPermission = await this.checkUserPermission(currentUserId, ['Beheerder']);
    if (!hasPermission) {
      return {
        data: null,
        error: null,
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // For demo purposes, return a download URL
      const exportUrl = `https://api.huurly.nl/exports/${type}-${Date.now()}.${format}`;
      
      await this.createAuditLog('EXPORT', 'analytics', null, null, {
        type,
        format,
        userId: currentUserId
      });

      return { data: exportUrl, error: null };
    });
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
