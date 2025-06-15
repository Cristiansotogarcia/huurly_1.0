
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, FileText, User, CreditCard, AlertCircle, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';

interface NotificationItemProps {
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    created_at: string;
    related_type?: string;
    related_id?: string;
  };
  onClick: () => void;
  onDelete: (event?: React.MouseEvent) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClick,
  onDelete,
}) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'document_status':
        return <FileText className="w-4 h-4" />;
      case 'profile_match':
        return <User className="w-4 h-4" />;
      case 'payment_required':
        return <CreditCard className="w-4 h-4" />;
      case 'viewing_invitation':
        return <MessageSquare className="w-4 h-4" />;
      case 'system':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'document_status':
        return 'text-blue-600';
      case 'profile_match':
        return 'text-green-600';
      case 'payment_required':
        return 'text-red-600';
      case 'viewing_invitation':
        return 'text-purple-600';
      case 'system':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: nl,
  });

  return (
    <div
      className={`group relative p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
        !notification.read ? 'bg-blue-50' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start space-x-3">
        <div className={`mt-1 ${getNotificationColor(notification.type)}`}>
          {getNotificationIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className={`text-sm font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                {notification.title}
              </p>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {notification.message}
              </p>
              <div className="flex items-center mt-2 space-x-2">
                <p className="text-xs text-gray-500">{timeAgo}</p>
                {!notification.read && (
                  <Badge variant="secondary" className="text-xs">
                    Nieuw
                  </Badge>
                )}
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
              onClick={onDelete}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
