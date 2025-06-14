
import { ScrollArea } from '@/components/ui/scroll-area';
import { NotificationItem } from './NotificationItem';
import { EmptyNotifications } from './EmptyNotifications';

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

interface NotificationListProps {
  notifications: Notification[];
  isDeleting: string | null;
  onNotificationClick: (notification: Notification) => void;
  onDeleteNotification: (notificationId: string, event?: React.MouseEvent) => void;
}

export const NotificationList = ({
  notifications,
  isDeleting,
  onNotificationClick,
  onDeleteNotification
}: NotificationListProps) => {
  if (notifications.length === 0) {
    return <EmptyNotifications />;
  }

  return (
    <ScrollArea className="h-96">
      <div className="space-y-1">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            isDeleting={isDeleting === notification.id}
            onNotificationClick={onNotificationClick}
            onDeleteNotification={onDeleteNotification}
          />
        ))}
      </div>
    </ScrollArea>
  );
};
