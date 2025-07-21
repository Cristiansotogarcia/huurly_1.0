import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ValidationErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  missingFields: string[];
}

export const ValidationErrorModal: React.FC<ValidationErrorModalProps> = ({
  isOpen,
  onClose,
  missingFields,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-left">Vereiste velden ontbreken</DialogTitle>
            </div>
          </div>
        </DialogHeader>
        
        <DialogDescription className="text-left">
          Vul de volgende velden in om door te gaan naar de volgende stap:
        </DialogDescription>
        
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
            {missingFields.map((field, index) => (
              <li key={index}>{field}</li>
            ))}
          </ul>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            Begrepen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};