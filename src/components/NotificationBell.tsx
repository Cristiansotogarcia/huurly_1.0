
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';

const NotificationBell = () => {
  // For now, just show a simple bell icon with a placeholder badge
  // Real notification functionality will be implemented later
  const mockUnreadCount = 0;

  return (
    <Button variant="ghost" size="sm" className="relative">
      <Bell className="w-5 h-5" />
      {mockUnreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 min-w-[1.2rem] h-5 text-xs px-1 py-0 flex items-center justify-center"
        >
          {mockUnreadCount > 99 ? '99+' : mockUnreadCount}
        </Badge>
      )}
    </Button>
  );
};

export default NotificationBell;
