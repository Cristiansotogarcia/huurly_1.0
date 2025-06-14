
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { User, Upload, Search, Bell, Settings, Loader2 } from "lucide-react";

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
    <div className="bg-gradient-to-r from-blue-800 to-blue-900 rounded-2xl p-8 text-white shadow-xl">
      <div className="flex items-center justify-center space-x-3 mb-8">
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
          <Settings className="w-6 h-6" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Snelle Acties</h1>
          <p className="text-blue-100">Handige links voor snelle toegang</p>
        </div>
      </div>

      {/* Profile Status Section */}
      <div className="bg-white/10 rounded-xl p-6 mb-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Profiel Status</h3>
              <p className="text-sm text-blue-100">Beheer de zichtbaarheid van je profiel</p>
            </div>
          </div>
          {isUpdatingStatus && <Loader2 className="h-5 w-5 animate-spin text-blue-200" />}
        </div>
        <div className="flex items-center space-x-3 p-4 bg-white/10 rounded-lg">
          <Switch
            id="looking-status"
            checked={isLookingForPlace}
            onCheckedChange={onToggleLookingStatus}
            disabled={isUpdatingStatus}
          />
          <label htmlFor="looking-status" className="text-sm font-medium text-white cursor-pointer">
            {isLookingForPlace ? "Ik zoek actief een woning" : "Ik zoek momenteel geen woning"}
          </label>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {!hasProfile && (
          <Button 
            className="bg-blue-500 text-white hover:bg-blue-400 font-semibold text-sm py-3 px-4 h-auto flex-col items-center justify-center min-h-[80px] shadow-md" 
            onClick={onShowProfileModal}
          >
            <User className="mb-2 h-5 w-5" />
            <span className="text-center">Maak Profiel Aan</span>
          </Button>
        )}
        
        <Button 
          className="bg-blue-600 text-white hover:bg-blue-500 font-semibold text-sm py-3 px-4 h-auto flex-col items-center justify-center min-h-[80px] border border-blue-500 shadow-md" 
          onClick={onShowDocumentModal}
        >
          <Upload className="mb-2 h-5 w-5" />
          <span className="text-center">Documenten Uploaden</span>
        </Button>
        
        <Button 
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm py-3 px-4 h-auto flex-col items-center justify-center min-h-[80px] shadow-md" 
          onClick={onStartSearch}
        >
          <Search className="mb-2 h-5 w-5" />
          <span className="text-center">Zoek Woningen</span>
        </Button>
        
        <Button 
          className="bg-blue-600 text-white hover:bg-blue-500 font-semibold text-sm py-3 px-4 h-auto flex-col items-center justify-center min-h-[80px] border border-blue-500 shadow-md" 
          onClick={onShowProfileModal}
        >
          <User className="mb-2 h-5 w-5" />
          <span className="text-center">Profiel Bewerken</span>
        </Button>
        
        <Button 
          className="bg-blue-600 text-white hover:bg-blue-500 font-semibold text-sm py-3 px-4 h-auto flex-col items-center justify-center min-h-[80px] border border-blue-500 shadow-md" 
          onClick={onReportIssue}
        >
          <Bell className="mb-2 h-5 w-5" />
          <span className="text-center">Probleem Melden</span>
        </Button>
        
        <Button 
          className="bg-blue-600 text-white hover:bg-blue-500 font-semibold text-sm py-3 px-4 h-auto flex-col items-center justify-center min-h-[80px] border border-blue-500 shadow-md" 
          onClick={onHelpSupport}
        >
          <Settings className="mb-2 h-5 w-5" />
          <span className="text-center">Help & Support</span>
        </Button>
      </div>
    </div>
  );
};
