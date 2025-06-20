import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'accent' | 'muted' | 'white';
  className?: string;
  text?: string;
  textPosition?: 'top' | 'right' | 'bottom' | 'left';
  fullScreen?: boolean;
}

/**
 * LoadingSpinner component for consistent loading indicators
 * 
 * @param props - Loading spinner properties
 * @returns Standardized loading spinner component
 */
export function LoadingSpinner({
  size = 'md',
  color = 'primary',
  className,
  text,
  textPosition = 'bottom',
  fullScreen = false,
}: LoadingSpinnerProps) {
  // Size classes mapping
  const sizeClasses = {
    xs: 'h-4 w-4',
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  // Color classes mapping
  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
    muted: 'text-muted-foreground',
    white: 'text-white',
  };

  // Text position classes mapping
  const textPositionClasses = {
    top: 'flex-col-reverse',
    right: 'flex-row',
    bottom: 'flex-col',
    left: 'flex-row-reverse',
  };

  // Text margin classes based on position
  const textMarginClasses = {
    top: 'mb-2',
    right: 'ml-2',
    bottom: 'mt-2',
    left: 'mr-2',
  };

  const spinnerContent = (
    <div 
      className={cn(
        'flex items-center justify-center',
        textPositionClasses[textPosition],
        className
      )}
    >
      <Loader2 
        className={cn(
          'animate-spin',
          sizeClasses[size],
          colorClasses[color]
        )} 
      />
      {text && (
        <span className={cn(
          'text-sm font-medium',
          colorClasses[color],
          textMarginClasses[textPosition]
        )}>
          {text}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
}

export default LoadingSpinner;