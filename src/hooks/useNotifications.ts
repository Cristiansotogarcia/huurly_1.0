import { useState, useEffect } from 'react';
import { notificationService, Notification } from '@/services/NotificationService';
import { useToast } from '@/hooks/use-toast';

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refreshNotifications: (userId: string) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<boolean>;
  markAllAsRead: (userId: string) => Promise<boolean>;
  getUnreadCount: (userId: string) => Promise<number>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const refreshNotifications = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await notificationService.getUserNotifications(userId);
      if (result.success && result.data) {
        setNotifications(result.data);
        setUnreadCount(result.data.filter(n => !n.gelezen).length);
      } else {
        throw new Error(result.error?.message || 'Fout bij laden van notificaties');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Onbekende fout';
      setError(errorMessage);
      toast({
        title: 'Fout bij laden',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string): Promise<boolean> => {
    try {
      const result = await notificationService.markAsRead(notificationId);
      if (result.success) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, gelezen: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        return true;
      } else {
        throw new Error(result.error?.message || 'Fout bij markeren als gelezen');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Onbekende fout';
      setError(errorMessage);
      toast({
        title: 'Fout bij markeren',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  };

  const markAllAsRead = async (userId: string): Promise<boolean> => {
    try {
      const result = await notificationService.markAllAsRead(userId);
      if (result.success) {
        setNotifications(prev => prev.map(n => ({ ...n, gelezen: true })));
        setUnreadCount(0);
        toast({
          title: 'Alle notificaties gelezen',
          description: 'Alle notificaties zijn gemarkeerd als gelezen.',
        });
        return true;
      } else {
        throw new Error(result.error?.message || 'Fout bij markeren van alle notificaties');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Onbekende fout';
      setError(errorMessage);
      toast({
        title: 'Fout bij markeren',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  };

  const getUnreadCount = async (userId: string): Promise<number> => {
    try {
      const result = await notificationService.getUnreadCount(userId);
      if (result.success && result.data !== null) {
        return result.data;
      }
      return 0;
    } catch (err) {
      return 0;
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount
  };
};
