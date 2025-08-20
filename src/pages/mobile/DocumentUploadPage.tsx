import React from 'react';
import DocumentUploadModal from '@/components/modals/DocumentUploadModal';
import { useModalRouter } from '@/hooks/useModalRouter';

const DocumentUploadPage: React.FC = () => {
  const { closeModal, getModalData } = useModalRouter();
  const modalData = getModalData();
  const onUploadComplete = modalData?.onUploadComplete;

  return (
    <DocumentUploadModal
      open={true}
      onOpenChange={(open) => {
        if (!open) {
          closeModal();
        }
      }}
      onUploadComplete={onUploadComplete || (() => {})}
    />
  );
};

export default DocumentUploadPage;
