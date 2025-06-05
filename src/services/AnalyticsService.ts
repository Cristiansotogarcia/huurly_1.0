import { supabase } from '@/integrations/supabase/client';
import { DatabaseService, DatabaseResponse } from '@/lib/database';
import { demoStatistics } from '@/data/demoData';

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
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    const hasPermission = await this.checkUserPermission(currentUserId, ['Manager']);
    if (!hasPermission) {
      return {
        data: null,
        error: new Error('Geen toegang tot platform statistieken'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // For demo purposes, return demo statistics
      // In production, this would query actual database tables
      const analytics: PlatformAnalytics = {
        ...demoStatistics.platform,
        recentActivity: [
          {
            id: '1',
            type: 'user_registration',
            description: 'Nieuwe huurder geregistreerd: Sarah van der Berg',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            userId: '5',
            userName: 'Sarah van der Berg'
          },
          {
            id: '2',
            type: 'property_listed',
            description: 'Nieuwe woning toegevoegd in Amsterdam Noord',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            userId: '2',
            userName: 'Bas Verhuur BV'
          },
          {
            id: '3',
            type: 'document_uploaded',
            description: 'Document geüpload voor verificatie',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            userId: '1',
            userName: 'Emma Bakker'
          },
          {
            id: '4',
            type: 'viewing_scheduled',
            description: 'Bezichtiging gepland voor morgen 14:00',
            timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
            userId: '5',
            userName: 'Sarah van der Berg'
          },
          {
            id: '5',
            type: 'payment_completed',
            description: 'Premium abonnement geactiveerd',
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            userId: '6',
            userName: 'Marco Huizenbeheer'
          }
        ]
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
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    const targetUserId = userId || currentUserId;

    // Check permissions
    const hasPermission = await this.checkUserPermission(targetUserId, ['Manager']);
    if (!hasPermission) {
      return {
        data: null,
        error: new Error('Geen toegang tot deze statistieken'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // For demo purposes, return demo statistics based on user role
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', targetUserId)
        .single();

      let analytics: UserAnalytics;

      if (userRole?.role === 'Huurder' || targetUserId === '1' || targetUserId === '5') {
        analytics = {
          ...demoStatistics.tenant,
          monthlyStats: [
            { month: 'Jan', value: 12, change: 5 },
            { month: 'Feb', value: 18, change: 50 },
            { month: 'Mar', value: 25, change: 39 },
            { month: 'Apr', value: 32, change: 28 },
            { month: 'May', value: 45, change: 41 },
            { month: 'Jun', value: 89, change: 98 }
          ]
        };
      } else {
        analytics = {
          profileViews: 156,
          invitationsReceived: 0,
          applicationsSubmitted: 0,
          acceptedApplications: 12,
          pendingApplications: 8,
          documentsApproved: 0,
          documentsPending: 0,
          monthlyStats: [
            { month: 'Jan', value: 8500, change: 12 },
            { month: 'Feb', value: 9200, change: 8 },
            { month: 'Mar', value: 10100, change: 10 },
            { month: 'Apr', value: 11200, change: 11 },
            { month: 'May', value: 11800, change: 5 },
            { month: 'Jun', value: 12450, change: 6 }
          ]
        };
      }

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
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    const targetLandlordId = landlordId || currentUserId;

    // Check permissions
    const hasPermission = await this.checkUserPermission(targetLandlordId, ['Manager']);
    if (!hasPermission) {
      return {
        data: null,
        error: new Error('Geen toegang tot deze statistieken'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // For demo purposes, return demo statistics
      const analytics: PropertyAnalytics = {
        ...demoStatistics.landlord,
        topPerformingProperties: [
          {
            id: '1',
            title: 'Modern 2-kamer appartement in Amsterdam Noord',
            views: 156,
            applications: 23,
            conversionRate: 14.7
          },
          {
            id: '2',
            title: 'Gezellige studio in het centrum van Amsterdam',
            views: 89,
            applications: 12,
            conversionRate: 13.5
          },
          {
            id: '3',
            title: 'Ruim 3-kamer appartement in Utrecht Centrum',
            views: 67,
            applications: 8,
            conversionRate: 11.9
          }
        ]
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
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    const hasPermission = await this.checkUserPermission(currentUserId, ['Manager']);
    if (!hasPermission) {
      return {
        data: null,
        error: new Error('Geen toegang tot document statistieken'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // For demo purposes, return demo statistics
      const analytics = {
        ...demoStatistics.reviewer,
        weeklyProgress: [
          { day: 'Ma', completed: 8, target: 7 },
          { day: 'Di', completed: 6, target: 7 },
          { day: 'Wo', completed: 9, target: 7 },
          { day: 'Do', completed: 7, target: 7 },
          { day: 'Vr', completed: 8, target: 7 },
          { day: 'Za', completed: 0, target: 0 },
          { day: 'Zo', completed: 0, target: 0 }
        ],
        documentTypes: [
          { type: 'Identiteitsbewijs', count: 45, approved: 42 },
          { type: 'Inkomensverklaring', count: 38, approved: 35 },
          { type: 'Arbeidscontract', count: 32, approved: 28 },
          { type: 'Referenties', count: 41, approved: 29 }
        ]
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
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    const hasPermission = await this.checkUserPermission(currentUserId, ['Manager']);
    if (!hasPermission) {
      return {
        data: null,
        error: new Error('Geen toegang tot systeem metrics'),
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
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // In a real implementation, this would store activity in a database table
      // For demo purposes, we'll just log it
      console.log('Activity tracked:', {
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
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    const hasPermission = await this.checkUserPermission(currentUserId, ['Manager']);
    if (!hasPermission) {
      return {
        data: null,
        error: new Error('Geen toegang tot conversie data'),
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
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    const hasPermission = await this.checkUserPermission(currentUserId, ['Manager']);
    if (!hasPermission) {
      return {
        data: null,
        error: new Error('Geen toegang tot data export'),
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
