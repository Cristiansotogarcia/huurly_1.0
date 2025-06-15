
import { DatabaseResponse, PaginationOptions, SortOptions } from '@/lib/database';
import { BaseNotificationService, CreateNotificationData, NotificationFilters } from './notifications/BaseNotificationService';
import { NotificationReadService } from './notifications/NotificationReadService';
import { NotificationBulkService } from './notifications/NotificationBulkService';
import { NotificationStatisticsService } from './notifications/NotificationStatisticsService';

export type { CreateNotificationData, NotificationFilters } from './notifications/BaseNotificationService';

export class NotificationService {
  private baseService: BaseNotificationService;
  private readService: NotificationReadService;
  private bulkService: NotificationBulkService;
  private statisticsService: NotificationStatisticsService;

  constructor() {
    this.baseService = new BaseNotificationService();
    this.readService = new NotificationReadService();
    this.bulkService = new NotificationBulkService();
    this.statisticsService = new NotificationStatisticsService();
  }

  // Base notification operations
  async createNotification(data: CreateNotificationData): Promise<DatabaseResponse<any>> {
    return this.baseService.createNotification(data);
  }

  async getUserNotifications(
    userId?: string,
    filters?: NotificationFilters,
    pagination?: PaginationOptions,
    sort?: SortOptions
  ): Promise<DatabaseResponse<any[]>> {
    return this.baseService.getUserNotifications(userId, filters, pagination, sort);
  }

  async deleteNotification(notificationId: string): Promise<DatabaseResponse<boolean>> {
    return this.baseService.deleteNotification(notificationId);
  }

  async getUnreadCount(userId?: string): Promise<DatabaseResponse<number>> {
    return this.baseService.getUnreadCount(userId);
  }

  // Read operations
  async markAsRead(notificationId: string): Promise<DatabaseResponse<any>> {
    return this.readService.markAsRead(notificationId);
  }

  async markAllAsRead(userId?: string): Promise<DatabaseResponse<number>> {
    return this.readService.markAllAsRead(userId);
  }

  // Bulk operations
  async sendBulkNotifications(
    userIds: string[],
    notificationData: Omit<CreateNotificationData, 'userId'>
  ): Promise<DatabaseResponse<number>> {
    return this.bulkService.sendBulkNotifications(userIds, notificationData);
  }

  // Statistics operations
  async getNotificationStatistics(): Promise<DatabaseResponse<any>> {
    return this.statisticsService.getNotificationStatistics();
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
