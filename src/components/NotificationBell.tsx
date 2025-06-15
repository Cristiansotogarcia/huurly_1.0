
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotificationState } from '@/hooks/notifications/useNotificationState';
import { useNotificationActions } from '@/hooks/notifications/useNotificationActions';
import { NotificationList } from '@/components/notifications/NotificationList';
import { NotificationHeader } from '@/components/notifications/NotificationHeader';
import { EmptyNotifications } from '@/components/notifications/EmptyNotifications';
import { Bell } from 'lucide-react';

const NotificationBell = () => {
  const { notifications, unreadCount, isLoading } = useNotificationState();
  const { markAsRead, deleteNotification, markAllAsRead } = useNotificationActions();

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Handle navigation based on notification type
    if (notification.related_type && notification.related_id) {
      console.log(`Navigate to ${notification.related_type}:${notification.related_id}`);
    }
  };

  const handleDeleteNotification = (notificationId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    deleteNotification(notificationId);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 min-w-[1.2rem] h-5 text-xs px-1 py-0 flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="max-h-96 flex flex-col">
          <NotificationHeader 
            unreadCount={unreadCount}
            totalCount={notifications.length}
            isLoading={isLoading}
            onMarkAllAsRead={markAllAsRead}
          />
          
          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                Laden...
              </div>
            ) : notifications.length === 0 ? (
              <EmptyNotifications />
            ) : (
              <NotificationList
                notifications={notifications}
                isDeleting={null}
                onNotificationClick={handleNotificationClick}
                onDeleteNotification={handleDeleteNotification}
              />
            )}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
