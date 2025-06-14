
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHuurderDashboard } from "@/hooks/useHuurderDashboard";
import { useHuurderActions } from "@/hooks/useHuurderActions";
import { DashboardHeader } from "@/components/HuurderDashboard/DashboardHeader";
import { DashboardContent } from "@/components/HuurderDashboard/DashboardContent";
import EnhancedProfileCreationModal from "@/components/modals/EnhancedProfileCreationModal";
import DocumentUploadModal from "@/components/modals/DocumentUploadModal";
import PropertySearchModal from "@/components/modals/PropertySearchModal";
import { PaymentModal } from "@/components/PaymentModal";

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
    loadUserStats,
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
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  console.log("HuurderDashboard: Current user:", user);
  console.log("HuurderDashboard: User role:", user?.role);
  console.log("HuurderDashboard: Has payment:", user?.hasPayment);

  // Initialize dashboard and check payment status
  useEffect(() => {
    const initialize = async () => {
      await initializeDashboard();
      
      if (user) {
        // Simple payment modal logic - show if no payment
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
    handleStartSearch(hasProfile, () => setShowProfileModal(true), () => setShowSearchModal(true));
  };

  // Show loading state while initializing
  if (isLoading) {
    console.log("Showing loading state");
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">Laden...</h2>
              <p className="text-gray-600">Dashboard wordt geladen...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show access denied if no user or wrong role
  if (!user) {
    console.log("No user found, showing access denied");
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">Toegang geweigerd</h2>
              <p className="text-gray-600 mb-4">
                Je moet ingelogd zijn om het huurder dashboard te bekijken.
              </p>
              <Button onClick={handleGoHome}>
                Terug naar home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.role !== "huurder") {
    console.log("Wrong role, showing access denied. User role:", user.role);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">Toegang geweigerd</h2>
              <p className="text-gray-600 mb-4">
                Je hebt geen toegang tot het huurder dashboard.
              </p>
              <Button onClick={handleGoHome}>
                Terug naar home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log("Rendering main dashboard content");

  return (
    <>
      <div
        className={
          showPaymentModal
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

      {showProfileModal && (
        <EnhancedProfileCreationModal
          open={showProfileModal}
          onOpenChange={setShowProfileModal}
          onComplete={onProfileComplete}
          editMode={hasProfile}
        />
      )}

      {showDocumentModal && (
        <DocumentUploadModal
          open={showDocumentModal}
          onOpenChange={setShowDocumentModal}
          onUploadComplete={onDocumentUploadComplete}
        />
      )}

      {showSearchModal && (
        <PropertySearchModal
          open={showSearchModal}
          onOpenChange={setShowSearchModal}
        />
      )}

      {showPaymentModal && <PaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} />}
    </>
  );
};

export default HuurderDashboard;
