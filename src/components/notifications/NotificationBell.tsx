
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationActions } from '@/hooks/useNotificationActions';
import { NotificationHeader } from './NotificationHeader';
import { NotificationList } from './NotificationList';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    isLoading,
    isDeleting,
    markAllAsRead,
    deleteNotification,
    handleNotificationClick
  } = useNotificationActions();

  if (!user) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <NotificationHeader
              unreadCount={unreadCount}
              totalCount={notifications.length}
              isLoading={isLoading}
              onMarkAllAsRead={markAllAsRead}
            />
          </CardHeader>
          <CardContent className="p-0">
            <NotificationList
              notifications={notifications}
              isDeleting={isDeleting}
              onNotificationClick={handleNotificationClick}
              onDeleteNotification={deleteNotification}
            />
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
