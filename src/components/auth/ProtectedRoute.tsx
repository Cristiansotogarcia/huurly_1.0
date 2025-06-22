
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
  const { user, isLoading } = useAuth();

  if (isLoading) {
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
