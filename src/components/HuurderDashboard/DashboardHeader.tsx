
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings } from "lucide-react";
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
            <span className="text-sm text-gray-600">
              Welkom, {userName}
            </span>
            <Button variant="outline" onClick={onLogout}>
              Uitloggen
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
