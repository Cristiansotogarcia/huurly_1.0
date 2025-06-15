
import React from 'react';
import { ProfileStatusCard } from './ProfileStatusCard';
import { QuickActionsSection } from './QuickActionsSection';
import { StatsGrid } from './StatsGrid';
import { DocumentsSection } from './DocumentsSection';
import { ImportantInfoSection } from './ImportantInfoSection';

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

export const DashboardContent: React.FC<DashboardContentProps> = ({
  userName,
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
  onHelpSupport,
}) => {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welkom terug, {userName}!
        </h1>
        <p className="text-gray-600">
          Beheer je profiel, documenten en vind jouw ideale woning.
        </p>
      </div>

      {/* Profile Status Card */}
      <div className="mb-8">
        <ProfileStatusCard
          isLookingForPlace={isLookingForPlace}
          isUpdatingStatus={isUpdatingStatus}
          onToggleLookingStatus={onToggleLookingStatus}
        />
      </div>

      {/* Stats Grid */}
      <div className="mb-8">
        <StatsGrid stats={stats} isLoadingStats={isLoadingStats} />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <QuickActionsSection
          hasProfile={hasProfile}
          isLookingForPlace={isLookingForPlace}
          isUpdatingStatus={isUpdatingStatus}
          onShowProfileModal={onShowProfileModal}
          onShowDocumentModal={onShowDocumentModal}
          onStartSearch={onStartSearch}
          onToggleLookingStatus={onToggleLookingStatus}
          onReportIssue={onReportIssue}
          onHelpSupport={onHelpSupport}
        />
      </div>

      {/* Documents Section */}
      <div className="mb-8">
        <DocumentsSection 
          userDocuments={userDocuments}
          onShowDocumentModal={onShowDocumentModal}
        />
      </div>

      {/* Important Information */}
      <div className="mb-8">
        <ImportantInfoSection />
      </div>
    </main>
  );
};
