import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';

interface EmailVerificationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToDashboard: () => void;
  userName?: string;
}

export const EmailVerificationSuccessModal: React.FC<EmailVerificationSuccessModalProps> = ({
  isOpen,
  onClose,
  onGoToDashboard,
  userName,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <DialogTitle className="text-xl font-semibold">
            E-mail succesvol geverifieerd!
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {userName ? (
              <>Bedankt {userName}! Je account is geactiveerd en klaar voor gebruik.</>
            ) : (
              <>Bedankt! Je account is geactiveerd en klaar voor gebruik.</>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="rounded-lg bg-green-50 p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div className="text-sm text-green-800">
                <p className="font-medium">Je account is volledig geactiveerd!</p>
                <p className="text-green-700 mt-1">
                  Om volledig vindbaar te worden voor verhuurders en voorop te lopen in de zoektocht naar je ideale woning, heb je een halfjaarlijks abonnement nodig.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 p-4">
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-2">🎯 Met Huurly ben je altijd een stap voor</p>
              <ul className="text-blue-700 space-y-1">
                <li>• Word direct vindbaar voor verhuurders</li>
                <li>• Krijg toegang tot exclusieve woningen</li>
                <li>• Gebruik ons geavanceerde matching algoritme</li>
                <li>• Onbeperkte zoekresultaten en premium ondersteuning</li>
              </ul>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Sluiten
            </Button>
            <Button 
              onClick={onGoToDashboard}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Naar Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            Welkom bij Huurly! Start je halfjaarlijks abonnement en kom voorop te staan.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
