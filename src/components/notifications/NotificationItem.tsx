
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';
import { getNotificationIcon, getNotificationColor } from '@/utils/notificationUtils';

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

interface NotificationItemProps {
  notification: Notification;
  isDeleting: boolean;
  onNotificationClick: (notification: Notification) => void;
  onDeleteNotification: (notificationId: string, event?: React.MouseEvent) => void;
}

export const NotificationItem = ({
  notification,
  isDeleting,
  onNotificationClick,
  onDeleteNotification
}: NotificationItemProps) => {
  
  const handleDeleteClick = (event: React.MouseEvent) => {
    console.log('Delete button clicked for notification:', notification.id);
    event.preventDefault();
    event.stopPropagation();
    onDeleteNotification(notification.id, event);
  };

  return (
    <div
      className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
        !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
      }`}
      onClick={() => onNotificationClick(notification)}
    >
      <div className="flex items-start space-x-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}>
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
              {notification.title}
            </h4>
            <div className="flex items-center space-x-1 ml-2">
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="h-6 w-6 p-0 hover:bg-red-100"
              >
                <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-600" />
              </Button>
            </div>
          </div>
          <p className={`text-xs mt-1 ${!notification.read ? 'text-gray-700' : 'text-gray-500'}`}>
            {notification.message}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {formatDistanceToNow(new Date(notification.created_at), { 
              addSuffix: true, 
              locale: nl 
            })}
          </p>
        </div>
      </div>
    </div>
  );
};
