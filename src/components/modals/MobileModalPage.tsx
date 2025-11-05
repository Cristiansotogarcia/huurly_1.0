import React from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useModalRouter } from '@/hooks/useModalRouter';
import { cn } from '@/lib/utils';

export interface MobileModalPageProps {
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
  showCloseButton?: boolean;
  className?: string;
  headerActions?: React.ReactNode;
}

/**
 * Mobile-optimized full-page wrapper for modal content
 * Provides the same interface as BaseModal but as a dedicated page
 */
const MobileModalPage: React.FC<MobileModalPageProps> = ({
  title,
  children,
  onClose,
  showCloseButton = true,
  className,
  headerActions
}) => {


  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      // Default behavior: navigate back
      window.history.back();
    }
  };

  return (
    <div className="h-dvh bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
        <div className="flex items-center justify-between p-3 sm:p-4 pt-safe">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="p-1.5 sm:p-2 h-auto shrink-0"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <h1 className="text-base sm:text-lg font-semibold truncate">{title}</h1>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {headerActions}
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="p-1.5 sm:p-2 h-auto"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={cn(
        "flex-1 overflow-auto touch-scroll",
        "p-3 sm:p-4 pb-safe",
        className
      )}>
        {children}
      </div>
    </div>
  );
};

/**
 * Hook for mobile modal page functionality
 */
export const useMobileModalPage = (modalName: string) => {
  const { isOnMobileModalPage, getModalData, closeModal } = useModalRouter();
  
  const isCurrentPage = isOnMobileModalPage(modalName);
  const modalData = getModalData();
  
  return {
    isCurrentPage,
    modalData,
    closeModal
  };
};

export default MobileModalPage;
