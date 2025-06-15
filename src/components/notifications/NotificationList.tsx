
import React from 'react';
import { NotificationItem } from './NotificationItem';

interface NotificationListProps {
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    created_at: string;
    related_type?: string;
    related_id?: string;
  }>;
  isDeleting: string | null;
  onNotificationClick: (notification: any) => void;
  onDeleteNotification: (id: string, event?: React.MouseEvent) => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  isDeleting,
  onNotificationClick,
  onDeleteNotification,
}) => {
  return (
    <div className="divide-y divide-gray-100">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClick={() => onNotificationClick(notification)}
          onDelete={(event) => onDeleteNotification(notification.id, event)}
        />
      ))}
    </div>
  );
};
