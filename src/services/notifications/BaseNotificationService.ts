
import { supabase } from '@/integrations/supabase/client';
import { DatabaseService, DatabaseResponse, PaginationOptions, SortOptions } from '@/lib/database';

export interface CreateNotificationData {
  userId: string;
  type: 'profile_match' | 'viewing_invitation' | 'payment_success' | 'payment_failed' | 'subscription_cancelled' | 'document_approved' | 'document_rejected' | 'property_application' | 'system_announcement';
  title: string;
  message: string;
  relatedId?: string;
  relatedType?: string;
}

export interface NotificationFilters {
  userId?: string;
  type?: string;
  read?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export class BaseNotificationService extends DatabaseService {
  /**
   * Create a new notification
   */
  async createNotification(data: CreateNotificationData): Promise<DatabaseResponse<any>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    const sanitizedData = this.sanitizeInput(data);
    
    const validation = this.validateRequiredFields(sanitizedData, [
      'userId', 'type', 'title', 'message'
    ]);
    if (!validation.isValid) {
      return {
        data: null,
        error: new Error(`Verplichte velden ontbreken: ${validation.missingFields.join(', ')}`),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: sanitizedData.userId,
          type: sanitizedData.type,
          title: sanitizedData.title,
          message: sanitizedData.message,
          related_id: sanitizedData.relatedId,
          related_type: sanitizedData.relatedType,
          read: false,
        })
        .select()
        .single();

      if (error) {
        throw this.handleDatabaseError(error);
      }

      await this.createAuditLog('CREATE', 'notifications', data?.id, null, data);

      return { data, error: null };
    });
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(
    userId?: string,
    filters?: NotificationFilters,
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

    const targetUserId = userId || currentUserId;

    // Check permissions - users can only see their own notifications unless they're a manager
    if (targetUserId !== currentUserId) {
      const hasPermission = await this.checkUserPermission(currentUserId, ['Beheerder']);
      if (!hasPermission) {
        return {
          data: null,
          error: new Error('Geen toegang tot deze notificaties'),
          success: false,
        };
      }
    }

    return this.executeQuery(async () => {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', targetUserId);

      // Apply filters
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }

      if (filters?.read !== undefined) {
        query = query.eq('read', filters.read);
      }

      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      // Apply sorting
      query = this.applySorting(query, sort || { column: 'created_at', ascending: false });

      // Apply pagination
      query = this.applyPagination(query, pagination);

      const { data, error } = await query;

      return { data, error };
    });
  }

  /**
   * Delete notification - IMPROVED VERSION
   */
  async deleteNotification(notificationId: string): Promise<DatabaseResponse<boolean>> {
    const currentUserId = await this.getCurrentUserId();
    console.log('BaseNotificationService.deleteNotification called for:', notificationId, 'by user:', currentUserId);
    
    if (!currentUserId) {
      console.error('No current user ID found');
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // First verify the notification exists and belongs to the user
      console.log('Checking if notification exists and belongs to user...');
      const { data: notification, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', notificationId)
        .eq('user_id', currentUserId) // Add user check to the query
        .single();

      if (fetchError || !notification) {
        console.error('Notification not found or access denied:', fetchError);
        throw new Error('Notificatie niet gevonden of geen toegang');
      }

      console.log('Found notification, proceeding with deletion:', notification);

      // Delete the notification
      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', currentUserId); // Double-check user ownership

      if (deleteError) {
        console.error('Database delete error:', deleteError);
        throw this.handleDatabaseError(deleteError);
      }

      // Verify deletion by trying to fetch the notification again
      const { data: verifyData } = await supabase
        .from('notifications')
        .select('id')
        .eq('id', notificationId)
        .single();

      if (verifyData) {
        console.error('Notification still exists after deletion attempt');
        throw new Error('Verwijdering mislukt - notificatie bestaat nog steeds');
      }

      console.log('Notification successfully deleted and verified');

      await this.createAuditLog('DELETE', 'notifications', notificationId, notification);

      return { data: true, error: null };
    });
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId?: string): Promise<DatabaseResponse<number>> {
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
    if (targetUserId !== currentUserId) {
      const hasPermission = await this.checkUserPermission(currentUserId, ['Beheerder']);
      if (!hasPermission) {
        return {
          data: null,
          error: new Error('Geen toegang tot deze gegevens'),
          success: false,
        };
      }
    }

    return this.executeQuery(async () => {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', targetUserId)
        .eq('read', false);

      if (error) {
        throw this.handleDatabaseError(error);
      }

      return { data: count || 0, error: null };
    });
  }
}
