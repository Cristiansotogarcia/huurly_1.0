
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { notificationService } from '@/services/NotificationService';
import { logger } from '@/lib/logger';
import { useNotificationState } from './notifications/useNotificationState';
import { useNotificationRealtime } from './notifications/useNotificationRealtime';
import { useNotificationActions as useNotificationActionsLogic } from './notifications/useNotificationActions';

export const useNotificationActions = () => {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    isLoading,
    isDeleting,
    setIsLoading,
    setIsDeleting,
    updateNotifications,
    addNotification,
    updateNotification,
    removeNotification,
    removeNotificationImmediate
  } = useNotificationState();

  const loadNotifications = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      console.log('Loading notifications for user:', user.id);
      const result = await notificationService.getUserNotifications();
      if (result.success && result.data) {
        console.log('Loaded notifications from server:', result.data.length);
        updateNotifications(result.data);
      } else {
        console.error('Failed to load notifications:', result.error);
        // Clear notifications on error to prevent stale data
        updateNotifications([]);
      }
    } catch (error) {
      logger.error('Error loading notifications:', error);
      updateNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
    } else {
      // Clear notifications when user logs out
      updateNotifications([]);
    }
  }, [user?.id]);

  useNotificationRealtime({
    onNotificationAdded: addNotification,
    onNotificationUpdated: updateNotification,
    onNotificationDeleted: removeNotification
  });

  const actions = useNotificationActionsLogic({
    onReload: loadNotifications,
    onRemoveFromState: removeNotificationImmediate,
    setIsDeleting
  });

  console.log('Current notifications count:', notifications.length);

  return {
    notifications,
    unreadCount,
    isLoading,
    isDeleting,
    markAsRead: actions.markAsRead,
    markAllAsRead: actions.markAllAsRead,
    deleteNotification: (notificationId: string, event?: React.MouseEvent) => 
      actions.deleteNotification(notificationId, notifications, event),
    handleNotificationClick: actions.handleNotificationClick
  };
};
