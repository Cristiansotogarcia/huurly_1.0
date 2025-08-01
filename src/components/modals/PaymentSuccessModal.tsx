import React, { useState, useEffect } from 'react';
import UnifiedModal from './UnifiedModal';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, CreditCard } from 'lucide-react';

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToDashboard: () => void;
  userName?: string;
  subscriptionType?: string;
}

export default function PaymentSuccessModal({ isOpen, onClose, onGoToDashboard, userName, subscriptionType = 'Premium' }: PaymentSuccessModalProps) {
  const [canClose, setCanClose] = useState(false);

  // Prevent modal from closing too quickly
  useEffect(() => {
    if (isOpen) {
      setCanClose(false);
      const timer = setTimeout(() => {
        setCanClose(true);
      }, 2000); // 2 second minimum display time

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (canClose) {
      onClose();
    }
  };

  const handleGoToDashboard = () => {
    if (canClose) {
      onGoToDashboard();
    }
  };

  return (
    <UnifiedModal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Betaling gelukt!"
      size="md"
      footer={
        <div className="flex justify-end space-x-2">
          <Button onClick={handleClose} variant="outline">
            Sluiten
          </Button>
          <Button onClick={handleGoToDashboard} variant="default">
            Naar Dashboard
          </Button>
        </div>
      }
    >
        
        <div className="space-y-4">
          <div className="rounded-lg bg-green-50 p-4">
            <div className="flex items-start space-x-3">
              <CreditCard className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-medium mb-1">Je abonnement is geactiveerd!</p>
                <ul className="space-y-1 text-green-700">
                  <li>• Volledige toegang tot alle functies</li>
                  <li>• Onbeperkt zoeken naar woningen</li>
                  <li>• Premium ondersteuning</li>
                  <li>• Prioriteit bij verhuurders</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Klaar om te beginnen!</p>
                <p className="text-blue-700 mt-1">
                  Je kunt nu je profiel voltooien en beginnen met zoeken.
                </p>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            Welkom bij Huurly Premium! Veel succes met het vinden van je nieuwe thuis.
          </p>
        </div>
      </UnifiedModal>
    );
  };