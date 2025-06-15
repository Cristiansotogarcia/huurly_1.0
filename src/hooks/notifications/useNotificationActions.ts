
import { useCallback } from 'react';
import { notificationService } from '@/services/NotificationService';
import { logger } from '@/lib/logger';
import { Notification } from './types';

interface UseNotificationActionsProps {
  onReload: () => Promise<void>;
  onRemoveFromState: (notificationId: string) => void;
  setIsDeleting: (id: string | null) => void;
}

export const useNotificationActions = ({
  onReload,
  onRemoveFromState,
  setIsDeleting
}: UseNotificationActionsProps) => {

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      console.log('Marking notification as read:', notificationId);
      const result = await notificationService.markAsRead(notificationId);
      if (!result.success) {
        logger.error('Failed to mark notification as read:', result.error);
      }
    } catch (error) {
      logger.error('Error marking notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      console.log('Marking all notifications as read');
      const result = await notificationService.markAllAsRead();
      if (!result.success) {
        logger.error('Failed to mark all notifications as read:', result.error);
      } else {
        await onReload();
      }
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
    }
  }, [onReload]);

  const deleteNotification = useCallback(async (
    notificationId: string, 
    notifications: Notification[], 
    event?: React.MouseEvent
  ) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    console.log('Delete notification clicked for ID:', notificationId);
    
    // Immediately remove from UI to prevent user confusion
    onRemoveFromState(notificationId);
    setIsDeleting(notificationId);

    try {
      console.log('Calling notification service delete for:', notificationId);
      const result = await notificationService.deleteNotification(notificationId);
      
      if (result.success) {
        console.log('Notification successfully deleted from database:', notificationId);
      } else {
        console.error('Failed to delete notification from database:', result.error);
        // If deletion failed, reload to restore correct state
        await onReload();
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      // If deletion failed, reload to restore correct state
      await onReload();
    } finally {
      setIsDeleting(null);
    }
  }, [onRemoveFromState, setIsDeleting, onReload]);

  const handleNotificationClick = useCallback(async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
  }, [markAsRead]);

  return {
    markAsRead,
    markAllAsRead,
    deleteNotification,
    handleNotificationClick
  };
};
