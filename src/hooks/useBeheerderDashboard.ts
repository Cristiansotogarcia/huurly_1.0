
import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '@/services/DashboardService';
import { userService } from '@/services/UserService';
import { AdminStats, User } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logger';

export const useBeheerderDashboard = () => {
  const [stats, setStats] = useState<AdminStats>({ 
    totalUsers: 0, 
    pendingDocuments: 0,
    totalTenants: 0,
    totalLandlords: 0
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const loadDashboardData = useCallback(async () => {
    // Don't load data if not authenticated or still loading auth
    if (!isAuthenticated || !user || authLoading) {
      logger.info('Skipping dashboard data load - not authenticated or auth still loading');
      return;
    }

    // Only allow beheerder role to load this data
    if (user.role !== 'beheerder') {
      logger.warn('Unauthorized access attempt to admin dashboard data');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [statsResponse, usersResponse] = await Promise.all([
        dashboardService.getAdminStats(),
        userService.getUsers(),
      ]);
      
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
      
      if (usersResponse.success && usersResponse.data) {
        setUsers(usersResponse.data);
      }
    } catch (error) {
      logger.error('Failed to load admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, authLoading]);

  useEffect(() => {
    // Only load data when authentication is complete and user is authenticated
    if (!authLoading && isAuthenticated && user) {
      loadDashboardData();
    } else if (!authLoading && !isAuthenticated) {
      // Auth is complete but user is not authenticated
      setLoading(false);
    }
  }, [loadDashboardData, authLoading, isAuthenticated, user]);

  return { stats, users, loading, refresh: loadDashboardData };
};
