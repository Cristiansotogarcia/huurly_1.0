
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
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Snelle Acties</h1>
          <p className="text-blue-100">Handige links voor snelle toegang</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        {!hasProfile && (
          <Button className="bg-white text-blue-600 hover:bg-gray-100 font-medium" onClick={onShowProfileModal}>
            <User className="mr-2 h-4 w-4" /> Maak Profiel Aan
          </Button>
        )}
        <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={onShowDocumentModal}>
          <Upload className="mr-2 h-4 w-4" /> Documenten Uploaden
        </Button>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={onStartSearch}>
          <Search className="mr-2 h-4 w-4" /> Zoek Woningen
        </Button>
        <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={onShowProfileModal}>
          <User className="mr-2 h-4 w-4" /> Profiel Bewerken
        </Button>
        <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={onReportIssue}>
          <Bell className="mr-2 h-4 w-4" /> Probleem Melden
        </Button>
        <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={onHelpSupport}>
          <Settings className="mr-2 h-4 w-4" /> Help & Support
        </Button>
      </div>
    </div>
  );
};
