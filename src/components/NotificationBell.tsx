
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
            onMarkAllAsRead={markAllAsRead}
          />
          
          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                Laden...
              </div>
            ) : notifications.length === 0 ? (
              <EmptyNotifications />
            ) : (
              <NotificationList
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
              />
            )}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
