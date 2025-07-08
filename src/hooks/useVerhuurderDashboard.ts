import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { DashboardDataService } from '@/services/DashboardDataService';
import { Property } from '@/services/PropertyService';
import { logger } from '@/lib/logger';

export const useVerhuurderDashboard = (userId?: string) => {
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    // Use provided userId or fall back to user.id from auth store
    const id = userId || user?.id;
    if (!id) return;
    
    setLoading(true);
    try {
      const [statsResponse, propertiesResponse] = await Promise.all([
        DashboardDataService.getLandlordDashboardStats(id),
        DashboardDataService.getLandlordProperties(id) // This method needs to be created
      ]);

      if (statsResponse.success) {
        setDashboardData(statsResponse.data || null);
      }
      if (propertiesResponse.success) {
        setProperties(propertiesResponse.data || []);
      }

    } catch (error) {
      logger.error('An unexpected error occurred while fetching verhuurder dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user, userId]);

  // Return stats from dashboardData for convenience
  const stats = dashboardData || {};
  
  return { properties, stats, loading, refresh: loadDashboardData };
};