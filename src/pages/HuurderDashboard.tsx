
import { useState, useEffect } from "react";
import { useHuurderDashboard } from "@/hooks/useHuurderDashboard";
import { useHuurderActions } from "@/hooks/useHuurderActions";
import { DashboardHeader } from "@/components/HuurderDashboard/DashboardHeader";
import { DashboardContent } from "@/components/HuurderDashboard/DashboardContent";
import { LoadingState } from "@/components/HuurderDashboard/LoadingState";
import { AccessDeniedState } from "@/components/HuurderDashboard/AccessDeniedState";
import { DashboardModals } from "@/components/HuurderDashboard/DashboardModals";

const HuurderDashboard = () => {
  const {
    user,
    hasProfile,
    setHasProfile,
    userDocuments,
    isLoading,
    stats,
    isLoadingStats,
    initializeDashboard,
    loadDashboardData,
    refreshDocuments,
    getSubscriptionEndDate
  } = useHuurderDashboard();

  const {
    isLookingForPlace,
    isUpdatingStatus,
    toggleLookingStatus,
    handleProfileComplete,
    handleDocumentUploadComplete,
    handleStartSearch,
    handleReportIssue,
    handleSettings,
    handleHelpSupport,
    handleLogout,
    handleGoHome
  } = useHuurderActions();

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  console.log("HuurderDashboard: Current user:", user);
  console.log("HuurderDashboard: User role:", user?.role);
  console.log("HuurderDashboard: Has payment:", user?.hasPayment);

  // Initialize dashboard and check payment status
  useEffect(() => {
    const initialize = async () => {
      await initializeDashboard();
      
      if (user) {
        // Show persistent payment modal if no payment
        setShowPaymentModal(!user.hasPayment);
      }
    };

    initialize();
  }, [user]);

  // Load profile, documents, and stats
  useEffect(() => {
    if (!user?.id) return;
    loadDashboardData();
  }, [user?.id]);

  const onProfileComplete = async (profileData: any) => {
    await handleProfileComplete(profileData, async () => {
      setHasProfile(true);
      await loadDashboardData();
    });
  };

  const onDocumentUploadComplete = async (documents: any[]) => {
    await handleDocumentUploadComplete(documents, refreshDocuments);
  };

  const onStartSearch = () => {
    if (!hasProfile) {
      setShowProfileModal(true);
      return;
    }
    // For now, just show a message since we removed the search modal
    console.log("Property search functionality will be implemented later");
  };

  // Show loading state while initializing
  if (isLoading) {
    console.log("Showing loading state");
    return <LoadingState />;
  }

  // Show access denied if no user or wrong role
  if (!user) {
    console.log("No user found, showing access denied");
    return (
      <AccessDeniedState
        title="Toegang geweigerd"
        message="Je moet ingelogd zijn om het huurder dashboard te bekijken."
        onGoHome={handleGoHome}
      />
    );
  }

  if (user.role !== "huurder") {
    console.log("Wrong role, showing access denied. User role:", user.role);
    return (
      <AccessDeniedState
        title="Toegang geweigerd"
        message="Je hebt geen toegang tot het huurder dashboard."
        onGoHome={handleGoHome}
      />
    );
  }

  console.log("Rendering main dashboard content");

  return (
    <>
      <div
        className={
          showPaymentModal && !user.hasPayment
            ? "min-h-screen bg-gray-50 filter blur-sm pointer-events-none select-none"
            : "min-h-screen bg-gray-50"
        }
      >
        <DashboardHeader
          userName={user.name}
          hasPayment={user.hasPayment}
          subscriptionEndDate={getSubscriptionEndDate()}
          onSettings={handleSettings}
          onLogout={handleLogout}
        />

        <DashboardContent
          userName={user.name}
          hasProfile={hasProfile}
          userDocuments={userDocuments}
          stats={stats}
          isLoadingStats={isLoadingStats}
          isLookingForPlace={isLookingForPlace}
          isUpdatingStatus={isUpdatingStatus}
          onShowProfileModal={() => setShowProfileModal(true)}
          onShowDocumentModal={() => setShowDocumentModal(true)}
          onStartSearch={onStartSearch}
          onToggleLookingStatus={toggleLookingStatus}
          onReportIssue={handleReportIssue}
          onHelpSupport={handleHelpSupport}
        />
      </div>

      <DashboardModals
        showProfileModal={showProfileModal}
        showDocumentModal={showDocumentModal}
        showPaymentModal={showPaymentModal && !user.hasPayment}
        hasProfile={hasProfile}
        setShowProfileModal={setShowProfileModal}
        setShowDocumentModal={setShowDocumentModal}
        setShowPaymentModal={setShowPaymentModal}
        onProfileComplete={onProfileComplete}
        onDocumentUploadComplete={onDocumentUploadComplete}
      />
    </>
  );
};

export default HuurderDashboard;
