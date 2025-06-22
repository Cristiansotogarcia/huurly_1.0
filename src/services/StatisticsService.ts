import { supabase } from '../integrations/supabase/client';
import { logger } from '../lib/logger';
import { formatCurrency, formatNumber, formatPercentage } from '../utils/formatting';
import { ServiceResponse } from './BaseService';

export interface StatisticsResponse<T> {
  success: boolean;
  data?: T;
  error?: any;
}

export interface PropertyStatistics {
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

/**
 * Service for handling statistics-related data operations
 */
export class StatisticsService {
  async getPropertyStatistics(): Promise<ServiceResponse<PropertyStatistics>> {
    try {
      // Get total properties count
      const { count: totalProperties } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });

      // Get active properties count
      const { count: activeProperties } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get inactive properties count
      const { count: inactiveProperties } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .not('status', 'eq', 'active');
      
      // Get average rent price
      const { data: rentData, error: rentError } = await supabase
        .from('properties')
        .select('rent_amount')
        .not('rent_amount', 'is', null);
      
      if (rentError) {
        logger.error('Error fetching rent data:', rentError);
      }
      
      // Calculate average rent
      // Using type assertion for property.rent_amount since it's not defined in the types
      const totalRent = rentData?.reduce((sum, property) => sum + (Number((property as any).rent_amount) || 0), 0) || 0;
      const averageRent = rentData && rentData.length > 0 ? totalRent / rentData.length : 0;
      
      // Get occupancy rate
      const { count: occupiedCount, error: occupiedError } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('is_occupied', true);
      
      if (occupiedError) {
        logger.error('Error fetching occupied property count:', occupiedError);
      }
      
      const occupancyRate = totalProperties ? (occupiedCount || 0) / totalProperties : 0;
      
      // Format the statistics
      const statistics = {
        totalProperties: formatNumber(totalProperties || 0),
        activeProperties: formatNumber(activeProperties || 0),
        activePercentage: formatPercentage(totalProperties ? (activeProperties || 0) / (totalProperties || 0) : 0),
        averageRent: formatCurrency(averageRent),
        occupancyRate: formatPercentage(occupancyRate),
        rawData: {
          totalProperties: totalProperties || 0,
          activeProperties: activeProperties || 0,
          averageRent,
          occupancyRate
        }
      };
      
