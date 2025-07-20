import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatsWidgetProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color?: string;
  loading?: boolean;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  className?: string;
}

export const StatsWidget: React.FC<StatsWidgetProps> = ({
  title,
  value,
  icon: Icon,
  color = "blue-600",
  loading = false,
  trend,
  className
}) => {
  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      "blue-600": "text-blue-600",
      "dutch-blue": "text-blue-700",
      "dutch-orange": "text-orange-600",
      "green-600": "text-green-600",
      "purple-600": "text-purple-600",
      "red-600": "text-red-600",
      "yellow-600": "text-yellow-600",
      "gray-600": "text-gray-600"
    };
    return colorMap[color] || "text-blue-600";
  };

  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardContent className="p-3">
          <div className="flex items-center">
            <div className="h-6 w-6 bg-gray-200 rounded"></div>
            <div className="ml-3 flex-1">
              <div className="h-6 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("hover:shadow-md transition-shadow duration-200 bg-white/80 backdrop-blur-sm", className)}>
      <CardContent className="p-3">
        <div className="flex items-center">
          <Icon className={cn("h-6 w-6", getColorClasses(color))} />
          <div className="ml-3 flex-1">
            <p className="text-lg sm:text-xl font-bold text-gray-900">
              {typeof value === 'number' ? value.toLocaleString('nl-NL') : value}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              {title}
            </p>
            {trend && (
              <div className="flex items-center mt-1">
                <span className={cn(
                  "text-xs font-medium",
                  trend.isPositive !== false ? "text-green-600" : "text-red-600"
                )}>
                  {trend.isPositive !== false ? "+" : ""}{trend.value}
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  {trend.label}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsWidget;
