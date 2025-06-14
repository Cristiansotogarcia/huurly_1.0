
import EnhancedProfileCreationModal from "@/components/modals/EnhancedProfileCreationModal";
import DocumentUploadModal from "@/components/modals/DocumentUploadModal";
import PropertySearchModal from "@/components/modals/PropertySearchModal";
import { PaymentModal } from "@/components/PaymentModal";

interface DashboardModalsProps {
  showProfileModal: boolean;
  showDocumentModal: boolean;
  showSearchModal: boolean;
  showPaymentModal: boolean;
  hasProfile: boolean;
  setShowProfileModal: (show: boolean) => void;
  setShowDocumentModal: (show: boolean) => void;
  setShowSearchModal: (show: boolean) => void;
  setShowPaymentModal: (show: boolean) => void;
  onProfileComplete: (profileData: any) => Promise<void>;
  onDocumentUploadComplete: (documents: any[]) => Promise<void>;
}

export const DashboardModals = ({
  showProfileModal,
  showDocumentModal,
  showSearchModal,
  showPaymentModal,
  hasProfile,
  setShowProfileModal,
  setShowDocumentModal,
  setShowSearchModal,
  setShowPaymentModal,
  onProfileComplete,
  onDocumentUploadComplete
}: DashboardModalsProps) => {
  return (
    <>
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

      {showPaymentModal && (
        <PaymentModal 
          isOpen={showPaymentModal} 
          onClose={() => setShowPaymentModal(false)} 
        />
      )}
    </>
  );
};
