import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StandardButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  title?: string;
  ariaLabel?: string;
  form?: string;
}

/**
 * StandardButton component for consistent button styling and behavior
 * 
 * @param props - Button properties
 * @returns Standardized button component
 */
export function StandardButton({
  children,
  onClick,
  type = 'button',
  variant = 'default',
  size = 'default',
  className,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  title,
  ariaLabel,
  form,
  ...props
}: StandardButtonProps) {
  // Determine if button should be disabled
  const isDisabled = disabled || loading;
  
  return (
    <Button
      type={type}
      variant={variant}
      size={size}
      className={cn(
        fullWidth && 'w-full',
        className
      )}
      disabled={isDisabled}
      onClick={onClick}
      title={title}
      aria-label={ariaLabel}
      form={form}
      {...props}
    >
      {loading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      
      {children}
      
      {!loading && icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </Button>
  );
}

export default StandardButton;