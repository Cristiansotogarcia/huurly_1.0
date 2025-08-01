import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle } from 'lucide-react';

interface EmailConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

const EmailConfirmationModal: React.FC<EmailConfirmationModalProps> = ({
  isOpen,
  onClose,
  email,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Mail className="h-6 w-6 text-green-600" />
          </div>
          <DialogTitle className="text-xl font-semibold">
            Verificatie e-mail verzonden!
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            We hebben een verificatie e-mail gestuurd naar:
            <br />
            <span className="font-medium text-gray-900">{email}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Volgende stappen:</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• Controleer je inbox (en spam/ongewenste e-mail)</li>
                  <li>• Klik op de verificatielink in de e-mail</li>
                  <li>• Kom terug naar Huurly om door te gaan</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Button onClick={onClose} className="w-full">
              Begrepen
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            Geen e-mail ontvangen? Controleer je spam-map of probeer het over een paar minuten opnieuw.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailConfirmationModal;