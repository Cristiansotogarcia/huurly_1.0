
import { useState, useEffect, useRef } from 'react';
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
  const [deletedNotificationIds, setDeletedNotificationIds] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const { toast } = useToast();
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  const loadNotifications = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      console.log('Loading notifications for user:', user.id);
      const result = await notificationService.getUserNotifications();
      if (result.success && result.data) {
        console.log('Loaded notifications:', result.data.length);
        // Filter out deleted notifications
        const filteredNotifications = result.data.filter((n: Notification) => 
          !deletedNotificationIds.has(n.id)
        );
        setNotifications(filteredNotifications);
        
        // Count unread notifications
        const unread = filteredNotifications.filter((n: Notification) => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
       logger.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      // Clean up if user logs out
      if (channelRef.current && isSubscribedRef.current) {
        console.log('Cleaning up notification subscription - user logged out');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
      return;
    }

    // Load initial notifications
    loadNotifications();

    // Only set up real-time subscription if we haven't already
    if (!channelRef.current && !isSubscribedRef.current) {
      console.log('Setting up real-time notification subscription for user:', user.id);
      
      channelRef.current = supabase
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
              // Don't add if it's in the deleted list
              if (deletedNotificationIds.has(newNotif.id)) return;
              
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
              // Don't update if it's in the deleted list
              if (deletedNotificationIds.has(updated.id)) return;
              
              setNotifications(current => {
                const newList = current.map(n => (n.id === updated.id ? updated : n));
                console.log('Updated notification via realtime:', newList.length);
                
                // Recalculate unread count
                const unread = newList.filter(n => !n.read).length;
                setUnreadCount(unread);
                return newList;
              });
            }
            
            if (payload.eventType === 'DELETE') {
              const oldId = (payload.old as Notification).id;
              console.log('Real-time DELETE event for notification:', oldId);
              // Add to deleted list to prevent re-adding
              setDeletedNotificationIds(prev => new Set([...prev, oldId]));
              setNotifications(current => {
                const filtered = current.filter(n => n.id !== oldId);
                console.log('Filtered notifications after realtime delete:', filtered.length);
                
                // Recalculate unread count
                const unread = filtered.filter(n => !n.read).length;
                setUnreadCount(unread);
                return filtered;
              });
            }
          }
        );

      // Subscribe to the channel
      channelRef.current.subscribe((status: string) => {
        console.log('Notification channel subscription status:', status);
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
        }
      });
    }

    return () => {
      // Only clean up on unmount, not on every effect run
      if (channelRef.current && isSubscribedRef.current) {
        console.log('Cleaning up notification subscription');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };
  }, [user?.id]); // Only depend on user.id, not the entire user object or other dependencies

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

    // Find the notification before deleting
    const notificationToDelete = notifications.find(n => n.id === notificationId);
    if (!notificationToDelete) {
      console.error('Notification not found in local state:', notificationId);
      return;
    }

    console.log('Found notification to delete:', notificationToDelete);

    setIsDeleting(notificationId);
    
    try {
      console.log('Calling notificationService.deleteNotification...');
      
      // Add to deleted list immediately
      setDeletedNotificationIds(prev => new Set([...prev, notificationId]));
      
      // Remove from local state immediately
      setNotifications(current => {
        const filtered = current.filter(n => n.id !== notificationId);
        console.log('Notifications after filter:', filtered.length);
        return filtered;
      });

      // Update unread count
      if (!notificationToDelete.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      const result = await notificationService.deleteNotification(notificationId);
      console.log('Delete service result:', result);
      
      if (result.success) {
        console.log('Service reports successful deletion');
        
        toast({
          title: "Notificatie verwijderd",
          description: "De notificatie is succesvol verwijderd.",
        });

        // Reload notifications to verify deletion
        console.log('Reloading notifications to verify deletion...');
        await loadNotifications();
      } else {
        console.error('Delete failed:', result.error);
        // Revert changes if deletion failed
        setDeletedNotificationIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(notificationId);
          return newSet;
        });
        await loadNotifications(); // Reload to get correct state
        
        toast({
          title: "Fout bij verwijderen",
          description: result.error?.message || "Er is iets misgegaan bij het verwijderen van de notificatie.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Delete notification error:', error);
      logger.error('Error deleting notification:', error);
      
      // Revert changes if deletion failed
      setDeletedNotificationIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
      await loadNotifications(); // Reload to get correct state
      
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
