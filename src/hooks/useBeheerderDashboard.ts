import { useState, useEffect, useCallback } from 'react';
import { DashboardDataService } from '@/services/DashboardDataService';
import { AdminStats, User } from '@/types';

export const useBeheerderDashboard = () => {
  const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, activeProperties: 0, pendingDocuments: 0 });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, usersData] = await Promise.all([
        DashboardDataService.getAdminStats(),
        DashboardDataService.getAllUsers(),
      ]);
      setStats(statsData);
      setUsers(usersData);
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