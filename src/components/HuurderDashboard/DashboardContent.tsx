
import { QuickActionsSection } from "./QuickActionsSection";
import { StatsGrid } from "./StatsGrid";
import { ProfileStatusCard } from "./ProfileStatusCard";
import { DocumentsSection } from "./DocumentsSection";
import { ImportantInfoSection } from "./ImportantInfoSection";

interface DashboardContentProps {
  userName: string;
  hasProfile: boolean;
  userDocuments: any[];
  stats: {
    profileViews: number;
    invitations: number;
    applications: number;
    acceptedApplications: number;
  };
  isLoadingStats: boolean;
  isLookingForPlace: boolean;
  isUpdatingStatus: boolean;
  onShowProfileModal: () => void;
  onShowDocumentModal: () => void;
  onStartSearch: () => void;
  onToggleLookingStatus: () => void;
  onReportIssue: () => void;
  onHelpSupport: () => void;
}

export const DashboardContent = ({
  hasProfile,
  userDocuments,
  stats,
  isLoadingStats,
  isLookingForPlace,
  isUpdatingStatus,
  onShowProfileModal,
  onShowDocumentModal,
  onStartSearch,
  onToggleLookingStatus,
  onReportIssue,
  onHelpSupport
}: DashboardContentProps) => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="space-y-6">
        <QuickActionsSection
          hasProfile={hasProfile}
          onShowProfileModal={onShowProfileModal}
          onShowDocumentModal={onShowDocumentModal}
          onStartSearch={onStartSearch}
          onReportIssue={onReportIssue}
          onHelpSupport={onHelpSupport}
        />

        <StatsGrid stats={stats} isLoadingStats={isLoadingStats} />

        <ProfileStatusCard
          isLookingForPlace={isLookingForPlace}
          isUpdatingStatus={isUpdatingStatus}
          onToggleLookingStatus={onToggleLookingStatus}
        />

        <DocumentsSection
          userDocuments={userDocuments}
          onShowDocumentModal={onShowDocumentModal}
        />

        <ImportantInfoSection />
      </div>
    </div>
  );
};
