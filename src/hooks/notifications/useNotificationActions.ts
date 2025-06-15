
import { useCallback } from 'react';
import { notificationService } from '@/services/NotificationService';
import { useToast } from '@/hooks/use-toast';

export const useNotificationActions = () => {
  const { toast } = useToast();

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const result = await notificationService.markAsRead(notificationId);
      if (!result.success) {
        console.error('Failed to mark notification as read:', result.error);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const result = await notificationService.deleteNotification(notificationId);
      if (result.success) {
        toast({
          title: "Notificatie verwijderd",
          description: "De notificatie is succesvol verwijderd.",
        });
      } else {
        console.error('Failed to delete notification:', result.error);
        toast({
          title: "Fout",
          description: "Kon notificatie niet verwijderen.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Fout",
        description: "Er is een onverwachte fout opgetreden.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const markAllAsRead = useCallback(async (userId?: string) => {
    try {
      const result = await notificationService.markAllAsRead(userId);
      if (result.success) {
        toast({
          title: "Alle notificaties gelezen",
          description: "Alle notificaties zijn gemarkeerd als gelezen.",
        });
      } else {
        console.error('Failed to mark all notifications as read:', result.error);
        toast({
          title: "Fout",
          description: "Kon niet alle notificaties markeren als gelezen.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Fout",
        description: "Er is een onverwachte fout opgetreden.",
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    markAsRead,
    deleteNotification,
    markAllAsRead,
  };
};
