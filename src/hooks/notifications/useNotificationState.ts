
import { useState, useEffect } from 'react';
import { notificationService } from '@/services/NotificationService';
import { useAuthStore } from '@/store/authStore';

interface Notification {
  id: string;
  title: string;
  message: string;
  type?: string;
  read: boolean;
  created_at: string;
  user_id: string;
}

export const useNotificationState = () => {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = async () => {
    if (!user?.id) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Load notifications
      const notificationsResult = await notificationService.getUserNotifications(
        user.id,
        undefined,
        { page: 1, limit: 50 },
        { column: 'created_at', ascending: false }
      );

      if (notificationsResult.success && notificationsResult.data) {
        setNotifications(notificationsResult.data);
      }

      // Load unread count
      const countResult = await notificationService.getUnreadCount(user.id);
      if (countResult.success && typeof countResult.data === 'number') {
        setUnreadCount(countResult.data);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user?.id]);

  return {
    notifications,
    unreadCount,
    isLoading,
    refreshNotifications: loadNotifications,
  };
};
