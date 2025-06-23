
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoadingState, AccessDeniedState } from '@/components/states';
import { UserRole } from '@/types';

interface WrappedComponentProps {
  // Define any props that the wrapped component might need
}

export function withAuth<P extends WrappedComponentProps>(WrappedComponent: React.ComponentType<P>, requiredRole: UserRole) {
  const WithAuthComponent: React.FC<Omit<P, keyof WrappedComponentProps>> = (props) => {
    const { user, isLoading, isAuthenticated } = useAuth();

    if (isLoading) {
      return <LoadingState message="Authenticatie controleren..." />;
    }

    if (!isAuthenticated || !user || user.role !== requiredRole) {
      return <AccessDeniedState redirectPath="/login" redirectLabel="Ga naar Inloggen" />;
    }

    return <WrappedComponent {...(props as P)} user={user} />;
  };

  return WithAuthComponent;
}
