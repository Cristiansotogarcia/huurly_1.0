import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, CreditCard } from 'lucide-react';

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToDashboard: () => void;
  userName?: string;
  subscriptionType?: string;
}

export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  isOpen,
  onClose,
  onGoToDashboard,
  userName,
  subscriptionType = 'Premium',
}) => {
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <DialogTitle className="text-xl font-semibold">
            Betaling succesvol!
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {userName ? (
              <>Bedankt {userName}! Je {subscriptionType} abonnement is nu actief.</>
            ) : (
              <>Bedankt! Je {subscriptionType} abonnement is nu actief.</>
            )}
          </DialogDescription>
        </DialogHeader>
        
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
          
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
              disabled={!canClose}
            >
              Sluiten
            </Button>
            <Button 
              onClick={handleGoToDashboard}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={!canClose}
            >
              Naar Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            Welkom bij Huurly Premium! Veel succes met het vinden van je nieuwe thuis.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};