
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export const HuurderRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute requiredRole="huurder">{children}</ProtectedRoute>
);

export const VerhuurderRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute requiredRole="verhuurder">{children}</ProtectedRoute>
);

export const BeoordelaarRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute requiredRole="beoordelaar">{children}</ProtectedRoute>
);

export const BeheerderRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute requiredRole="beheerder">{children}</ProtectedRoute>
);
