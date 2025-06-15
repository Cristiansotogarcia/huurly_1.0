
import { supabase } from '@/integrations/supabase/client';
import { DatabaseService, DatabaseResponse } from '@/lib/database';
import { ErrorHandler } from '@/lib/errors';
import { logger } from '@/lib/logger';

export interface HuurderDashboardData {
  user: {
    id: string;
    name: string;
    email: string;
    hasPayment: boolean;
    role: string;
    subscription_end_date?: string;
  };
  profile: {
    hasProfile: boolean;
    profileData?: any;
    completionPercentage: number;
    isLookingForPlace: boolean;
  };
  documents: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    documents: any[];
  };
  stats: {
    profileViews: number;
    invitations: number;
    applications: number;
    acceptedApplications: number;
  };
  notifications: {
    unreadCount: number;
    total: number;
    recent: any[];
  };
}

export interface VerhuurderDashboardData {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  properties: {
    total: number;
    active: number;
    rented: number;
    pending: number;
    properties: any[];
  };
  applications: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    recent: any[];
  };
  stats: {
    totalViews: number;
    totalApplications: number;
    averageRent: number;
    occupancyRate: number;
  };
}

export interface BeoordelaarDashboardData {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  documents: {
    pending: number;
    reviewed: number;
    total: number;
    pendingDocuments: any[];
  };
  stats: {
    documentsReviewedToday: number;
    documentsReviewedThisWeek: number;
    averageReviewTime: number;
    approvalRate: number;
  };
}

export class DashboardDataService extends DatabaseService {
  /**
   * Get comprehensive Huurder dashboard data
   */
  async getHuurderDashboardData(userId: string): Promise<DatabaseResponse<HuurderDashboardData>> {
    return this.executeQuery(async () => {
      logger.info('Loading huurder dashboard data for user:', userId);

      // Get user data with payment info
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .single();

      const { data: paymentRecords } = await supabase
        .from('payment_records')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1);

      const hasPayment = paymentRecords && paymentRecords.length > 0;
      const subscriptionEndDate = hasPayment ? 
        new Date(new Date(paymentRecords[0].created_at).getTime() + (365 * 24 * 60 * 60 * 1000)).toISOString() : 
        undefined;

      // Get profile data
      const { data: tenantProfile } = await supabase
        .from('tenant_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      const hasProfile = !!tenantProfile;
      const completionPercentage = tenantProfile?.profile_completion_percentage || 0;
      const isLookingForPlace = tenantProfile?.availability_flexible || false;

      // Get documents data
      const { data: documents } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      const documentStats = documents ? {
        total: documents.length,
        pending: documents.filter(d => d.status === 'pending').length,
        approved: documents.filter(d => d.status === 'approved').length,
        rejected: documents.filter(d => d.status === 'rejected').length,
        documents: documents
      } : {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        documents: []
      };

      // Get profile analytics
      const { data: analytics } = await supabase
        .from('profile_analytics')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Get property applications
      const { data: applications } = await supabase
        .from('property_applications')
        .select('*')
        .eq('tenant_id', userId);

      const stats = {
        profileViews: analytics?.total_views || 0,
        invitations: 0, // This would come from viewing_invitations table if it existed
        applications: applications?.length || 0,
        acceptedApplications: applications?.filter(a => a.status === 'accepted').length || 0
      };

      // Get notifications
      const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      const notificationData = {
        unreadCount: notifications?.filter(n => !n.read).length || 0,
        total: notifications?.length || 0,
        recent: notifications || []
      };

      const dashboardData: HuurderDashboardData = {
        user: {
          id: userId,
          name: `${tenantProfile?.first_name || ''} ${tenantProfile?.last_name || ''}`.trim() || 'Huurder',
          email: userRoles?.user_id || userId,
          hasPayment,
          role: 'huurder',
          subscription_end_date: subscriptionEndDate
        },
        profile: {
          hasProfile,
          profileData: tenantProfile,
          completionPercentage,
          isLookingForPlace
        },
        documents: documentStats,
        stats,
        notifications: notificationData
      };

      logger.info('Huurder dashboard data loaded successfully');
      return { data: dashboardData, error: null };
    });
  }

