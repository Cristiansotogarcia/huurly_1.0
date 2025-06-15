
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Settings, User } from "lucide-react";
import { Logo } from "@/components/Logo";

interface DashboardHeaderProps {
  userName: string;
  hasPayment: boolean;
  subscriptionEndDate: string | null;
  profilePictureUrl?: string | null;
  onSettings: () => void;
  onLogout: () => void;
}

export const DashboardHeader = ({ 
  userName, 
  hasPayment, 
  subscriptionEndDate,
  profilePictureUrl,
  onSettings, 
  onLogout 
}: DashboardHeaderProps) => {
  return (
    <header className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
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

          {/* Right Section - Desktop */}
          <div className="hidden sm:flex items-center space-x-4">
            {/* Payment status badge for tablet */}
            {hasPayment && (
              <div className="md:hidden">
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 px-2 py-0.5 rounded-full font-medium text-xs">
                  ✓ Actief
                </Badge>
              </div>
            )}
            
            {/* Settings Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onSettings} 
              className="hover:bg-gray-100 rounded-full h-9 w-9"
            >
              <Settings className="w-4 h-4" />
            </Button>
            
            {/* User Profile Section */}
            <div className="flex items-center space-x-3 bg-gray-50 rounded-full px-4 py-2">
              <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
                <AvatarImage 
                  src={profilePictureUrl || `https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=100&h=100&fit=crop&crop=face`} 
                  alt={userName}
                />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-700 font-medium max-w-[120px] lg:max-w-none truncate">
                {userName}
              </span>
            </div>
            
            {/* Logout Button */}
            <Button 
              variant="outline" 
              onClick={onLogout} 
              className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors rounded-full text-sm px-4 py-2"
            >
              Uitloggen
            </Button>
          </div>

          {/* Right Section - Mobile */}
          <div className="sm:hidden flex items-center space-x-3">
            {/* User Profile - Mobile */}
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8 ring-1 ring-gray-200">
                <AvatarImage 
                  src={profilePictureUrl || `https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=100&h=100&fit=crop&crop=face`} 
                  alt={userName}
                />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-medium">
                  <User className="w-3 h-3" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-700 font-medium max-w-[80px] truncate">
                {userName.split(' ')[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Info Section - Clean card-like design */}
        <div className="sm:hidden">
          {hasPayment && (
            <div className="pb-4 pt-2">
              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-4 border border-emerald-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Account Actief</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={onLogout} 
                    className="text-gray-600 hover:text-red-600 hover:bg-red-50 text-xs px-3 py-1 h-auto rounded-full"
                  >
                    Uitloggen
                  </Button>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Geldig tot {subscriptionEndDate}
                </p>
              </div>
            </div>
          )}
          
          {!hasPayment && (
            <div className="pb-4 pt-2">
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onLogout} 
                  className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors rounded-full text-xs px-4 py-2"
                >
                  Uitloggen
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
