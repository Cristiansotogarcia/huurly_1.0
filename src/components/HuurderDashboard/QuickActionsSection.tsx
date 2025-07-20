
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { User, Bell, Settings, Loader2 } from "lucide-react";

interface QuickActionsSectionProps {
  hasProfile: boolean;
  isLookingForPlace: boolean;
  isUpdatingStatus: boolean;
  onShowProfileModal: () => void;
  onShowDocumentModal: () => void;
  onStartSearch: () => void;
  onReportIssue: () => void;
  onHelpSupport: () => void;
  onToggleLookingStatus: () => void;
}

export const QuickActionsSection = ({
  hasProfile,
  isLookingForPlace,
  isUpdatingStatus,
  onShowProfileModal,
  onShowDocumentModal,
  onStartSearch,
  onReportIssue,
  onHelpSupport,
  onToggleLookingStatus
}: QuickActionsSectionProps) => {
  return (
    <div className="bg-gradient-to-r from-blue-800 to-blue-900 rounded-2xl p-4 sm:p-6 lg:p-8 text-white shadow-xl">
      <div className="flex items-center justify-center space-x-3 mb-6 sm:mb-8">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center">
          <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold">Snelle Acties</h1>
        </div>
      </div>

      {/* Mobile Profile Status Section */}
      <div className="bg-white/10 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 backdrop-blur-sm lg:hidden">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-white">Profiel Status</h3>
              <p className="text-xs sm:text-sm text-blue-100">Beheer de zichtbaarheid van je profiel</p>
            </div>
          </div>
          {isUpdatingStatus && <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-blue-200" />}
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 bg-white/10 rounded-lg">
          <Switch
            id="looking-status-mobile"
            checked={isLookingForPlace}
            onCheckedChange={onToggleLookingStatus}
            disabled={isUpdatingStatus}
          />
          <label htmlFor="looking-status-mobile" className="text-xs sm:text-sm font-medium text-white cursor-pointer">
            {isLookingForPlace ? "Ik zoek actief een woning" : "Ik zoek momenteel geen woning"}
          </label>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {/* Desktop Profile Status Button */}
        <div className="hidden lg:block">
          <Button 
            className="bg-blue-600 text-white hover:bg-blue-500 font-semibold text-sm py-3 px-4 h-auto flex-col items-center justify-center min-h-[120px] border border-blue-500 shadow-md w-full relative" 
            onClick={onToggleLookingStatus}
            disabled={isUpdatingStatus}
          >
            <User className="mb-2 h-5 w-5" />
            <span className="text-center mb-2">Profiel Status</span>
            <div className="flex items-center space-x-2">
              <Switch
                id="looking-status-desktop"
                checked={isLookingForPlace}
                onCheckedChange={onToggleLookingStatus}
                disabled={isUpdatingStatus}
              />
              <span className="text-xs text-center">
                {isLookingForPlace ? "Actief zoekend" : "Niet zoekend"}
              </span>
            </div>
            {isUpdatingStatus && (
              <Loader2 className="h-4 w-4 animate-spin absolute top-2 right-2" />
            )}
          </Button>
        </div>
        
        <Button 
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4 h-auto flex-col items-center justify-center min-h-[70px] sm:min-h-[80px] shadow-md" 
          onClick={onShowProfileModal}
        >
          <User className="mb-1 sm:mb-2 h-4 w-4 sm:h-5 sm:w-5" />
          <span className="text-center">Profiel Bewerken</span>
        </Button>
        
        <Button 
          className="bg-blue-600 text-white hover:bg-blue-500 font-semibold text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4 h-auto flex-col items-center justify-center min-h-[70px] sm:min-h-[80px] border border-blue-500 shadow-md" 
          onClick={onReportIssue}
        >
          <Bell className="mb-1 sm:mb-2 h-4 w-4 sm:h-5 sm:w-5" />
          <span className="text-center">Probleem Melden</span>
        </Button>
        
        <Button 
          className="bg-blue-600 text-white hover:bg-blue-500 font-semibold text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4 h-auto flex-col items-center justify-center min-h-[70px] sm:min-h-[80px] border border-blue-500 shadow-md" 
          onClick={onHelpSupport}
        >
          <Settings className="mb-1 sm:mb-2 h-4 w-4 sm:h-5 sm:w-5" />
          <span className="text-center">Help & Support</span>
        </Button>
      </div>
    </div>
  );
};
