import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requirePayment?: boolean;
  fallbackPath?: string;
}

export const ProtectedRoute = ({ 
  children, 
  allowedRoles, 
  requirePayment = false,
  fallbackPath = '/' 
}: ProtectedRouteProps) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Give a moment for auth to initialize
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Show loading spinner while checking authentication
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-dutch-blue" />
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check payment requirement
  if (requirePayment && !user.hasPayment) {
    return <Navigate to="/payment-required" replace />;
  }

  return <>{children}</>;
};

// Higher-order component for easier usage
export const withProtectedRoute = (
  Component: React.ComponentType,
  options?: Omit<ProtectedRouteProps, 'children'>
) => {
  return (props: any) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

// Specific role-based route components
export const HuurderRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute allowedRoles={['huurder']} requirePayment={true}>
    {children}
  </ProtectedRoute>
);

export const VerhuurderRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute allowedRoles={['verhuurder']} requirePayment={true}>
    {children}
  </ProtectedRoute>
);

export const BeoordelaarRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute allowedRoles={['beoordelaar']}>
    {children}
  </ProtectedRoute>
);

export const BeheerderRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute allowedRoles={['beheerder']}>
    {children}
  </ProtectedRoute>
);

export const AdminRoute = ({ children }: { children: ReactNode }) => (
  <ProtectedRoute allowedRoles={['beoordelaar', 'beheerder']}>
    {children}
  </ProtectedRoute>
);
