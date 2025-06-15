
import { useToast } from '@/hooks/use-toast';
import { notificationService } from '@/services/NotificationService';
import { logger } from '@/lib/logger';
import { Notification } from './types';

interface UseNotificationActionsProps {
  onReload: () => Promise<void>;
  onMarkAsDeleted: (notificationId: string) => void;
  onUnmarkAsDeleted: (notificationId: string) => void;
  onRemoveFromState: (notificationId: string, wasRead: boolean) => void;
  setIsDeleting: (id: string | null) => void;
}

export const useNotificationActions = ({
  onReload,
  onMarkAsDeleted,
  onUnmarkAsDeleted,
  onRemoveFromState,
  setIsDeleting
}: UseNotificationActionsProps) => {
  const { toast } = useToast();

  const markAsRead = async (notificationId: string) => {
    try {
      const result = await notificationService.markAsRead(notificationId);
      if (result.success) {
        console.log('Marked notification as read:', notificationId);
      }
    } catch (error) {
      logger.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const result = await notificationService.markAllAsRead();
      if (result.success) {
        console.log('Marked all notifications as read');
      }
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string, notifications: Notification[], event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    console.log('deleteNotification called with ID:', notificationId);

    const notificationToDelete = notifications.find(n => n.id === notificationId);
    if (!notificationToDelete) {
      console.error('Notification not found in local state:', notificationId);
      return;
    }

    console.log('Found notification to delete:', notificationToDelete);

    setIsDeleting(notificationId);
    
    try {
      console.log('Calling notificationService.deleteNotification...');
      
      onMarkAsDeleted(notificationId);
      onRemoveFromState(notificationId, notificationToDelete.read);

      const result = await notificationService.deleteNotification(notificationId);
      console.log('Delete service result:', result);
      
      if (result.success) {
        console.log('Service reports successful deletion');
        
        toast({
          title: "Notificatie verwijderd",
          description: "De notificatie is succesvol verwijderd.",
        });

        console.log('Reloading notifications to verify deletion...');
        await onReload();
      } else {
        console.error('Delete failed:', result.error);
        onUnmarkAsDeleted(notificationId);
        await onReload();
        
        toast({
          title: "Fout bij verwijderen",
          description: result.error?.message || "Er is iets misgegaan bij het verwijderen van de notificatie.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Delete notification error:', error);
      logger.error('Error deleting notification:', error);
      
      onUnmarkAsDeleted(notificationId);
      await onReload();
      
      toast({
        title: "Fout bij verwijderen",
        description: "Er is een onverwachte fout opgetreden.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  return {
    markAsRead,
    markAllAsRead,
    deleteNotification,
    handleNotificationClick
  };
};
