
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { notificationService } from '@/services/NotificationService';
import { logger } from '@/lib/logger';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

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
    if (!user) return;

    // Load initial notifications
    loadNotifications();

    // Set up real-time subscription
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        payload => {
          console.log('Real-time notification event:', payload.eventType, payload);
          
          if (payload.eventType === 'INSERT') {
            const newNotif = payload.new as Notification;
            setNotifications(current => {
              // Check if notification already exists to prevent duplicates
              const exists = current.find(n => n.id === newNotif.id);
              if (exists) return current;
              
              const updated = [newNotif, ...current];
              console.log('Added new notification via realtime:', updated.length);
              return updated;
            });
            setUnreadCount(prev => prev + 1);
            toast({ title: newNotif.title, description: newNotif.message });
          }
          
          if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Notification;
            setNotifications(current => {
              const newList = current.map(n => (n.id === updated.id ? updated : n));
              console.log('Updated notification via realtime:', newList.length);
              return newList;
            });
            // Recalculate unread count
            setNotifications(current => {
              const unread = current.filter(n => !n.read).length;
              setUnreadCount(unread);
              return current;
            });
          }
          
          if (payload.eventType === 'DELETE') {
            const oldId = (payload.old as Notification).id;
            console.log('Real-time DELETE event for notification:', oldId);
            setNotifications(current => {
              const filtered = current.filter(n => n.id !== oldId);
              console.log('Filtered notifications after realtime delete:', filtered.length);
              return filtered;
            });
            // Recalculate unread count
            setNotifications(current => {
              const unread = current.filter(n => !n.read).length;
              setUnreadCount(unread);
              return current;
            });
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up notification subscription');
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  const markAsRead = async (notificationId: string) => {
    try {
      const result = await notificationService.markAsRead(notificationId);
      if (result.success) {
        // Local state will be updated via real-time subscription
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
        // Local state will be updated via real-time subscription
        console.log('Marked all notifications as read');
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
        
        toast({
          title: "Notificatie verwijderd",
          description: "De notificatie is succesvol verwijderd.",
        });

        // The real-time subscription will handle the state update
        // No need to manually update local state here
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
