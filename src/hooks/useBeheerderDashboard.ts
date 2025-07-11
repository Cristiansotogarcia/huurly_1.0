
import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '@/services/DashboardService';
import { userService } from '@/services/UserService';
import { AdminStats, User } from '@/types';

export const useBeheerderDashboard = () => {
  const [stats, setStats] = useState<AdminStats>({ 
    totalUsers: 0, 
    pendingDocuments: 0,
    totalTenants: 0,
    totalLandlords: 0
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
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
      console.error('Failed to load admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return { stats, users, loading, refresh: loadDashboardData };
};
