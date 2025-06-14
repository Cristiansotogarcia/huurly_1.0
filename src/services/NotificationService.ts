
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

export class NotificationService extends DatabaseService {
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
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<DatabaseResponse<any>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // Get notification to check ownership
      const { data: notification } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', notificationId)
        .single();

      if (!notification) {
        throw new Error('Notificatie niet gevonden');
      }

      // Check if user owns this notification
      if (notification.user_id !== currentUserId) {
        const hasPermission = await this.checkUserPermission(currentUserId, ['Beheerder']);
        if (!hasPermission) {
          throw new Error('Geen toegang tot deze notificatie');
        }
      }

      const { data, error } = await supabase
        .from('notifications')
        .update({
          read: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', notificationId)
        .select()
        .single();

      if (error) {
        throw this.handleDatabaseError(error);
      }

      await this.createAuditLog('READ', 'notifications', notificationId, notification, data);

      return { data, error: null };
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId?: string): Promise<DatabaseResponse<number>> {
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
          error: new Error('Geen toegang tot deze notificaties'),
          success: false,
        };
      }
    }

    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('notifications')
        .update({
          read: true,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', targetUserId)
        .eq('read', false)
        .select('id');

      if (error) {
        throw this.handleDatabaseError(error);
      }

      const updatedCount = data?.length || 0;

      await this.createAuditLog('MARK_ALL_READ', 'notifications', null, null, {
        userId: targetUserId,
        updatedCount
      });

      return { data: updatedCount, error: null };
    });
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<DatabaseResponse<boolean>> {
    const currentUserId = await this.getCurrentUserId();
    console.log('NotificationService.deleteNotification called for:', notificationId, 'by user:', currentUserId);
    
    if (!currentUserId) {
      console.error('No current user ID found');
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // Get notification to check ownership
      console.log('Fetching notification to verify ownership...');
      const { data: notification, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', notificationId)
        .single();

      if (fetchError) {
        console.error('Error fetching notification:', fetchError);
        throw new Error('Notificatie niet gevonden');
      }

      if (!notification) {
        console.error('Notification not found in database');
        throw new Error('Notificatie niet gevonden');
      }

      console.log('Found notification:', notification);

      // Check if user owns this notification
      if (notification.user_id !== currentUserId) {
        console.error('User does not own this notification:', notification.user_id, 'vs', currentUserId);
        const hasPermission = await this.checkUserPermission(currentUserId, ['Beheerder']);
        if (!hasPermission) {
          throw new Error('Geen toegang tot deze notificatie');
        }
      }

      console.log('Attempting to delete notification from database...');
      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (deleteError) {
        console.error('Database delete error:', deleteError);
        throw this.handleDatabaseError(deleteError);
      }

      console.log('Notification successfully deleted from database');

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

  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(
    userIds: string[],
    notificationData: Omit<CreateNotificationData, 'userId'>
  ): Promise<DatabaseResponse<number>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    // Check if user is a manager
    const hasPermission = await this.checkUserPermission(currentUserId, ['Beheerder']);
    if (!hasPermission) {
      return {
        data: null,
        error: new Error('Geen toegang tot bulk notificaties'),
        success: false,
      };
    }

    const sanitizedData = this.sanitizeInput(notificationData);

    return this.executeQuery(async () => {
      const notifications = userIds.map(userId => ({
        user_id: userId,
        type: sanitizedData.type,
        title: sanitizedData.title,
        message: sanitizedData.message,
        related_id: sanitizedData.relatedId,
        related_type: sanitizedData.relatedType,
        read: false,
      }));

      const { data, error } = await supabase
        .from('notifications')
        .insert(notifications)
        .select('id');

      if (error) {
        throw this.handleDatabaseError(error);
      }

      const createdCount = data?.length || 0;

      await this.createAuditLog('BULK_CREATE', 'notifications', null, null, {
        userIds,
        notificationData: sanitizedData,
        createdCount
      });

      return { data: createdCount, error: null };
    });
  }

  /**
   * Get notification statistics
   */
  async getNotificationStatistics(): Promise<DatabaseResponse<any>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    const hasPermission = await this.checkUserPermission(currentUserId, ['Beheerder']);
    if (!hasPermission) {
      return {
        data: null,
        error: new Error('Geen toegang tot statistieken'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('type, read, created_at');

      if (error) {
        throw this.handleDatabaseError(error);
      }

      const totalNotifications = notifications?.length || 0;
      const readNotifications = notifications?.filter(n => n.read).length || 0;
      const unreadNotifications = totalNotifications - readNotifications;

      // Notifications by type
      const notificationsByType = notifications?.reduce((acc: any, notification: any) => {
        acc[notification.type] = (acc[notification.type] || 0) + 1;
        return acc;
      }, {}) || {};

      const statistics = {
        totalNotifications,
        readNotifications,
        unreadNotifications,
        readRate: totalNotifications > 0 ? (readNotifications / totalNotifications) * 100 : 0,
        notificationsByType,
      };

      return { data: statistics, error: null };
    });
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
