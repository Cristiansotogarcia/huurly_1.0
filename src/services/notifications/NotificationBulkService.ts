
import { supabase } from '@/integrations/supabase/client';
import { DatabaseService, DatabaseResponse } from '@/lib/database';
import { CreateNotificationData } from './BaseNotificationService';

export class NotificationBulkService extends DatabaseService {
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
}
