
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { notificationService } from '@/services/NotificationService';
import { logger } from '@/lib/logger';
import { useAuth } from '@/hooks/useAuth';

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  related_id?: string;
  related_type?: string;
  created_at: string;
  updated_at: string;
}

export const useNotificationActions = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadNotifications = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      console.log('Loading notifications for user:', user.id);
      const result = await notificationService.getUserNotifications();
      if (result.success && result.data) {
        console.log('Loaded notifications:', result.data.length);
        setNotifications(result.data);
        
        // Count unread notifications
        const unread = result.data.filter((n: Notification) => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
       logger.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    try {
      const result = await notificationService.markAsRead(notificationId);
      if (result.success) {
        // Update local state immediately for better UX
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
       logger.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const result = await notificationService.markAllAsRead();
      if (result.success) {
        // Update local state immediately
        setNotifications(prev => 
          prev.map(n => ({ ...n, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
       logger.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string, event?: React.MouseEvent) => {
    // Prevent event bubbling to avoid triggering parent click handlers
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    console.log('deleteNotification called with ID:', notificationId);
    console.log('Current notifications before delete:', notifications.length);

    setIsDeleting(notificationId);
    
    try {
      console.log('Calling notificationService.deleteNotification...');
      const result = await notificationService.deleteNotification(notificationId);
      console.log('Delete service result:', result);
      
      if (result.success) {
        console.log('Service reports successful deletion');
        // Update local state immediately for better UX
        const deletedNotification = notifications.find(n => n.id === notificationId);
        console.log('Found notification to delete:', deletedNotification);
        
        setNotifications(prev => {
          const filtered = prev.filter(n => n.id !== notificationId);
          console.log('Notifications after filter:', filtered.length);
          return filtered;
        });
        
        // Update unread count if the deleted notification was unread
        if (deletedNotification && !deletedNotification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        
        toast({
          title: "Notificatie verwijderd",
          description: "De notificatie is succesvol verwijderd.",
        });

        // Reload notifications to ensure consistency with database
        console.log('Reloading notifications to verify deletion...');
        setTimeout(() => {
          loadNotifications();
        }, 500);
      } else {
        console.error('Delete failed:', result.error);
        toast({
          title: "Fout bij verwijderen",
          description: result.error?.message || "Er is iets misgegaan bij het verwijderen van de notificatie.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Delete notification error:', error);
      logger.error('Error deleting notification:', error);
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

  const sortedNotifications = [...notifications].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  console.log('Current notifications count:', sortedNotifications.length);

  return {
    notifications: sortedNotifications,
    unreadCount,
    isLoading,
    isDeleting,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    handleNotificationClick
  };
};
