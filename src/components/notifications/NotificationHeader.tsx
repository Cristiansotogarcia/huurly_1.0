
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCheck } from 'lucide-react';

interface NotificationHeaderProps {
  unreadCount: number;
  totalCount: number;
  isLoading: boolean;
  onMarkAllAsRead: () => void;
}

export const NotificationHeader: React.FC<NotificationHeaderProps> = ({
  unreadCount,
  totalCount,
  isLoading,
  onMarkAllAsRead,
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200">
      <div>
        <h3 className="font-semibold text-gray-900">Notificaties</h3>
        <p className="text-sm text-gray-600">
          {unreadCount > 0 
            ? `${unreadCount} ongelezen van ${totalCount}`
            : `${totalCount} notificaties`
          }
        </p>
      </div>
      
      {unreadCount > 0 && !isLoading && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onMarkAllAsRead}
          className="text-blue-600 hover:text-blue-700"
        >
          <CheckCheck className="w-4 h-4 mr-1" />
          Alles gelezen
        </Button>
      )}
    </div>
  );
};
