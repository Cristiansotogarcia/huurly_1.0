import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  };
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className,
  size = "md"
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          container: "py-6",
          icon: "w-10 h-10",
          title: "text-base font-semibold",
          description: "text-sm",
          button: "text-sm"
        };
      case "lg":
        return {
          container: "py-12",
          icon: "w-20 h-20",
          title: "text-xl font-semibold",
          description: "text-base",
          button: "text-base"
        };
      default: // md
        return {
          container: "py-8",
          icon: "w-16 h-16",
          title: "text-lg font-semibold",
          description: "text-sm",
          button: "text-sm"
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <div className={cn("text-center", sizeClasses.container, className)}>
      <Icon className={cn(
        "mx-auto mb-4 text-gray-300",
        sizeClasses.icon
      )} />
      <h3 className={cn(
        "mb-2 text-gray-900",
        sizeClasses.title
      )}>
        {title}
      </h3>
      <p className={cn(
        "text-gray-600 mb-4",
        sizeClasses.description
      )}>
        {description}
      </p>
      {action && (
        <Button
          variant={action.variant || "outline"}
          onClick={action.onClick}
          className={sizeClasses.button}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
