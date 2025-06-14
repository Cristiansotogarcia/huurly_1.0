
import { Button } from "@/components/ui/button";
import { User, Upload, Search, Bell, Settings } from "lucide-react";

interface QuickActionsSectionProps {
  hasProfile: boolean;
  onShowProfileModal: () => void;
  onShowDocumentModal: () => void;
  onStartSearch: () => void;
  onReportIssue: () => void;
  onHelpSupport: () => void;
}

export const QuickActionsSection = ({
  hasProfile,
  onShowProfileModal,
  onShowDocumentModal,
  onStartSearch,
  onReportIssue,
  onHelpSupport
}: QuickActionsSectionProps) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-xl">
      <div className="flex items-center justify-center space-x-3 mb-8">
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
          <Settings className="w-6 h-6" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Snelle Acties</h1>
          <p className="text-blue-100">Handige links voor snelle toegang</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {!hasProfile && (
          <Button 
            className="bg-white text-blue-700 hover:bg-blue-50 font-semibold text-sm py-3 px-4 h-auto flex-col items-center justify-center min-h-[80px] shadow-md" 
            onClick={onShowProfileModal}
          >
            <User className="mb-2 h-5 w-5" />
            <span className="text-center">Maak Profiel Aan</span>
          </Button>
        )}
        
        <Button 
          className="bg-blue-800 text-white hover:bg-blue-900 font-semibold text-sm py-3 px-4 h-auto flex-col items-center justify-center min-h-[80px] border border-blue-600 shadow-md" 
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
          className="bg-blue-800 text-white hover:bg-blue-900 font-semibold text-sm py-3 px-4 h-auto flex-col items-center justify-center min-h-[80px] border border-blue-600 shadow-md" 
          onClick={onShowProfileModal}
        >
          <User className="mb-2 h-5 w-5" />
          <span className="text-center">Profiel Bewerken</span>
        </Button>
        
        <Button 
          className="bg-blue-800 text-white hover:bg-blue-900 font-semibold text-sm py-3 px-4 h-auto flex-col items-center justify-center min-h-[80px] border border-blue-600 shadow-md" 
          onClick={onReportIssue}
        >
          <Bell className="mb-2 h-5 w-5" />
          <span className="text-center">Probleem Melden</span>
        </Button>
        
        <Button 
          className="bg-blue-800 text-white hover:bg-blue-900 font-semibold text-sm py-3 px-4 h-auto flex-col items-center justify-center min-h-[80px] border border-blue-600 shadow-md" 
          onClick={onHelpSupport}
        >
          <Settings className="mb-2 h-5 w-5" />
          <span className="text-center">Help & Support</span>
        </Button>
      </div>
    </div>
  );
};
