
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Settings, User } from "lucide-react";
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
  // Get user's initials for fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Logo />
            <div className="ml-4 flex items-center">
              <span className="text-gray-500">| Huurder Dashboard</span>
              {hasPayment && (
                <div className="ml-4 flex items-center space-x-2">
                  <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                    Account Actief
                  </Badge>
                  <span className="text-sm text-gray-600">
                    tot {subscriptionEndDate}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <NotificationBell />
            <Button variant="ghost" size="sm" onClick={onSettings}>
              <Settings className="w-4 h-4" />
            </Button>
            
            {/* User Profile Section */}
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={`https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=100&h=100&fit=crop&crop=face`} 
                  alt={userName}
                />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-600 font-medium">
                Welkom, {userName}
              </span>
            </div>
            
            <Button variant="outline" onClick={onLogout}>
              Uitloggen
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
