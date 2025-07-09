import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Settings, User, LogOut } from "lucide-react";
import { Logo } from "@/components/Logo";
import { User as UserType } from "@/types";

interface DashboardHeaderProps {
  user: UserType;
  onLogout: () => void;
  onSettings?: () => void;
}

const DashboardHeader = ({ 
  user, 
  onLogout,
  onSettings
}: DashboardHeaderProps) => {
  const { name, role, hasPayment, subscriptionEndDate, profilePictureUrl } = user;
  
  // Map role to dashboard title
  const getDashboardTitle = () => {
    switch(role) {
      case 'huurder':
        return 'Huurder Dashboard';
      case 'verhuurder':
        return 'Verhuurder Dashboard';
      case 'beoordelaar':
        return 'Beoordelaar Dashboard';
      case 'beheerder':
        return 'Beheerder Dashboard';
      default:
        return 'Dashboard';
    }
  };

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
                  {getDashboardTitle()}
                </span>
                {/* Payment status - hidden on mobile, visible on tablet+ */}
                {hasPayment && (
                  <div className="hidden md:flex items-center space-x-3 mt-1">
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 px-2 py-0.5 rounded-full font-medium text-xs">
                      ✓ Account Actief
                    </Badge>
                    
                    {subscriptionEndDate && subscriptionEndDate !== 'N/A' && (
                      <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                        tot {subscriptionEndDate}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - User Profile */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            {/* Settings Button */}
            {onSettings && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onSettings}
                className="text-gray-500 hover:text-gray-700"
              >
                <Settings className="h-5 w-5" />
              </Button>
            )}
            
            {/* Logout Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onLogout}
              className="text-gray-500 hover:text-gray-700"
            >
              <LogOut className="h-5 w-5" />
            </Button>

            {/* User Avatar */}
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8 border border-gray-200">
                {profilePictureUrl ? (
                  <AvatarImage src={profilePictureUrl} alt={name} />
                ) : null}
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700 hidden sm:inline-block">
                {name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;