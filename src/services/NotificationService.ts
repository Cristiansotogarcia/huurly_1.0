import { supabase } from '@/integrations/supabase/client';
import { DatabaseService, DatabaseResponse, PaginationOptions, SortOptions } from '@/lib/database';

export interface CreateNotificationData {
  userId: string;
  type: 'profile_match' | 'viewing_invitation' | 'payment_success' | 'payment_failed' | 'subscription_cancelled' | 'document_approved' | 'document_rejected' | 'property_application' | 'system_announcement';
  title: string;
  message: string;
  relatedId?: string;
  actionUrl?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface NotificationFilters {
  userId?: string;
  type?: string;
  isRead?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dateFrom?: string;
  dateTo?: string;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  profileMatches: boolean;
  viewingInvitations: boolean;
  paymentUpdates: boolean;
  documentUpdates: boolean;
  systemAnnouncements: boolean;
  marketingEmails: boolean;
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
          action_url: sanitizedData.actionUrl,
          priority: sanitizedData.priority || 'medium',
          is_read: false,
        })
        .select()
        .single();

      if (error) {
        throw this.handleDatabaseError(error);
      }

      await this.createAuditLog('CREATE', 'notifications', data?.id, null, data);

      // Check if user wants to receive this type of notification
      await this.processNotificationDelivery(data);

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

    // Check permissions
    const hasPermission = await this.checkUserPermission(targetUserId, ['Manager']);
    if (!hasPermission) {
      return {
        data: null,
        error: new Error('Geen toegang tot deze notificaties'),
        success: false,
      };
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

      if (filters?.isRead !== undefined) {
        query = query.eq('is_read', filters.isRead);
      }

      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
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
      const hasPermission = await this.checkUserPermission(notification.user_id, ['Manager']);
      if (!hasPermission) {
        throw new Error('Geen toegang tot deze notificatie');
      }

      const { data, error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
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
    const hasPermission = await this.checkUserPermission(targetUserId, ['Manager']);
    if (!hasPermission) {
      return {
        data: null,
        error: new Error('Geen toegang tot deze notificaties'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('user_id', targetUserId)
        .eq('is_read', false)
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
      const hasPermission = await this.checkUserPermission(notification.user_id, ['Manager']);
      if (!hasPermission) {
        throw new Error('Geen toegang tot deze notificatie');
      }

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        throw this.handleDatabaseError(error);
      }

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
    const hasPermission = await this.checkUserPermission(targetUserId, ['Manager']);
    if (!hasPermission) {
      return {
        data: null,
        error: new Error('Geen toegang tot deze gegevens'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', targetUserId)
        .eq('is_read', false);

      if (error) {
        throw this.handleDatabaseError(error);
      }

      return { data: count || 0, error: null };
    });
  }

  /**
   * Get notification preferences for a user
   */
  async getNotificationPreferences(userId?: string): Promise<DatabaseResponse<NotificationPreferences>> {
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
        error: new Error('Geen toegang tot deze voorkeuren'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (error) {
        throw this.handleDatabaseError(error);
      }

      // Return default preferences if none exist
      const defaultPreferences: NotificationPreferences = {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        profileMatches: true,
        viewingInvitations: true,
        paymentUpdates: true,
        documentUpdates: true,
        systemAnnouncements: true,
        marketingEmails: false,
      };

      const preferences = data ? {
        emailNotifications: data.email_notifications ?? defaultPreferences.emailNotifications,
        pushNotifications: data.push_notifications ?? defaultPreferences.pushNotifications,
        smsNotifications: data.sms_notifications ?? defaultPreferences.smsNotifications,
        profileMatches: data.profile_matches ?? defaultPreferences.profileMatches,
        viewingInvitations: data.viewing_invitations ?? defaultPreferences.viewingInvitations,
        paymentUpdates: data.payment_updates ?? defaultPreferences.paymentUpdates,
        documentUpdates: data.document_updates ?? defaultPreferences.documentUpdates,
        systemAnnouncements: data.system_announcements ?? defaultPreferences.systemAnnouncements,
        marketingEmails: data.marketing_emails ?? defaultPreferences.marketingEmails,
      } : defaultPreferences;

      return { data: preferences, error: null };
    });
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(
    preferences: Partial<NotificationPreferences>,
    userId?: string
  ): Promise<DatabaseResponse<NotificationPreferences>> {
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
        error: new Error('Geen toegang tot deze voorkeuren'),
        success: false,
      };
    }

    const sanitizedPreferences = this.sanitizeInput(preferences);

    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: targetUserId,
          email_notifications: sanitizedPreferences.emailNotifications,
          push_notifications: sanitizedPreferences.pushNotifications,
          sms_notifications: sanitizedPreferences.smsNotifications,
          profile_matches: sanitizedPreferences.profileMatches,
          viewing_invitations: sanitizedPreferences.viewingInvitations,
          payment_updates: sanitizedPreferences.paymentUpdates,
          document_updates: sanitizedPreferences.documentUpdates,
          system_announcements: sanitizedPreferences.systemAnnouncements,
          marketing_emails: sanitizedPreferences.marketingEmails,
        })
        .select()
        .single();

      if (error) {
        throw this.handleDatabaseError(error);
      }

      const updatedPreferences: NotificationPreferences = {
        emailNotifications: data.email_notifications,
        pushNotifications: data.push_notifications,
        smsNotifications: data.sms_notifications,
        profileMatches: data.profile_matches,
        viewingInvitations: data.viewing_invitations,
        paymentUpdates: data.payment_updates,
        documentUpdates: data.document_updates,
        systemAnnouncements: data.system_announcements,
        marketingEmails: data.marketing_emails,
      };

      await this.createAuditLog('UPDATE', 'notification_preferences', data?.id, null, updatedPreferences);

      return { data: updatedPreferences, error: null };
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
    const hasPermission = await this.checkUserPermission(currentUserId, ['Manager']);
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
        action_url: sanitizedData.actionUrl,
        priority: sanitizedData.priority || 'medium',
        is_read: false,
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

    const hasPermission = await this.checkUserPermission(currentUserId, ['Manager']);
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
        .select('type, is_read, priority, created_at');

      if (error) {
        throw this.handleDatabaseError(error);
      }

      const totalNotifications = notifications?.length || 0;
      const readNotifications = notifications?.filter(n => n.is_read).length || 0;
      const unreadNotifications = totalNotifications - readNotifications;

      // Notifications by type
      const notificationsByType = notifications?.reduce((acc: any, notification: any) => {
        acc[notification.type] = (acc[notification.type] || 0) + 1;
        return acc;
      }, {}) || {};

      // Notifications by priority
      const notificationsByPriority = notifications?.reduce((acc: any, notification: any) => {
        acc[notification.priority] = (acc[notification.priority] || 0) + 1;
        return acc;
      }, {}) || {};

      const statistics = {
        totalNotifications,
        readNotifications,
        unreadNotifications,
        readRate: totalNotifications > 0 ? (readNotifications / totalNotifications) * 100 : 0,
        notificationsByType,
        notificationsByPriority,
      };

      return { data: statistics, error: null };
    });
  }

  /**
   * Process notification delivery based on user preferences
   */
  private async processNotificationDelivery(notification: any): Promise<void> {
    try {
      // Get user preferences
      const preferencesResult = await this.getNotificationPreferences(notification.user_id);
      
      if (!preferencesResult.success || !preferencesResult.data) {
        return; // Use default behavior if preferences can't be retrieved
      }

      const preferences = preferencesResult.data;

      // Check if user wants this type of notification
      const shouldSend = this.shouldSendNotification(notification.type, preferences);
      
      if (!shouldSend) {
        // Mark as read immediately if user doesn't want this type
        await supabase
          .from('notifications')
          .update({ is_read: true, read_at: new Date().toISOString() })
          .eq('id', notification.id);
        return;
      }

      // Here you would integrate with email/SMS/push notification services
      // For now, we'll just log the delivery intent
      console.log(`Notification delivery planned for user ${notification.user_id}:`, {
        email: preferences.emailNotifications,
        push: preferences.pushNotifications,
        sms: preferences.smsNotifications,
        type: notification.type,
        title: notification.title
      });

    } catch (error) {
      console.error('Error processing notification delivery:', error);
    }
  }

  /**
   * Check if notification should be sent based on user preferences
   */
  private shouldSendNotification(type: string, preferences: NotificationPreferences): boolean {
    switch (type) {
      case 'profile_match':
        return preferences.profileMatches;
      case 'viewing_invitation':
        return preferences.viewingInvitations;
      case 'payment_success':
      case 'payment_failed':
      case 'subscription_cancelled':
        return preferences.paymentUpdates;
      case 'document_approved':
      case 'document_rejected':
        return preferences.documentUpdates;
      case 'system_announcement':
        return preferences.systemAnnouncements;
      default:
        return true; // Send by default for unknown types
    }
  }

  /**
   * Clean up old notifications
   */
  async cleanupOldNotifications(daysOld: number = 90): Promise<DatabaseResponse<number>> {
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
        error: new Error('Geen toegang tot deze functie'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const { data, error } = await supabase
        .from('notifications')
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        .eq('is_read', true)
        .select('id');

      if (error) {
        throw this.handleDatabaseError(error);
      }

      const deletedCount = data?.length || 0;

      await this.createAuditLog('CLEANUP', 'notifications', null, null, {
        daysOld,
        deletedCount,
        cutoffDate: cutoffDate.toISOString()
      });

      return { data: deletedCount, error: null };
    });
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
