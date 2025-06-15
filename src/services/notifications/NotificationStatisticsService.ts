
import { supabase } from '@/integrations/supabase/client';
import { DatabaseService, DatabaseResponse } from '@/lib/database';

export class NotificationStatisticsService extends DatabaseService {
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
