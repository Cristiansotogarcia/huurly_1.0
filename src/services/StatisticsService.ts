
import { supabase } from '../integrations/supabase/client.ts';
import { DatabaseService } from '../lib/database.ts';

interface ServiceResponse<T> {
  success: boolean;
  data: T | null;
  error: any;
}

interface PropertyStatistics {
  totalProperties: string;
  activeProperties: string;
  activePercentage: string;
  averageRent: string;
  occupancyRate: string;
  rawData: {
    totalProperties: number;
    activeProperties: number;
    averageRent: number;
    occupancyRate: number;
  };
}

interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  usersByRole: Record<string, number>;
}

export class StatisticsService extends DatabaseService {
  async getPropertyStatistics(): Promise<ServiceResponse<PropertyStatistics>> {
    try {
      // Mock data for demo purposes since we don't have property tables
      const mockData = {
        totalProperties: 150,
        activeProperties: 120,
        averageRent: 1250,
        occupancyRate: 85,
      };

      const formatted = {
        totalProperties: mockData.totalProperties.toString(),
        activeProperties: mockData.activeProperties.toString(),
        activePercentage: Math.round((mockData.activeProperties / mockData.totalProperties) * 100).toString() + '%',
        averageRent: '€' + mockData.averageRent.toString(),
        occupancyRate: mockData.occupancyRate.toString() + '%',
        rawData: mockData,
      };

      return {
        success: true,
        data: formatted,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error,
      };
    }
  }

  async getUserStatistics(): Promise<ServiceResponse<UserStatistics>> {
    try {
      const { data: users, error } = await supabase
        .from('gebruikers')
        .select('rol, aangemaakt_op');

      if (error) {
        throw error;
      }

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const totalUsers = users?.length || 0;
      const activeUsers = totalUsers; // Simplified - all users are considered active
      const newUsersThisMonth = users?.filter(user => 
        new Date(user.aangemaakt_op) >= firstDayOfMonth
      ).length || 0;

      const usersByRole = users?.reduce((acc, user) => {
        acc[user.rol] = (acc[user.rol] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return {
        success: true,
        data: {
          totalUsers,
          activeUsers,
          newUsersThisMonth,
          usersByRole,
        },
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error,
      };
    }
  }

  async getDashboardStats(userId: string): Promise<ServiceResponse<any>> {
    try {
      const propertyStats = await this.getPropertyStatistics();
      const userStats = await this.getUserStatistics();

      return {
        success: true,
        data: {
          properties: propertyStats.data,
          users: userStats.data,
        },
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error,
      };
    }
  }
}

export const statisticsService = new StatisticsService();
