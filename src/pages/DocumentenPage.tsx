import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { documentService } from "@/services/DocumentService";
import { useNavigate } from "react-router-dom";
import { withAuth } from "@/hocs/withAuth";
import { DocumentsSection } from "@/components/HuurderDashboard/DocumentsSection";
import { DashboardHeader } from "@/components/dashboard";
import { DashboardModals } from "@/components/HuurderDashboard/DashboardModals";
import { useHuurder } from "@/hooks/useHuurder";
import { useHuurderActions } from "@/hooks/useHuurderActions";

const DocumentenPage = () => {
  

  const huurderHook = useHuurder();
  const { toast } = useToast();
  const navigate = useNavigate();
  const {
    user,
    userDocuments,

    profilePictureUrl,
    tenantProfile,
    refresh,
    handleDocumentUploadComplete,
  } = huurderHook;

  const { handleSettings, handleLogout } = useHuurderActions();

  const [showDocumentModal, setShowDocumentModal] = useState(false);



  const handleDeleteDocument = async (documentId: string) => {
    if (!user?.id) return;
    const result = await documentService.deleteDocument(documentId, user.id);
    if (result.success) {
      toast({ title: 'Verwijderd', description: 'Document succesvol verwijderd.' });
      if (refresh) refresh();
    } else if (result.error) {
      toast({ title: 'Fout', description: result.error.message, variant: 'destructive' });
    }
  };

  const onDocumentUploadComplete = async (documents: any[]) => {
    await handleDocumentUploadComplete(documents, () => {
      setShowDocumentModal(false);
      if (refresh) refresh();
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {user && (
        <DashboardHeader
          user={{
            id: user.id,
            name:
              tenantProfile?.personalInfo?.fullName ||
              user.user_metadata?.full_name ||
              user.email,
            role: (user.user_metadata?.role ?? undefined) || "huurder",
            email: user.email || "",
            isActive: true as boolean,
            createdAt: user.createdAt,
            hasPayment: true,
            subscriptionEndDate: undefined,
            profilePictureUrl: profilePictureUrl ?? undefined,
          }}
          onSettings={handleSettings}
          onLogout={handleLogout}
        />
      )}
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Mijn Documenten</h1>
          <Button variant="outline" onClick={() => navigate('/huurder-dashboard')}>Terug</Button>
        </div>
        <DocumentsSection
          userDocuments={userDocuments}
          onShowDocumentModal={() => setShowDocumentModal(true)}
          onDeleteDocument={handleDeleteDocument}
        />
      </div>
      <DashboardModals
        showDocumentModal={showDocumentModal}
        setShowDocumentModal={setShowDocumentModal}
        onDocumentUploadComplete={onDocumentUploadComplete}
        user={user}
        tenantProfile={tenantProfile}
        /* Other modals disabled for this page */
        showProfileModal={false}
        showPaymentModal={false}
        setShowProfileModal={() => {}}
        setShowPaymentModal={() => {}}
        onProfileComplete={async (_profileData) => {}}
      />
    </div>
  );
};

export default withAuth(DocumentenPage, "huurder");