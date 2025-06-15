
import React, { useState } from 'react';
import { ProfileStatusCard } from './ProfileStatusCard';
import { QuickActionsSection } from './QuickActionsSection';
import { StatsGrid } from './StatsGrid';
import { DocumentsSection } from './DocumentsSection';
import { ImportantInfoSection } from './ImportantInfoSection';
import { NotificationTester } from '@/components/notifications/NotificationTester';
import { Button } from '@/components/ui/button';
import { TestTube } from 'lucide-react';

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
  const [showNotificationTester, setShowNotificationTester] = useState(false);

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
        
        {/* Test Tools Section */}
        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNotificationTester(!showNotificationTester)}
            className="text-blue-600 border-blue-200"
          >
            <TestTube className="w-4 h-4 mr-2" />
            {showNotificationTester ? 'Verberg' : 'Toon'} Notificatie Tester
          </Button>
        </div>
      </div>

      {/* Notification Tester */}
      {showNotificationTester && (
        <div className="mb-8">
          <NotificationTester />
        </div>
      )}

      {/* Profile Status Card */}
      <div className="mb-8">
        <ProfileStatusCard
          hasProfile={hasProfile}
          isLookingForPlace={isLookingForPlace}
          isUpdatingStatus={isUpdatingStatus}
          onShowProfileModal={onShowProfileModal}
          onToggleLookingStatus={onToggleLookingStatus}
        />
      </div>

      {/* Stats Grid */}
      <div className="mb-8">
        <StatsGrid stats={stats} isLoading={isLoadingStats} />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <QuickActionsSection
          hasProfile={hasProfile}
          onShowProfileModal={onShowProfileModal}
          onShowDocumentModal={onShowDocumentModal}
          onStartSearch={onStartSearch}
        />
      </div>

      {/* Documents Section */}
      <div className="mb-8">
        <DocumentsSection documents={userDocuments} />
      </div>

      {/* Important Information */}
      <div className="mb-8">
        <ImportantInfoSection
          onReportIssue={onReportIssue}
          onHelpSupport={onHelpSupport}
        />
      </div>
    </main>
  );
};
