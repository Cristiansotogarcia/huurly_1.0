import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

export interface BaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  maxHeight?: string;
  showCloseButton?: boolean;
  className?: string;
}

export interface BaseModalActionsProps {
  primaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    className?: string;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    className?: string;
  };
  cancelAction?: {
    label?: string;
    onClick?: () => void;
    disabled?: boolean;
  };
  customActions?: React.ReactNode;
}

const sizeClasses = {
  sm: 'max-w-[95vw] sm:max-w-sm',
  md: 'max-w-[95vw] sm:max-w-md',
  lg: 'max-w-[95vw] sm:max-w-lg',
  xl: 'max-w-[95vw] sm:max-w-xl',
  '2xl': 'max-w-[95vw] sm:max-w-2xl',
  '3xl': 'max-w-[95vw] sm:max-w-3xl',
  '4xl': 'max-w-[95vw] sm:max-w-4xl',
  '5xl': 'max-w-[95vw] sm:max-w-5xl',
  '6xl': 'max-w-[95vw] sm:max-w-6xl'
};

export const BaseModal: React.FC<BaseModalProps> = ({
  open,
  onOpenChange,
  title,
  icon: Icon,
  children,
  size = 'md',
  maxHeight = 'max-h-[90vh]',
  showCloseButton = true,
  className = ''
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`${sizeClasses[size]} ${maxHeight} overflow-y-auto mx-4 sm:mx-auto ${className}`}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {Icon && <Icon className="w-5 h-5 mr-2" />}
            {title}
          </DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};

export const BaseModalActions: React.FC<BaseModalActionsProps> = ({
  primaryAction,
  secondaryAction,
  cancelAction,
  customActions
}) => {
  if (customActions) {
    return <div className="flex justify-end pt-4 border-t space-x-2">{customActions}</div>;
  }

  return (
    <div className="flex flex-col sm:flex-row justify-end pt-4 border-t space-y-2 sm:space-y-0 sm:space-x-2">
      {cancelAction && (
        <Button
          variant="outline"
          onClick={cancelAction.onClick}
          disabled={cancelAction.disabled}
          className="w-full sm:w-auto"
        >
          {cancelAction.label || 'Annuleren'}
        </Button>
      )}
      
      {secondaryAction && (
        <Button
          variant={secondaryAction.variant || 'outline'}
          onClick={secondaryAction.onClick}
          disabled={secondaryAction.disabled}
          className={`w-full sm:w-auto ${secondaryAction.className || ''}`}
        >
          {secondaryAction.label}
        </Button>
      )}
      
      {primaryAction && (
        <Button
          variant={primaryAction.variant || 'default'}
          onClick={primaryAction.onClick}
          disabled={primaryAction.disabled || primaryAction.loading}
          className={`w-full sm:w-auto ${primaryAction.className || ''}`}
        >
          {primaryAction.loading ? `${primaryAction.label}...` : primaryAction.label}
        </Button>
      )}
    </div>
  );
};

// Utility hook for common modal state management
export const useModalState = (initialOpen = false) => {
  const [open, setOpen] = React.useState(initialOpen);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const openModal = () => setOpen(true);
  const closeModal = () => setOpen(false);
  const toggleModal = () => setOpen(prev => !prev);

  return {
    open,
    setOpen,
    openModal,
    closeModal,
    toggleModal,
    isSubmitting,
    setIsSubmitting
  };
};

// Utility hook for form validation
export const useModalForm = <T extends Record<string, any>>(
  initialData: T,
  validationFn?: (data: T) => boolean
) => {
  const [data, setData] = React.useState<T>(initialData);
  const [errors, setErrors] = React.useState<Partial<Record<keyof T, string>>>({});

  const updateField = (field: keyof T, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const resetForm = () => {
    setData(initialData);
    setErrors({});
  };

  const isValid = validationFn ? validationFn(data) : true;

  const setFieldError = (field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  return {
    data,
    setData,
    updateField,
    resetForm,
    isValid,
    errors,
    setErrors,
    setFieldError
  };
};

export default BaseModal;