      logger.info('Property statistics fetched successfully:', statistics);
      return { success: true, data: statistics };
    } catch (error) {
      logger.error('Error in getPropertyStatistics:', error);
      return { success: false, error };
    }
  }
  
  /**
   * Get user statistics for admins
   * @returns User statistics
   */
  async getUserStatistics(): Promise<StatisticsResponse<any>> {
    try {
      logger.info('Fetching user statistics');
      
      // Get total users count
      const { count: totalUsers, error: usersError } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true });
      
      if (usersError) {
        logger.error('Error fetching user count:', usersError);
        return { success: false, error: usersError };
      }
      
      // Get users by role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role');
      
      if (roleError) {
        logger.error('Error fetching user roles:', roleError);
      }
      
      // Count users by role
      const roleCount = roleData?.reduce((counts, user) => {
        const role = user.role || 'unknown';
        counts[role] = (counts[role] || 0) + 1;
        return counts;
      }, {} as Record<string, number>) || {};
      
      // Get active users (with active subscription)
      const { count: activeUsers, error: activeError } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_status', 'active');
      
      if (activeError) {
        logger.error('Error fetching active users:', activeError);
      }
      
      // Get new users in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: newUsers, error: newError } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());
      
      if (newError) {
        logger.error('Error fetching new users:', newError);
      }
      
      // Format the statistics
      const statistics = {
        totalUsers: formatNumber(totalUsers || 0),
        activeUsers: formatNumber(activeUsers || 0),
        activePercentage: formatPercentage(totalUsers ? (activeUsers || 0) / totalUsers : 0),
        newUsers: formatNumber(newUsers || 0),
        newUserPercentage: formatPercentage(totalUsers ? (newUsers || 0) / totalUsers : 0),
        roleDistribution: Object.entries(roleCount).map(([role, count]) => ({
          role,
          count: formatNumber(count),
          percentage: formatPercentage(totalUsers ? count / totalUsers : 0)
        })),
        rawData: {
          totalUsers: totalUsers || 0,
          activeUsers: activeUsers || 0,
          newUsers: newUsers || 0,
          roleCount
        }
      };
      
      logger.info('User statistics fetched successfully:', statistics);
      return { success: true, data: statistics };
    } catch (error) {
      logger.error('Error in getUserStatistics:', error);
      return { success: false, error };
    }
  }
  
  /**
   * Get revenue statistics
   * @param userId - The ID of the landlord user (optional, if not provided returns global stats)
   * @returns Revenue statistics
   */
  async getRevenueStatistics(userId?: string): Promise<StatisticsResponse<any>> {
    try {
      logger.info('Fetching revenue statistics', userId ? `for user: ${userId}` : 'global');
      
      // Base query for payments
      let query = supabase.from('payment_records');
      
      // If userId is provided, filter by user_id
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      // Get total revenue
      const { data: payments, error: paymentsError } = await query
        .select('amount, created_at')
        .eq('status', 'completed');
      
      if (paymentsError) {
        logger.error('Error fetching payments:', paymentsError);
        return { success: false, error: paymentsError };
      }
      
      // Calculate total revenue
      const totalRevenue = payments?.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0) || 0;
      
      // Group payments by month for the last 12 months
      const now = new Date();
      const monthlyRevenue: Record<string, number> = {};
      
      // Initialize last 12 months with zero values
      for (let i = 0; i < 12; i++) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
        monthlyRevenue[monthKey] = 0;
      }
      
      // Fill in actual revenue data
      payments?.forEach(payment => {
        if (payment.created_at) {
          const date = new Date(payment.created_at);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          if (monthlyRevenue[monthKey] !== undefined) {
            monthlyRevenue[monthKey] += Number(payment.amount) || 0;
          }
        }
      });
      
      // Calculate monthly average
      const monthlyValues = Object.values(monthlyRevenue);
      const monthlyAverage = monthlyValues.reduce((sum, value) => sum + value, 0) / monthlyValues.length;
      
      // Get current month revenue
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const currentMonthRevenue = monthlyRevenue[currentMonth] || 0;
      
      // Calculate growth rate compared to previous month
      const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const previousMonthKey = `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, '0')}`;
      const previousMonthRevenue = monthlyRevenue[previousMonthKey] || 0;
      
      const growthRate = previousMonthRevenue ? (currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue : 0;
      
      // Format the statistics
      const statistics = {
        totalRevenue: formatCurrency(totalRevenue),
        monthlyAverage: formatCurrency(monthlyAverage),
        currentMonthRevenue: formatCurrency(currentMonthRevenue),
        growthRate: formatPercentage(growthRate),
        monthlyRevenue: Object.entries(monthlyRevenue).map(([month, amount]) => ({
          month,
          amount: formatCurrency(amount),
          rawAmount: amount
        })).sort((a, b) => a.month.localeCompare(b.month)),
        rawData: {
          totalRevenue,
          monthlyAverage,
          currentMonthRevenue,
          growthRate,
          monthlyRevenue
        }
      };
      
      logger.info('Revenue statistics fetched successfully:', statistics);
      return { success: true, data: statistics };
    } catch (error) {
      logger.error('Error in getRevenueStatistics:', error);
      return { success: false, error };
    }
  }
  
  /**
   * Get document statistics for reviewers
   * @param userId - The ID of the reviewer user (optional, if not provided returns global stats)
   * @returns Document statistics
   */
  async getDocumentStatistics(userId?: string): Promise<StatisticsResponse<any>> {
    try {
      logger.info('Fetching document statistics', userId ? `for user: ${userId}` : 'global');
      
      // Base query for documents
      let query = supabase.from('user_documents');
      
      // If userId is provided, filter by approved_by
      if (userId) {
        query = query.eq('approved_by', userId);
      }
      
      // Get total documents count
      const { count: totalDocuments, error: countError } = await supabase
        .from('user_documents')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        logger.error('Error fetching document count:', countError);
        return { success: false, error: countError };
      }
      
      // Get pending documents count
      const { count: pendingDocuments, error: pendingError } = await supabase
        .from('user_documents')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      
      if (pendingError) {
        logger.error('Error fetching pending document count:', pendingError);
      }
      
      // Get approved documents count
      const { count: approvedDocuments, error: approvedError } = await supabase
        .from('user_documents')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');
      
      if (approvedError) {
        logger.error('Error fetching approved document count:', approvedError);
      }
      
      // Get rejected documents count
      const { count: rejectedDocuments, error: rejectedError } = await supabase
        .from('user_documents')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'rejected');
      
      if (rejectedError) {
        logger.error('Error fetching rejected document count:', rejectedError);
      }
      
      // Get documents by type
      const { data: typeData, error: typeError } = await supabase
        .from('user_documents')
        .select('document_type');
      
      if (typeError) {
        logger.error('Error fetching document types:', typeError);
      }
      
      // Count documents by type
      const typeCount = typeData?.reduce((counts, doc) => {
        const type = doc.document_type || 'unknown';
        counts[type] = (counts[type] || 0) + 1;
        return counts;
      }, {} as Record<string, number>) || {};
      
      // Format the statistics
      const statistics = {
        totalDocuments: formatNumber(totalDocuments || 0),
        pendingDocuments: formatNumber(pendingDocuments || 0),
        pendingPercentage: formatPercentage(totalDocuments ? (pendingDocuments || 0) / (totalDocuments || 0) : 0),
        approvedDocuments: formatNumber(approvedDocuments || 0),
        approvedPercentage: formatPercentage(totalDocuments ? (approvedDocuments || 0) / (totalDocuments || 0) : 0),
        rejectedDocuments: formatNumber(rejectedDocuments || 0),
        rejectedPercentage: formatPercentage(totalDocuments ? (rejectedDocuments || 0) / (totalDocuments || 0) : 0),
        typeDistribution: Object.entries(typeCount).map(([type, count]) => ({
          type,
          count: formatNumber(count),
          percentage: formatPercentage(totalDocuments ? count / (totalDocuments as number) : 0)
        })),
        rawData: {
          totalDocuments: totalDocuments || 0,
          pendingDocuments: pendingDocuments || 0,
          approvedDocuments: approvedDocuments || 0,
          rejectedDocuments: rejectedDocuments || 0,
          typeCount
        }
      };
      
      logger.info('Document statistics fetched successfully:', statistics);
      return { success: true, data: statistics };
    } catch (error) {
      logger.error('Error in getDocumentStatistics:', error);
      return { success: false, error };
    }
  }
}

export default StatisticsService;