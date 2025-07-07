import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { notificationService, Notification } from '@/services/NotificationService';
import { Bell, Check, CheckCheck, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && user?.id) {
      loadNotifications();
    }
  }, [isOpen, user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to real-time notifications
    const unsubscribe = notificationService.subscribeToNotifications(
      user.id,
      (newNotification) => {
        setNotifications((prev) => [newNotification, ...prev]);
        toast({
          title: newNotification.titel,
          description: newNotification.inhoud,
        });
      }
    );

    return unsubscribe;
  }, [user?.id, toast]);

  const loadNotifications = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await notificationService.getUserNotifications(user.id);
      if (response.success && response.data) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await notificationService.markAsRead(notificationId);
      if (response.success) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, gelezen: true } : n
          )
        );
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      const response = await notificationService.markAllAsRead(user.id);
      if (response.success) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, gelezen: true }))
        );
        toast({
          title: 'Alle notificaties gemarkeerd als gelezen',
        });
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'document_goedgekeurd':
        return '✅';
      case 'document_afgekeurd':
        return '❌';
      case 'nieuwe_aanvraag':
        return '🏠';
      case 'aanvraag_geaccepteerd':
        return '🎉';
      case 'aanvraag_afgewezen':
        return '😔';
      case 'nieuw_bericht':
        return '💬';
      case 'profiel_bekeken':
        return '👀';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'document_goedgekeurd':
      case 'aanvraag_geaccepteerd':
        return 'bg-green-100 text-green-800';
      case 'document_afgekeurd':
      case 'aanvraag_afgewezen':
        return 'bg-red-100 text-red-800';
      case 'nieuwe_aanvraag':
        return 'bg-blue-100 text-blue-800';
      case 'nieuw_bericht':
        return 'bg-purple-100 text-purple-800';
      case 'profiel_bekeken':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notificaties
          </CardTitle>
          <div className="flex items-center gap-2">
            {notifications.some((n) => !n.gelezen) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-blue-600 hover:text-blue-700"
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                Alles lezen
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Notificaties laden...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Geen notificaties
              </h3>
              <p className="text-gray-600">
                Je bent helemaal bij met je notificaties!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.gelezen ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-2xl">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">
                            {notification.titel}
                          </h4>
                          <Badge className={getNotificationColor(notification.type)}>
                            {notification.type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-gray-700 mb-2">{notification.inhoud}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(notification.aangemaakt_op), {
                              addSuffix: true,
                              locale: nl,
                            })}
                          </span>
                          {notification.actie_url && (
                            <Button
                              variant="link"
                              size="sm"
                              className="text-blue-600 p-0 h-auto"
                              onClick={() => {
                                window.location.href = notification.actie_url!;
                              }}
                            >
                              Bekijken →
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    {!notification.gelezen && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="ml-2"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};