
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Settings, User, Menu } from "lucide-react";
import { Logo } from "@/components/Logo";
import NotificationBell from "@/components/NotificationBell";

interface DashboardHeaderProps {
  userName: string;
  hasPayment: boolean;
  subscriptionEndDate: string | null;
  onSettings: () => void;
  onLogout: () => void;
}

export const DashboardHeader = ({ 
  userName, 
  hasPayment, 
  subscriptionEndDate, 
  onSettings, 
  onLogout 
}: DashboardHeaderProps) => {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Left Section - Logo and Title */}
          <div className="flex items-center min-w-0 flex-1">
            <Logo />
            <div className="ml-3 sm:ml-6 flex items-center min-w-0">
              <div className="w-1 h-4 sm:h-6 bg-blue-600 rounded-full mr-2 sm:mr-4 flex-shrink-0"></div>
              <div className="min-w-0">
                <span className="text-gray-700 font-medium text-sm sm:text-base truncate block">
                  Huurder Dashboard
                </span>
                {/* Payment status - hidden on mobile, visible on tablet+ */}
                {hasPayment && (
                  <div className="hidden md:flex items-center space-x-3 mt-1">
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 px-2 py-0.5 rounded-full font-medium text-xs">
                      ✓ Account Actief
                    </Badge>
                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                      tot {subscriptionEndDate}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Actions and User */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Payment status badge for mobile - compact version */}
            {hasPayment && (
              <div className="md:hidden">
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 px-2 py-0.5 rounded-full font-medium text-xs">
                  ✓ Actief
                </Badge>
              </div>
            )}
            
            {/* Notification Bell */}
            <NotificationBell />
            
            {/* Settings Button - hidden on small mobile */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onSettings} 
              className="hidden xs:flex hover:bg-gray-100 rounded-full h-8 w-8 sm:h-9 sm:w-9"
            >
              <Settings className="w-4 h-4" />
            </Button>
            
            {/* User Profile Section - Responsive */}
            <div className="flex items-center space-x-2 sm:space-x-3 bg-gray-50 rounded-full px-2 sm:px-4 py-1 sm:py-2">
              <Avatar className="h-6 w-6 sm:h-8 sm:w-8 ring-2 ring-white shadow-sm">
                <AvatarImage 
                  src={`https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=100&h=100&fit=crop&crop=face`} 
                  alt={userName}
                />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-xs sm:text-sm font-medium">
                  <User className="w-3 h-3 sm:w-4 sm:h-4" />
                </AvatarFallback>
              </Avatar>
              {/* User name - hidden on small mobile, show on sm+ */}
              <span className="hidden sm:block text-sm text-gray-700 font-medium max-w-[120px] lg:max-w-none truncate">
                {userName}
              </span>
              {/* Show just first name on mobile */}
              <span className="sm:hidden text-xs text-gray-700 font-medium max-w-[60px] truncate">
                {userName.split(' ')[0]}
              </span>
            </div>
            
            {/* Logout Button - Only visible on desktop */}
            <Button 
              variant="outline" 
              onClick={onLogout} 
              className="hidden sm:flex hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors rounded-full text-sm px-4 py-2"
            >
              Uitloggen
            </Button>
          </div>
        </div>

        {/* Mobile Payment Status and Logout Row - Only visible on mobile when has payment */}
        {hasPayment && (
          <div className="sm:hidden pb-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                Account actief tot {subscriptionEndDate}
              </span>
              <Button 
                variant="outline" 
                onClick={onLogout} 
                className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors rounded-full text-xs px-3 py-1 h-auto ml-2"
              >
                Uitloggen
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
