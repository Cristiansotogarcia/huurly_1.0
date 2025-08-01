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
import { LucideIcon, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export interface UnifiedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full';
  maxHeight?: string;
  showCloseButton?: boolean;
  closeOnClickOutside?: boolean;
  className?: string;
  contentClassName?: string;
  footer?: React.ReactNode;
}

export interface UnifiedModalActionsProps {
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
    loading?: boolean;
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
  sm: 'max-w-[90vw] sm:max-w-sm',
  md: 'max-w-[90vw] sm:max-w-md',
  lg: 'max-w-[90vw] sm:max-w-lg',
  xl: 'max-w-[90vw] sm:max-w-xl md:max-w-xl',
  '2xl': 'max-w-[90vw] sm:max-w-lg md:max-w-2xl',
  '3xl': 'max-w-[90vw] sm:max-w-xl md:max-w-3xl',
  '4xl': 'max-w-[90vw] sm:max-w-2xl md:max-w-4xl',
  '5xl': 'max-w-[90vw] sm:max-w-2xl md:max-w-5xl',
  '6xl': 'max-w-[90vw] sm:max-w-3xl md:max-w-6xl',
  full: 'max-w-[95vw] sm:max-w-full'
};

export const UnifiedModal: React.FC<UnifiedModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = 'md',
  maxHeight = 'max-h-[80vh]',
  showCloseButton = true,
  closeOnClickOutside = true,
  className = '',
  contentClassName = '',
  footer
}) => {
  const isMobile = useIsMobile();
  
  // On mobile, use full screen; on desktop, use responsive sizing
  const mobileClasses = isMobile 
    ? 'w-full h-full max-w-none max-h-none m-0 rounded-none'
    : `${sizeClasses[size]} ${maxHeight} mx-2 sm:mx-auto`;
  
  const contentPadding = isMobile ? 'p-4' : 'p-6';
  
  return (
    <Dialog 
      open={open} 
      onOpenChange={(openState) => {
        if (!openState && closeOnClickOutside) {
          onOpenChange(false);
        } else if (openState !== false) {
          onOpenChange(openState);
        }
      }}
    >
      <DialogContent 
        className={cn(
          mobileClasses,
          'overflow-y-auto',
          className,
          contentPadding
        )}
        onInteractOutside={(e) => {
          if (!closeOnClickOutside) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader className={cn(
          isMobile ? "pb-4 border-b" : "pb-4",
          "relative"
        )}>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className={cn(
                "text-lg font-semibold",
                isMobile && "text-base"
              )}>
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription className="text-sm text-muted-foreground mt-1">
                  {description}
                </DialogDescription>
              )}
            </div>
            
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className={cn(
                  "h-8 w-8 p-0",
                  isMobile && "h-7 w-7"
                )}
                aria-label="Sluiten"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <div className={cn(
          isMobile ? "flex-1 overflow-y-auto" : "",
          contentClassName
        )}>
          {children}
        </div>
        
        {footer && (
          <DialogFooter className={cn(
            "pt-4",
            isMobile && "border-t"
          )}>
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export const UnifiedModalActions: React.FC<UnifiedModalActionsProps> = ({
  primaryAction,
  secondaryAction,
  cancelAction,
  customActions
}) => {
  const isMobile = useIsMobile();
  
  if (customActions) {
    return (
      <div className={cn(
        "flex justify-end space-x-2",
        isMobile && "flex-col space-y-2 space-x-0"
      )}>
        {customActions}
      </div>
    );
  }

  return (
    <div className={cn(
      "flex gap-2",
      isMobile 
        ? "flex-col-reverse space-y-reverse space-y-2" 
        : "flex-row justify-end"
    )}>
      {cancelAction && (
        <Button
          variant="outline"
          onClick={cancelAction.onClick}
          disabled={cancelAction.disabled}
          className={cn(
            isMobile && "w-full"
          )}
        >
          {cancelAction.label || 'Annuleren'}
        </Button>
      )}
      
      {secondaryAction && (
        <Button
          variant={secondaryAction.variant || 'outline'}
          onClick={secondaryAction.onClick}
          disabled={secondaryAction.disabled || secondaryAction.loading}
          className={cn(
            isMobile && "w-full"
          )}
        >
          {secondaryAction.loading ? `${secondaryAction.label}...` : secondaryAction.label}
        </Button>
      )}
      
      {primaryAction && (
        <Button
          variant={primaryAction.variant || 'default'}
          onClick={primaryAction.onClick}
          disabled={primaryAction.disabled || primaryAction.loading}
          className={cn(
            isMobile && "w-full"
          )}
        >
          {primaryAction.loading ? `${primaryAction.label}...` : primaryAction.label}
        </Button>
      )}
    </div>
  );
};

// Re-export utility hooks for backward compatibility
export { useModalState, useModalForm } from './BaseModal';

export default UnifiedModal;