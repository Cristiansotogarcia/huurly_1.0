import React from "react";
import { Button } from "@/components/ui/button";
import { User as UserIcon, FileText, Home } from "lucide-react";

interface ProfileActionsProps {
  onShowProfileModal: () => void;
  onShowDocumentModal: () => void;
  onNavigateSearch: () => void;
  onNavigateHelp: () => void;
}

export const ProfileActions: React.FC<ProfileActionsProps> = ({
  onShowProfileModal,
  onShowDocumentModal,
  onNavigateSearch,
  onNavigateHelp,
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 mt-8">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Button
        variant="default"
        size="sm"
        className="w-full justify-center text-xs sm:text-sm lg:text-base h-12 sm:h-9 lg:h-10"
        onClick={onShowProfileModal}
      >
        <UserIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
        <span className="hidden lg:inline">Profiel bewerken</span>
        <span className="lg:hidden">Profiel</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-center text-xs sm:text-sm lg:text-base h-12 sm:h-9 lg:h-10"
        onClick={onShowDocumentModal}
      >
        <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
        <span className="hidden lg:inline">Documenten beheren</span>
        <span className="lg:hidden">Documenten</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-center text-xs sm:text-sm lg:text-base h-12 sm:h-9 lg:h-10"
        onClick={onNavigateSearch}
      >
        <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
        <span className="hidden lg:inline">Woningen zoeken</span>
        <span className="lg:hidden">Zoeken</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-center text-xs sm:text-sm lg:text-base h-12 sm:h-9 lg:h-10"
        onClick={onNavigateHelp}
      >
        <span className="hidden lg:inline">Help & Support</span>
        <span className="lg:hidden">Help</span>
      </Button>
    </div>
  </div>
);

export default ProfileActions;
