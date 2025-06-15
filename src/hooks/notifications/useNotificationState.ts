
import { useState, useCallback } from 'react';
import { Notification, NotificationState } from './types';

export const useNotificationState = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deletedNotificationIds, setDeletedNotificationIds] = useState<Set<string>>(new Set());

  const updateNotifications = useCallback((newNotifications: Notification[]) => {
    const filteredNotifications = newNotifications.filter((n: Notification) => 
      !deletedNotificationIds.has(n.id)
    );
    setNotifications(filteredNotifications);
    
    const unread = filteredNotifications.filter((n: Notification) => !n.read).length;
    setUnreadCount(unread);
  }, [deletedNotificationIds]);

  const addNotification = useCallback((notification: Notification) => {
    if (deletedNotificationIds.has(notification.id)) return;
    
    setNotifications(current => {
      const exists = current.find(n => n.id === notification.id);
      if (exists) return current;
      
      const updated = [notification, ...current];
      console.log('Added new notification via realtime:', updated.length);
      return updated;
    });
    if (!notification.read) {
      setUnreadCount(prev => prev + 1);
    }
  }, [deletedNotificationIds]);

  const updateNotification = useCallback((updatedNotification: Notification) => {
    if (deletedNotificationIds.has(updatedNotification.id)) return;
    
    setNotifications(current => {
      const newList = current.map(n => (n.id === updatedNotification.id ? updatedNotification : n));
      console.log('Updated notification via realtime:', newList.length);
      
      const unread = newList.filter(n => !n.read).length;
      setUnreadCount(unread);
      return newList;
    });
  }, [deletedNotificationIds]);

  const removeNotification = useCallback((notificationId: string) => {
    console.log('Real-time DELETE event for notification:', notificationId);
    // This function handles the case where a notification is deleted on another device.
    // It should remove the notification from the state.
    setNotifications(current => {
      const notificationExists = current.some(n => n.id === notificationId);
      if (!notificationExists) return current;

      const wasRead = current.find(n => n.id === notificationId)?.read ?? true;
      const filtered = current.filter(n => n.id !== notificationId);
      
      console.log('Filtered notifications after realtime delete:', filtered.length);
      
      if (!wasRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      return filtered;
    });
  }, []);

  const markAsDeleted = useCallback((notificationId: string) => {
    setDeletedNotificationIds(prev => new Set(prev).add(notificationId));
  }, []);

  const unmarkAsDeleted = useCallback((notificationId: string) => {
    setDeletedNotificationIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(notificationId);
      return newSet;
    });
  }, []);

  const removeFromState = useCallback((notificationId: string, wasRead: boolean) => {
    setNotifications(current => current.filter(n => n.id !== notificationId));
    if (!wasRead) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, []);

  const sortedNotifications = [...notifications].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return {
    notifications: sortedNotifications,
    unreadCount,
    isLoading,
    isDeleting,
    deletedNotificationIds,
    setIsLoading,
    setIsDeleting,
    updateNotifications,
    addNotification,
    updateNotification,
    removeNotification,
    markAsDeleted,
    unmarkAsDeleted,
    removeFromState
  };
};
