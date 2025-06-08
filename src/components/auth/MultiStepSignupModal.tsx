
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { SignupForm } from './SignupForm';

interface MultiStepSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MultiStepSignupModal = ({ isOpen, onClose }: MultiStepSignupModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <SignupForm onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};
