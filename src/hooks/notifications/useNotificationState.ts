
import { useState, useCallback } from 'react';
import { Notification } from './types';

export const useNotificationState = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const updateNotifications = useCallback((newNotifications: Notification[]) => {
    console.log('Updating notifications with:', newNotifications.length, 'items');
    setNotifications(newNotifications);
    
    const unread = newNotifications.filter((n: Notification) => !n.read).length;
    setUnreadCount(unread);
  }, []);

  const addNotification = useCallback((notification: Notification) => {
    console.log('Adding notification via realtime:', notification.id, notification.title);
    setNotifications(current => {
      const exists = current.find(n => n.id === notification.id);
      if (exists) {
        console.log('Notification already exists, skipping add');
        return current;
      }
      
      const updated = [notification, ...current];
      console.log('Added new notification, total count:', updated.length);
      return updated;
    });
    
    if (!notification.read) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  const updateNotification = useCallback((updatedNotification: Notification) => {
    console.log('Updating notification via realtime:', updatedNotification.id);
    setNotifications(current => {
      const newList = current.map(n => 
        n.id === updatedNotification.id ? updatedNotification : n
      );
      
      const unread = newList.filter(n => !n.read).length;
      setUnreadCount(unread);
      return newList;
    });
  }, []);

  const removeNotification = useCallback((notificationId: string) => {
    console.log('Removing notification via realtime:', notificationId);
    setNotifications(current => {
      const notificationToRemove = current.find(n => n.id === notificationId);
      if (!notificationToRemove) {
        console.log('Notification not found in state, nothing to remove');
        return current;
      }

      const filtered = current.filter(n => n.id !== notificationId);
      console.log('Removed notification, remaining count:', filtered.length);
      
      if (!notificationToRemove.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      return filtered;
    });
  }, []);

  const removeNotificationImmediate = useCallback((notificationId: string) => {
    console.log('Immediately removing notification from state:', notificationId);
    setNotifications(current => {
      const notificationToRemove = current.find(n => n.id === notificationId);
      if (!notificationToRemove) return current;

      const filtered = current.filter(n => n.id !== notificationId);
      
      if (!notificationToRemove.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      return filtered;
    });
  }, []);

  const sortedNotifications = [...notifications].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return {
    notifications: sortedNotifications,
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
  };
};
