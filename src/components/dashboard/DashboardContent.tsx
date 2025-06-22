import React from 'react';

interface DashboardContentProps {
  children: React.ReactNode;
  className?: string;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ 
  children,
  className = ''
}) => {
  return (
    <main className={`max-w-7xl mx-auto px-4 sm:px-6 py-6 ${className}`}>
      {children}
    </main>
  );
};

export default DashboardContent;