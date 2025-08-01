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
  const { closeModal } = useModalRouter();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      // Default behavior: navigate back
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="p-2 h-auto"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold truncate">{title}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {headerActions}
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="p-2 h-auto"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={cn(
        "flex-1 overflow-auto",
        "p-4 pb-safe", // pb-safe for iOS safe area
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