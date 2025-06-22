import React from 'react';
import { StatsWidget, StatsWidgetProps } from './StatsWidget'; // Assuming StatsWidgetProps is exported
import { cn } from '@/lib/utils';

interface StatsGridProps {
  stats: StatsWidgetProps[];
  className?: string;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats, className }) => {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {stats.map((stat, index) => (
        <StatsWidget key={index} {...stat} />
      ))}
    </div>
  );
};

export default StatsGrid;