
import React from 'react';
import { EnhancedProfileCreationModal } from '@/components/modals/EnhancedProfileCreationModal';
import DocumentUploadModal from '@/components/modals/DocumentUploadModal';
import PropertySearchModal from '@/components/modals/PropertySearchModal';
import { PaymentModal } from '@/components/PaymentModal';

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

export const DashboardModals: React.FC<DashboardModalsProps> = ({
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
  onDocumentUploadComplete,
}) => {
  return (
    <>
      {/* Profile Creation Modal */}
      <EnhancedProfileCreationModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onComplete={onProfileComplete}
      />

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={showDocumentModal}
        onClose={() => setShowDocumentModal(false)}
        onUploadComplete={onDocumentUploadComplete}
      />

      {/* Property Search Modal */}
      <PropertySearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        hasProfile={hasProfile}
      />

      {/* Persistent Payment Modal - cannot be closed without payment */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        persistent={true}
      />
    </>
  );
};
