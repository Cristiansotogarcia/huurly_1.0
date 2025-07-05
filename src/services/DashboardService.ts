
import { supabase } from '@/integrations/supabase/client';
import { DatabaseService, DatabaseResponse } from '../lib/database';
import { ErrorHandler } from '../lib/errors';
import { logger } from '../lib/logger';

export interface DashboardStats {
  totalUsers: number;
  totalTenants: number;
  totalLandlords: number;
  pendingDocuments: number;
  approvedDocuments: number;
  activeSubscriptions: number;
  totalRevenue: number;
}

export interface TenantStats {
  profileViews: number;
  documentsUploaded: number;
  documentsApproved: number;
  subscriptionStatus: string;
  profileCompleteness: number;
}

export class DashboardService extends DatabaseService {
  async getAdminStats(): Promise<DatabaseResponse<DashboardStats>> {
    return this.executeQuery(async () => {
      const [
        usersResult,
        tenantsResult,
        landlordsResult,
        documentsResult,
        subscriptionsResult
      ] = await Promise.all([
        supabase.from('gebruikers').select('id', { count: 'exact', head: true }),
        supabase.from('gebruikers').select('id', { count: 'exact', head: true }).eq('rol', 'huurder'),
        supabase.from('gebruikers').select('id', { count: 'exact', head: true }).eq('rol', 'verhuurder'),
        supabase.from('documenten').select('status'),
        supabase.from('abonnementen').select('id').eq('status', 'actief')
      ]);

      const documents = documentsResult.data || [];
      const pendingDocuments = documents.filter(doc => doc.status === 'wachtend').length;
      const approvedDocuments = documents.filter(doc => doc.status === 'goedgekeurd').length;

      const stats: DashboardStats = {
        totalUsers: usersResult.count || 0,
        totalTenants: tenantsResult.count || 0,
        totalLandlords: landlordsResult.count || 0,
        pendingDocuments,
        approvedDocuments,
        activeSubscriptions: subscriptionsResult.data?.length || 0,
        totalRevenue: (subscriptionsResult.data?.length || 0) * 65
      };

      return { data: stats, error: null };
    });
  }

  async getTenantStats(userId: string): Promise<DatabaseResponse<TenantStats>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId || currentUserId !== userId) {
      return {
        data: null,
        error: ErrorHandler.normalize('Niet geautoriseerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const [documentsResult, subscriptionResult] = await Promise.all([
        supabase.from('documenten').select('status').eq('huurder_id', userId),
        supabase.from('abonnementen').select('status').eq('huurder_id', userId).eq('status', 'actief').single()
      ]);

      const documents = documentsResult.data || [];
      const documentsUploaded = documents.length;
      const documentsApproved = documents.filter(doc => doc.status === 'goedgekeurd').length;
      const subscriptionStatus = subscriptionResult.data ? 'actief' : 'inactief';

      const stats: TenantStats = {
        profileViews: 0, // This would need to be tracked separately
        documentsUploaded,
        documentsApproved,
        subscriptionStatus,
        profileCompleteness: Math.round((documentsApproved / Math.max(5, documentsUploaded)) * 100)
      };

      return { data: stats, error: null };
    });
  }

  async getRecentActivity(limit: number = 10): Promise<DatabaseResponse<any[]>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('notificaties')
        .select(`
          *,
          gebruikers (
            naam,
            email
          )
        `)
        .order('aangemaakt_op', { ascending: false })
        .limit(limit);

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      return { data: data || [], error: null };
    });
  }

  async getDocumentQueue(): Promise<DatabaseResponse<any[]>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('documenten')
        .select(`
          *,
          huurders (
            naam,
            email
          )
        `)
        .eq('status', 'wachtend')
        .order('aangemaakt_op', { ascending: true });

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      return { data: data || [], error: null };
    });
  }
}

export const dashboardService = new DashboardService();
