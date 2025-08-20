import React from 'react';
import PaymentModal from '@/components/PaymentModal';
import { useModalRouter } from '@/hooks/useModalRouter';

const PaymentPage: React.FC = () => {
  const { closeModal } = useModalRouter();

  return (
    <PaymentModal
      isOpen={true}
      onClose={(open) => {
        if (!open) closeModal();
      }}
    />
  );
};

export default PaymentPage;
