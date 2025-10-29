import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, LogOut } from "lucide-react";
import { Logo } from "@/components/Logo";
import { User as UserType } from "@/types";

interface DashboardHeaderProps {
  user: UserType;
  onLogout: () => void;
}

const DashboardHeader = ({
  user,
  onLogout
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18">
          {/* Left Section - Logo and Title */}
          <div className="flex items-center min-w-0 flex-1">
            <Logo />
            <div className="ml-3 sm:ml-4 lg:ml-6 flex items-center min-w-0">
              <div className="w-1 h-5 sm:h-6 bg-blue-600 rounded-full mr-3 sm:mr-4 flex-shrink-0"></div>
              <div className="min-w-0">
                <span className="text-gray-700 font-medium text-base sm:text-lg truncate block">
                  {getDashboardTitle()}
                </span>
                {/* Payment status - hidden on mobile, visible on tablet+ */}
                {hasPayment && (
                  <div className="hidden md:flex items-center space-x-2 mt-1">
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
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Logout Button - Mobile optimized */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 min-h-[44px] min-w-[44px]"
            >
              <LogOut className="h-5 w-5" />
            </Button>

            {/* User Avatar - Mobile optimized */}
            <div className="flex items-center space-x-2">
              <Avatar className="h-10 w-10 sm:h-8 sm:w-8 border-2 border-gray-200">
                {profilePictureUrl ? (
                  <AvatarImage src={profilePictureUrl} alt={name} />
                ) : null}
                <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700 hidden sm:inline-block max-w-[120px] truncate">
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
