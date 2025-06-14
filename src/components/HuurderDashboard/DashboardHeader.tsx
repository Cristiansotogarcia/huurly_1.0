
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
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Logo />
            <div className="ml-6 flex items-center">
              <div className="w-1 h-6 bg-blue-600 rounded-full mr-4"></div>
              <span className="text-gray-700 font-medium">Huurder Dashboard</span>
              {hasPayment && (
                <div className="ml-6 flex items-center space-x-3">
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 px-3 py-1 rounded-full font-medium">
                    ✓ Account Actief
                  </Badge>
                  <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    tot {subscriptionEndDate}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <NotificationBell />
            
            <Button variant="ghost" size="sm" onClick={onSettings} className="hover:bg-gray-100 rounded-full">
              <Settings className="w-4 h-4" />
            </Button>
            
            {/* User Profile Section - Modern Design */}
            <div className="flex items-center space-x-3 bg-gray-50 rounded-full px-4 py-2">
              <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
                <AvatarImage 
                  src={`https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=100&h=100&fit=crop&crop=face`} 
                  alt={userName}
                />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-700 font-medium">
                {userName}
              </span>
            </div>
            
            <Button variant="outline" onClick={onLogout} className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors rounded-full">
              Uitloggen
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
