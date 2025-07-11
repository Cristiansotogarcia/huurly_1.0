
import { supabase } from '../integrations/supabase/client';
import { DatabaseService, DatabaseResponse } from '../lib/database';
import { ErrorHandler } from '../lib/errors';
import { logger } from '../lib/logger';
import { Property } from '@/types';

export interface DashboardData {
  stats: {
    totalUsers: number;
    totalTenants: number;
    totalLandlords: number;
    pendingDocuments: number;
    approvedDocuments: number;
    activeSubscriptions: number;
  };
  recentActivity: any[];
  documentQueue: any[];
}

export class DashboardDataService extends DatabaseService {
  async getAdminDashboardData(): Promise<DatabaseResponse<DashboardData>> {
    return this.executeQuery(async () => {
      const [
        usersResult,
        tenantsResult,
        landlordsResult,
        documentsResult,
        subscriptionsResult,
        recentActivityResult,
        documentQueueResult
      ] = await Promise.all([
        supabase.from('gebruikers').select('id', { count: 'exact', head: true }),
        supabase.from('gebruikers').select('id', { count: 'exact', head: true }).eq('rol', 'huurder'),
        supabase.from('gebruikers').select('id', { count: 'exact', head: true }).eq('rol', 'verhuurder'),
        supabase.from('documenten').select('status'),
        supabase.from('abonnementen').select('id').eq('status', 'actief'),
        supabase.from('notificaties').select('*').order('aangemaakt_op', { ascending: false }).limit(5),
        supabase.from('documenten').select(`
          *,
          huurders (naam, email)
        `).eq('status', 'wachtend').order('aangemaakt_op', { ascending: true }).limit(10)
      ]);

      const documents = documentsResult.data || [];
      const pendingDocuments = documents.filter(doc => doc.status === 'wachtend').length;
      const approvedDocuments = documents.filter(doc => doc.status === 'goedgekeurd').length;

      const dashboardData: DashboardData = {
        stats: {
          totalUsers: usersResult.count || 0,
          totalTenants: tenantsResult.count || 0,
          totalLandlords: landlordsResult.count || 0,
          pendingDocuments,
          approvedDocuments,
          activeSubscriptions: subscriptionsResult.data?.length || 0,
        },
        recentActivity: recentActivityResult.data || [],
        documentQueue: documentQueueResult.data || [],
      };

      return { data: dashboardData, error: null };
    });
  }

  async getTenantDashboardData(userId: string): Promise<DatabaseResponse<any>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId || currentUserId !== userId) {
      return {
        data: null,
        error: ErrorHandler.normalize('Niet geautoriseerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const [
        profileResult,
        documentsResult,
        subscriptionResult
      ] = await Promise.all([
        supabase.from('huurders').select('*').eq('id', userId).single(),
        supabase.from('documenten').select('*').eq('huurder_id', userId),
        supabase.from('abonnementen').select('*').eq('huurder_id', userId).eq('status', 'actief').single()
      ]);

      const profile = profileResult.data;
      const documents = documentsResult.data || [];
      const subscription = subscriptionResult.data;

      const dashboardData = {
        profile,
        documents,
        subscription,
        stats: {
          documentsUploaded: documents.length,
          documentsApproved: documents.filter(doc => doc.status === 'goedgekeurd').length,
          profileComplete: !!profile,
          subscriptionActive: !!subscription,
        },
      };

      return { data: dashboardData, error: null };
    });
  }

  async getVerhuurderDashboardData(userId: string): Promise<DatabaseResponse<any>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId || currentUserId !== userId) {
      return {
        data: null,
        error: ErrorHandler.normalize('Niet geautoriseerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const [
        profileResult,
        tenantsResult
      ] = await Promise.all([
        supabase.from('verhuurders').select('*').eq('id', userId).single(),
        supabase.from('huurders').select('*').order('bijgewerkt_op', { ascending: false })
      ]);

      const profile = profileResult.data;
      const tenants = tenantsResult.data || [];

      const dashboardData = {
        profile,
        tenants,
        stats: {
          availableTenants: tenants.length,
          profileComplete: !!profile,
        },
      };

      return { data: dashboardData, error: null };
    });
  }

  async updateDocumentStatus(
    documentId: string,
    status: 'goedgekeurd' | 'afgekeurd',
    notes?: string
  ): Promise<DatabaseResponse<any>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: ErrorHandler.normalize('Niet geautoriseerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('documenten')
        .update({
          status,
          beoordelaar_id: currentUserId,
          beoordeling_notitie: notes || null,
          bijgewerkt_op: new Date().toISOString(),
        })
        .eq('id', documentId)
        .select()
        .single();

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      await this.createAuditLog('DOCUMENT_REVIEW', 'documenten', documentId, currentUserId, {
        status,
        notes,
      });

      return { data, error: null };
    });
  }

  /**
   * Get landlord dashboard stats
   */
  static async getLandlordDashboardStats(userId: string): Promise<DatabaseResponse<any>> {
    const service = new DashboardDataService();
    return service.executeQuery(async () => {
      const [propertiesResult, viewsResult] = await Promise.all([
        supabase.from('verhuurders').select('aantal_woningen').eq('id', userId).single(),
        supabase.from('profiel_weergaves').select('id').eq('verhuurder_id', userId)
      ]);

      const data = {
        totalProperties: propertiesResult.data?.aantal_woningen || 0,
        totalViews: viewsResult.data?.length || 0,
        activeListings: 0, // Add proper query when needed
        inquiries: 0 // Add proper query when needed
      };

      return { data, error: null };
    });
  }

  /**
   * Get landlord properties
   */
  static async getLandlordProperties(userId: string): Promise<DatabaseResponse<Property[]>> {
    const service = new DashboardDataService();
    return service.executeQuery(async () => {
      const { data, error } = await supabase
        .from('woningen')
        .select('*')
        .eq('verhuurder_id', userId)
        .order('aangemaakt_op', { ascending: false });

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      return { data: (data || []) as any[], error: null };
    });
  }
}

export const dashboardDataService = new DashboardDataService();
