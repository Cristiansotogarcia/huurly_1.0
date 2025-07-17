import React from 'react';
import { Button } from '@/components/ui/button';
import { User, FileText, Eye, Bell, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavigationProps {
  onProfileClick: () => void;
  onDocumentsClick: () => void;
  onStatsClick: () => void;
  onNotificationsClick: () => void;
  className?: string;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  onProfileClick,
  onDocumentsClick,
  onStatsClick,
  onNotificationsClick,
  className
}) => {
  return (
    <div className={cn("md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50", className)}>
      <div className="flex justify-around items-center h-16">
        <Button
          variant="ghost"
          size="sm"
          className="flex flex-col items-center h-full py-2 px-1"
          onClick={onProfileClick}
        >
          <User className="w-5 h-5 mb-1" />
          <span className="text-xs">Profiel</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex flex-col items-center h-full py-2 px-1"
          onClick={onDocumentsClick}
        >
          <FileText className="w-5 h-5 mb-1" />
          <span className="text-xs">Docs</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex flex-col items-center h-full py-2 px-1"
          onClick={onStatsClick}
        >
          <Eye className="w-5 h-5 mb-1" />
          <span className="text-xs">Stats</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex flex-col items-center h-full py-2 px-1"
          onClick={onNotificationsClick}
        >
          <Bell className="w-5 h-5 mb-1" />
          <span className="text-xs">Alerts</span>
        </Button>
      </div>
    </div>
  );
};