  /**
   * Get comprehensive Verhuurder dashboard data
   */
  async getVerhuurderDashboardData(userId: string): Promise<DatabaseResponse<VerhuurderDashboardData>> {
    return this.executeQuery(async () => {
      logger.info('Loading verhuurder dashboard data for user:', userId);

      // Get properties
      const { data: properties } = await supabase
        .from('properties')
        .select('*')
        .eq('landlord_id', userId)
        .order('created_at', { ascending: false });

      const propertyStats = properties ? {
        total: properties.length,
        active: properties.filter(p => p.status === 'active').length,
        rented: properties.filter(p => p.status === 'rented').length,
        pending: properties.filter(p => p.status === 'pending').length,
        properties: properties
      } : {
        total: 0,
        active: 0,
        rented: 0,
        pending: 0,
        properties: []
      };

      // Get applications for all properties
      const propertyIds = properties?.map(p => p.id) || [];
      let applications: any[] = [];
      
      if (propertyIds.length > 0) {
        const { data: applicationsData } = await supabase
          .from('property_applications')
          .select('*')
          .in('property_id', propertyIds)
          .order('applied_at', { ascending: false });
        
        applications = applicationsData || [];
      }

      const applicationStats = {
        total: applications.length,
        pending: applications.filter(a => a.status === 'pending').length,
        approved: applications.filter(a => a.status === 'accepted').length,
        rejected: applications.filter(a => a.status === 'rejected').length,
        recent: applications.slice(0, 10)
      };

      // Calculate stats
      const averageRent = properties && properties.length > 0 ? 
        properties.reduce((sum, p) => sum + (Number(p.rent_amount) || 0), 0) / properties.length : 0;
      
      const occupancyRate = propertyStats.total > 0 ? 
        (propertyStats.rented / propertyStats.total) * 100 : 0;

      const stats = {
        totalViews: 0, // This would come from property analytics if implemented
        totalApplications: applications.length,
        averageRent: Math.round(averageRent),
        occupancyRate: Math.round(occupancyRate)
      };

      const dashboardData: VerhuurderDashboardData = {
        user: {
          id: userId,
          name: 'Verhuurder', // This could come from profiles table
          email: userId,
          role: 'verhuurder'
        },
        properties: propertyStats,
        applications: applicationStats,
        stats
      };

      logger.info('Verhuurder dashboard data loaded successfully');
      return { data: dashboardData, error: null };
    });
  }

  /**
   * Get comprehensive Beoordelaar dashboard data
   */
  async getBeoordelaarDashboardData(userId: string): Promise<DatabaseResponse<BeoordelaarDashboardData>> {
    return this.executeQuery(async () => {
      logger.info('Loading beoordelaar dashboard data for user:', userId);

      // Get all documents that need review
      const { data: documents } = await supabase
        .from('user_documents')
        .select('*')
        .order('created_at', { ascending: false });

      const documentStats = documents ? {
        pending: documents.filter(d => d.status === 'pending').length,
        reviewed: documents.filter(d => d.status !== 'pending').length,
        total: documents.length,
        pendingDocuments: documents.filter(d => d.status === 'pending').slice(0, 20)
      } : {
        pending: 0,
        reviewed: 0,
        total: 0,
        pendingDocuments: []
      };

      // Calculate review stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const thisWeek = new Date();
      thisWeek.setDate(thisWeek.getDate() - 7);

      const reviewedToday = documents?.filter(d => 
        d.approved_at && new Date(d.approved_at) >= today
      ).length || 0;

      const reviewedThisWeek = documents?.filter(d => 
        d.approved_at && new Date(d.approved_at) >= thisWeek
      ).length || 0;

      const approvedDocuments = documents?.filter(d => d.status === 'approved').length || 0;
      const approvalRate = documentStats.reviewed > 0 ? 
        (approvedDocuments / documentStats.reviewed) * 100 : 0;

      const stats = {
        documentsReviewedToday: reviewedToday,
        documentsReviewedThisWeek: reviewedThisWeek,
        averageReviewTime: 24, // hours - this could be calculated from actual data
        approvalRate: Math.round(approvalRate)
      };

      const dashboardData: BeoordelaarDashboardData = {
        user: {
          id: userId,
          name: 'Beoordelaar',
          email: userId,
          role: 'beoordelaar'
        },
        documents: documentStats,
        stats
      };

      logger.info('Beoordelaar dashboard data loaded successfully');
      return { data: dashboardData, error: null };
    });
  }

  /**
   * Update user profile visibility status
   */
  async updateProfileVisibility(userId: string, isLookingForPlace: boolean): Promise<DatabaseResponse<any>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('tenant_profiles')
        .update({ 
          availability_flexible: isLookingForPlace,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      return { data, error: null };
    });
  }
}

// Export singleton instance
export const dashboardDataService = new DashboardDataService();
