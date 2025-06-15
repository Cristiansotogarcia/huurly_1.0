
import { supabase } from '@/integrations/supabase/client';
import { DatabaseService, DatabaseResponse } from '@/lib/database';

export class NotificationReadService extends DatabaseService {
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
}
