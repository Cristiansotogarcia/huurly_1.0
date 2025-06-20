import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { StandardButton } from './StandardButton';
import { cn } from '@/lib/utils';

export interface StandardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnClickOutside?: boolean;
  className?: string;
  contentClassName?: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    loading?: boolean;
    disabled?: boolean;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    loading?: boolean;
    disabled?: boolean;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  };
}

/**
 * StandardModal component for consistent modal dialogs
 * 
 * @param props - Modal properties
 * @returns Standardized modal component
 */
export function StandardModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  showCloseButton = true,
  closeOnClickOutside = true,
  className,
  contentClassName,
  primaryAction,
  secondaryAction,
}: StandardModalProps) {
  // Size classes mapping
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full',
  };
  
  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open && closeOnClickOutside) {
          onClose();
        }
      }}
    >
      <DialogContent 
        className={cn(
          sizeClasses[size],
          'overflow-y-auto max-h-[90vh]',
          className
        )}
        onInteractOutside={(e) => {
          if (!closeOnClickOutside) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader className="relative">
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
          {showCloseButton && (
            <div className="absolute right-0 top-0">
              <StandardButton 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="h-8 w-8 p-0"
                ariaLabel="Sluiten"
              >
                <X className="h-4 w-4" />
              </StandardButton>
            </div>
          )}
        </DialogHeader>
        
        <div className={cn('py-4', contentClassName)}>
          {children}
        </div>
        
        {(footer || primaryAction || secondaryAction) && (
          <DialogFooter className="flex-col space-y-2 sm:space-y-0 sm:flex-row sm:justify-end sm:space-x-2">
            {footer ? (
              footer
            ) : (
              <>
                {secondaryAction && (
                  <StandardButton
                    variant={secondaryAction.variant || 'outline'}
                    onClick={secondaryAction.onClick}
                    disabled={secondaryAction.disabled}
                    loading={secondaryAction.loading}
                  >
                    {secondaryAction.label}
                  </StandardButton>
                )}
                {primaryAction && (
                  <StandardButton
                    variant={primaryAction.variant || 'default'}
                    onClick={primaryAction.onClick}
                    disabled={primaryAction.disabled}
                    loading={primaryAction.loading}
                  >
                    {primaryAction.label}
                  </StandardButton>
                )}
              </>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default StandardModal;