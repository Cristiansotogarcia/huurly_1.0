import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmptyState } from './EmptyState';

interface StandardCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  count?: number;
  loading?: boolean;
  emptyState?: {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
      label: string;
      onClick: () => void;
      variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
    };
  };
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
    icon?: LucideIcon;
  };
  children?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export const StandardCard: React.FC<StandardCardProps> = ({
  title,
  description,
  icon: Icon,
  count,
  loading = false,
  emptyState,
  action,
  children,
  className,
  contentClassName
}) => {
  const shouldShowEmptyState = !loading && !children && emptyState;

  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              {Icon && <div className="w-5 h-5 bg-gray-200 rounded mr-2"></div>}
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              {count !== undefined && (
                <div className="h-6 bg-gray-200 rounded w-8 ml-2"></div>
              )}
            </div>
            {action && <div className="h-8 bg-gray-200 rounded w-20"></div>}
          </CardTitle>
        </CardHeader>
        <CardContent className={contentClassName}>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("hover:shadow-md transition-shadow duration-200", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            {Icon && <Icon className="w-5 h-5 mr-2 text-gray-600" />}
            <span>{title}</span>
            {count !== undefined && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({count})
              </span>
            )}
          </div>
          {action && (
            <button
              onClick={action.onClick}
              className={cn(
                "text-sm font-medium transition-colors duration-200",
                action.variant === "destructive" 
                  ? "text-red-600 hover:text-red-800"
                  : "text-blue-600 hover:text-blue-800"
              )}
            >
              {action.icon && <action.icon className="w-4 h-4 mr-1 inline" />}
              {action.label}
            </button>
          )}
        </CardTitle>
      </CardHeader>
      {description && (
        <div className="px-6 -mt-2 mb-2">
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      )}
      <CardContent className={contentClassName}>
        {shouldShowEmptyState ? (
          <EmptyState
            icon={emptyState.icon}
            title={emptyState.title}
            description={emptyState.description}
            action={emptyState.action}
            size="sm"
          />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
};

export default StandardCard;
