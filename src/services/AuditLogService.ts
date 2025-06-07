import { supabase } from '@/integrations/supabase/client';
import { DatabaseService, DatabaseResponse, PaginationOptions, SortOptions } from '@/lib/database';

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  tableName?: string;
  dateFrom?: string;
  dateTo?: string;
}

export class AuditLogService extends DatabaseService {
  /**
   * Retrieve audit logs (admin only)
   */
  async getAuditLogs(
    filters?: AuditLogFilters,
    pagination?: PaginationOptions,
    sort?: SortOptions
  ): Promise<DatabaseResponse<any[]>> {
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
        error: new Error('Geen toegang tot audit logs'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      let query = supabase.from('audit_logs').select('*');

      if (filters?.userId) query = query.eq('user_id', filters.userId);
      if (filters?.action) query = query.eq('action', filters.action);
      if (filters?.tableName) query = query.eq('table_name', filters.tableName);
      if (filters?.dateFrom) query = query.gte('created_at', filters.dateFrom);
      if (filters?.dateTo) query = query.lte('created_at', filters.dateTo);

      query = this.applySorting(query, sort || { column: 'created_at', ascending: false });
      query = this.applyPagination(query, pagination);

      const { data, error } = await query;
      return { data, error };
    });
  }

  /**
   * Retrieve a single audit log by ID (admin only)
   */
  async getAuditLog(logId: string): Promise<DatabaseResponse<any>> {
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
        error: new Error('Geen toegang tot audit logs'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('id', logId)
        .single();

      return { data, error };
    });
  }
}

// Export singleton instance
export const auditLogService = new AuditLogService();
