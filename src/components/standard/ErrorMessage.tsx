import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { StandardButton } from './StandardButton';
import { cn } from '@/lib/utils';
import { UI_TEXT } from '@/utils/constants';

export interface ErrorMessageProps {
  title?: string;
  message: string;
  variant?: 'default' | 'destructive';
  className?: string;
  showIcon?: boolean;
  showRetry?: boolean;
  onRetry?: () => void;
  retryText?: string;
  retryLoading?: boolean;
  compact?: boolean;
}

/**
 * ErrorMessage component for consistent error display
 * 
 * @param props - Error message properties
 * @returns Standardized error message component
 */
export function ErrorMessage({
  title = UI_TEXT.errors.defaultTitle,
  message,
  variant = 'destructive',
  className,
  showIcon = true,
  showRetry = false,
  onRetry,
  retryText = UI_TEXT.buttons.retry,
  retryLoading = false,
  compact = false,
}: ErrorMessageProps) {
  return (
    <Alert 
      variant={variant}
      className={cn(
        compact ? 'py-2' : 'py-4',
        className
      )}
    >
      {showIcon && (
        <AlertCircle className={cn(
          'h-4 w-4',
          compact ? 'mr-2' : 'mr-3'
        )} />
      )}
      <div className="flex flex-col space-y-1">
        <AlertTitle className={cn(
          compact ? 'text-sm' : 'text-base'
        )}>
          {title}
        </AlertTitle>
        <AlertDescription className={cn(
          compact ? 'text-xs' : 'text-sm'
        )}>
          {message}
        </AlertDescription>
        
        {showRetry && onRetry && (
          <div className="mt-2">
            <StandardButton
              variant="outline"
              size={compact ? 'sm' : 'default'}
              onClick={onRetry}
              loading={retryLoading}
              icon={<RefreshCw className="h-3 w-3" />}
            >
              {retryText}
            </StandardButton>
          </div>
        )}
      </div>
    </Alert>
  );
}

export default ErrorMessage;