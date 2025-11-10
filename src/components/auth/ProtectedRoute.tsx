
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

type UserRole = 'huurder' | 'verhuurder' | 'beoordelaar' | 'beheerder';

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: UserRole[];
  requiredRole?: UserRole; // Keeping for backward compatibility
}

export const ProtectedRoute = ({ children, roles, requiredRole }: ProtectedRouteProps) => {
  const { user, isLoading, authChecked } = useAuth();

  // Debug logging
  console.log('ProtectedRoute:', { user: !!user, isLoading, authChecked, userId: user?.id, userRole: user?.role });

  // If we have a user, auth has been checked. Otherwise wait for authChecked or isLoading.
  const shouldShowLoading = isLoading || (!user && !authChecked);

  if (shouldShowLoading) {
    console.log('ProtectedRoute: Showing loading screen', { isLoading, authChecked, hasUser: !!user });
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Support both the new roles array and the old requiredRole prop
  if (roles && roles.length > 0 && !roles.includes(user.role as UserRole)) {
    return <Navigate to="/" replace />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Specific route components for type safety
export const HuurderRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute roles={['huurder']}>{children}</ProtectedRoute>
);

export const VerhuurderRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute roles={['verhuurder']}>{children}</ProtectedRoute>
);

export const BeoordelaarRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute roles={['beoordelaar']}>{children}</ProtectedRoute>
);

export const BeheerderRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute roles={['beheerder']}>{children}</ProtectedRoute>
);

export default ProtectedRoute;
