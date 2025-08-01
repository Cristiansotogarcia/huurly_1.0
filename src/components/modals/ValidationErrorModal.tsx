import React from 'react';
import UnifiedModal from './UnifiedModal';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ValidationErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  missingFields: string[];
}

const ValidationErrorModal: React.FC<ValidationErrorModalProps> = ({
  isOpen,
  onClose,
  missingFields,
}) => {
  return (
    <UnifiedModal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Ontbrekende velden"
      size="sm"
      footer={
        <div className="flex justify-end">
          <Button onClick={onClose} variant="default">
            Begrepen
          </Button>
        </div>
      }
    >
      <div>
        <p className="text-sm text-gray-600 mb-3">
          Vul de volgende velden in om door te gaan naar de volgende stap:
        </p>
        
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
            {missingFields.map((field, index) => (
              <li key={index}>{field}</li>
            ))}
          </ul>
        </div>
      </div>
    </UnifiedModal>
  );
};

export default ValidationErrorModal;