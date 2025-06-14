
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCheck } from 'lucide-react';

interface NotificationHeaderProps {
  unreadCount: number;
  totalCount: number;
  isLoading: boolean;
  onMarkAllAsRead: () => void;
}

export const NotificationHeader = ({
  unreadCount,
  totalCount,
  isLoading,
  onMarkAllAsRead
}: NotificationHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold">Notificaties</h3>
      <div className="flex items-center space-x-2">
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAllAsRead}
            disabled={isLoading}
            className="text-xs"
          >
            <CheckCheck className="w-3 h-3 mr-1" />
            Alles gelezen
          </Button>
        )}
        <Badge variant="secondary">
          {totalCount}
        </Badge>
      </div>
    </div>
  );
};
