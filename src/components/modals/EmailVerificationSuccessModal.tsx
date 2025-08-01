import React from 'react';
import UnifiedModal from './UnifiedModal';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';

interface EmailVerificationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToDashboard: () => void;
  userName?: string;
}

const EmailVerificationSuccessModal: React.FC<EmailVerificationSuccessModalProps> = ({
  isOpen,
  onClose,
  onGoToDashboard,
  userName,
}) => {
  return (
    <UnifiedModal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Email geverifieerd!"
      size="md"
      footer={
        <div className="flex justify-end space-x-2">
          <Button onClick={onClose} variant="outline">
            Sluiten
          </Button>
          <Button onClick={onGoToDashboard} variant="default">
            Naar Dashboard
          </Button>
        </div>
      }
    >
        
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
          
          <p className="text-xs text-gray-500 text-center">
            Welkom bij Huurly! Start je halfjaarlijks abonnement en kom voorop te staan.
          </p>
        </div>
      </UnifiedModal>
    );
  };

export default EmailVerificationSuccessModal;
