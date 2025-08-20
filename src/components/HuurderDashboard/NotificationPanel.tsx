import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  Check, 
  X, 
  User, 
  Home, 
  MessageSquare, 
  CreditCard,
  Calendar,
  Star,
  AlertCircle
} from 'lucide-react';
import { notificationService, Notification } from '@/services/NotificationService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface NotificationPanelProps {
  userId: string;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (userId) {
      loadNotifications();
    }
  }, [userId]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const result = await notificationService.getUserNotifications(userId);
      if (result.success && result.data) {
        setNotifications(result.data);
        setUnreadCount(result.data.filter(n => !n.gelezen).length);
      }
    } catch (error) {
      toast({
        title: 'Fout bij laden',
        description: 'Er is een fout opgetreden bij het laden van je notificaties.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const result = await notificationService.markAsRead(notificationId);
      if (result.success) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, gelezen: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      toast({
        title: 'Fout bij markeren',
        description: 'Er is een fout opgetreden bij het markeren als gelezen.',
        variant: 'destructive',
      });
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    
    try {
      const result = await notificationService.markAllAsRead(userId);
      if (result.success) {
        setNotifications(prev => prev.map(n => ({ ...n, gelezen: true })));
        setUnreadCount(0);
        toast({
          title: 'Alle notificaties gelezen',
          description: 'Alle notificaties zijn gemarkeerd als gelezen.',
        });
      }
    } catch (error) {
      toast({
        title: 'Fout bij markeren',
        description: 'Er is een fout opgetreden bij het markeren van alle notificaties.',
        variant: 'destructive',
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'nieuwe_match':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'nieuw_bericht':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'nieuwe_aanvraag':
      case 'aanvraag_geaccepteerd':
      case 'aanvraag_afgewezen':
        return <User className="h-4 w-4 text-green-500" />;
      case 'document_goedgekeurd':
      case 'document_afgekeurd':
        return <CreditCard className="h-4 w-4 text-purple-500" />;
      case 'systeem':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'nieuwe_match':
        return 'bg-yellow-50 border-yellow-200';
      case 'nieuw_bericht':
        return 'bg-blue-50 border-blue-200';
      case 'nieuwe_aanvraag':
      case 'aanvraag_geaccepteerd':
      case 'aanvraag_afgewezen':
        return 'bg-green-50 border-green-200';
      case 'document_goedgekeurd':
      case 'document_afgekeurd':
        return 'bg-purple-50 border-purple-200';
      case 'systeem':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('nl-NL', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('nl-NL', { day: '2-digit', month: 'short' });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaties
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="h-5 w-5" />
          Notificaties
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
        {notifications.length > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            Alles gelezen
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        {notifications.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <Bell className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Geen notificaties</h3>
            <p className="text-gray-500">
              Je hebt geen nieuwe notificaties. Hier verschijnen belangrijke updates.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-full max-h-96">
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 ${
                    notification.gelezen 
                      ? 'bg-white' 
                      : 'bg-blue-50 border-l-4 border-blue-500'
                  } ${getNotificationColor(notification.type)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.titel}
                        </p>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500">
                            {formatDate(notification.aangemaakt_op)}
                          </span>
                          {!notification.gelezen && (
                            <Badge variant="secondary" className="h-2 w-2 p-0 bg-blue-500"></Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.inhoud}
                      </p>
                      {notification.actie_url && (
                        <div className="flex items-center text-xs text-gray-500 mt-2">
                          <span>Actie: {notification.actie_url}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col space-y-1">
                      {!notification.gelezen && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationPanel;
