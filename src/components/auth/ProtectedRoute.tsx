
import { ReactNode, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is authenticated but on wrong dashboard, redirect to correct one
    if (isAuthenticated && user && requiredRole && user.role !== requiredRole) {
      switch (user.role) {
        case 'huurder':
          navigate('/huurder-dashboard', { replace: true });
          break;
        case 'verhuurder':
          navigate('/verhuurder-dashboard', { replace: true });
          break;
        case 'beoordelaar':
          navigate('/beoordelaar-dashboard', { replace: true });
          break;
        case 'beheerder':
          navigate('/beheerder-dashboard', { replace: true });
          break;
        default:
          navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, user, requiredRole, navigate]);

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
    // Will be handled by useEffect above
    return null;
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
