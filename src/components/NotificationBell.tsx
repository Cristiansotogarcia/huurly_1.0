
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

const NotificationBell = () => {
  return (
    <Button variant="ghost" size="sm" className="relative">
      <Bell className="w-5 h-5" />
    </Button>
  );
};

export default NotificationBell;
