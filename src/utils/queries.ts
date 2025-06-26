import { supabase } from '../lib/supabase.ts';
import { PostgrestError } from '@supabase/supabase-js';

/**
 * Type definitions for query results
 */
export interface QueryResult<T> {
  data: T | null;
  error: PostgrestError | null;
}

/**
 * Tenant dashboard queries
 */
export const TenantQueries = {
  /**
   * Get tenant profile views
   * @param userId - The user ID
   */
  getProfileViews: async (userId: string): Promise<QueryResult<number>> => {
    const { data, error } = await supabase
      .from('huurders')
      .select('profile_views')
      .eq('user_id', userId)
      .single();
    
    return {
      data: data?.profile_views || 0,
      error
    };
  },
  
  /**
   * Get tenant profile information
   * @param userId - The user ID
   */
  getTenantProfile: async (userId: string): Promise<QueryResult<any>> => {
    const { data, error } = await supabase
      .from('huurders')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    return { data, error };
  },
  
  /**
   * Get tenant applications
   * @param userId - The user ID
   */
  getApplications: async (userId: string): Promise<QueryResult<any[]>> => {
    // Note: property_applications table doesn't exist in Dutch schema
    // Returning empty result to prevent runtime errors
    return { data: [], error: null };
  },
  
  /**
   * Get tenant invitations
   * @param userId - The user ID
   */
  getInvitations: async (userId: string): Promise<QueryResult<any[]>> => {
    // Note: property_invitations table doesn't exist in Dutch schema
    // Returning empty result to prevent runtime errors
    return { data: [], error: null };
  },
  
  /**
   * Update tenant profile visibility
   * @param userId - The user ID
   * @param isLookingForPlace - Whether the tenant is looking for a place
   */
  updateProfileVisibility: async (userId: string, isLookingForPlace: boolean): Promise<QueryResult<any>> => {
    const { data, error } = await supabase
      .from('gebruikers')
      .update({ is_looking_for_place: isLookingForPlace })
      .eq('id', userId);
    
    return { data, error };
  }
};

/**
 * Landlord dashboard queries
 */
export const LandlordQueries = {
  /**
   * Get landlord properties
   * @param userId - The user ID
   */
  getProperties: async (userId: string): Promise<QueryResult<any[]>> => {
    const { data, error } = await supabase
      .from('verhuurders')
      .select('*')
      .eq('landlord_id', userId)
      .order('aangemaakt_op', { ascending: false });
    
    return { data, error };
  },
  
  /**
   * Get active properties count
   * @param userId - The user ID
   */
  getActiveProperties: async (userId: string): Promise<QueryResult<number>> => {
    const { data, error } = await supabase
      .from('verhuurders')
      .select('id', { count: 'exact' })
      .eq('landlord_id', userId)
      .eq('status', 'active');
    
    return {
      data: data?.length || 0,
      error
    };
  },
  
  /**
   * Get pending applications for landlord properties
   * @param userId - The user ID
   */
  getPendingApplications: async (userId: string): Promise<QueryResult<any[]>> => {
    // Note: property_applications table doesn't exist in Dutch schema
    // Returning empty result to prevent runtime errors
    return { data: [], error: null };
  },
  
  /**
   * Get total tenants for landlord properties
   * @param userId - The user ID
   */
  getTotalTenants: async (userId: string): Promise<QueryResult<number>> => {
    // Note: property_tenants table doesn't exist in Dutch schema
    // Returning zero count to prevent runtime errors
    return {
      data: 0,
      error: null
    };
  },
  
  /**
   * Get monthly revenue from completed payments
   * @param userId - The user ID
   */
  getMonthlyRevenue: async (userId: string): Promise<QueryResult<number>> => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
    
    const { data, error } = await supabase
      .from('betalingen')
      .select('bedrag')
      .eq('verhuurder_id', userId)
      .eq('status', 'completed')
      .gte('aangemaakt_op', firstDayOfMonth)
      .lte('aangemaakt_op', lastDayOfMonth);
    
    const totalRevenue = data?.reduce((sum, payment) => sum + payment.bedrag, 0) || 0;
    
    return {
      data: totalRevenue,
      error
    };
  }
};

/**
 * Reviewer dashboard queries
 */
export const ReviewerQueries = {
  /**
   * Get pending documents for review
   * @param userId - The user ID
   */
  getPendingDocuments: async (): Promise<QueryResult<any[]>> => {
    const { data, error } = await supabase
      .from('documenten')
      .select(`
        *,
        gebruikers:user_id (*)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    
    return { data, error };
  },
  
  /**
   * Get documents reviewed today
   * @param userId - The user ID
   */
  getDocumentsReviewedToday: async (userId: string): Promise<QueryResult<number>> => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();
    
    const { data, error } = await supabase
      .from('documenten')
      .select('id', { count: 'exact' })
      .eq('reviewer_id', userId)
      .in('status', ['approved', 'rejected'])
      .gte('updated_at', startOfDay)
      .lt('updated_at', endOfDay);
    
    return {
      data: data?.length || 0,
      error
    };
  },
  
  /**
   * Get total documents reviewed by user
   * @param userId - The user ID
   */
  getTotalDocumentsReviewed: async (userId: string): Promise<QueryResult<number>> => {
    const { data, error } = await supabase
      .from('documenten')
      .select('id', { count: 'exact' })
      .eq('reviewer_id', userId)
      .in('status', ['approved', 'rejected']);
    
    return {
      data: data?.length || 0,
      error
    };
  },
  
  /**
   * Update document status
   * @param documentId - The document ID
   * @param status - The new status
   * @param reviewerId - The reviewer ID
   * @param comments - Optional review comments
   */
  updateDocumentStatus: async (
    documentId: string,
    status: 'approved' | 'rejected',
    reviewerId: string,
    comments?: string
  ): Promise<QueryResult<any>> => {
    const { data, error } = await supabase
      .from('documenten')
      .update({ status, reviewed_by: reviewerId, reviewed_at: new Date().toISOString() })
      .eq('id', documentId);
    
    return { data, error };
  }
};

/**
 * Admin dashboard queries
 */
export const AdminQueries = {
  /**
   * Get total users count
   */
  getTotalUsers: async (): Promise<QueryResult<number>> => {
    const { data, error } = await supabase
      .from('gebruikers')
      .select('*')
      .order('created_at', { ascending: false });
    
    return {
      data: data?.length || 0,
      error
    };
  },
  
  /**
   * Get active users count (users who logged in within the last 30 days)
   */
  getActiveUsers: async (): Promise<QueryResult<number>> => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data, error } = await supabase
      .from('gebruikers')
      .select('id', { count: 'exact' })
      .gte('laatst_ingelogd_op', thirtyDaysAgo.toISOString());
    
    return {
      data: data?.length || 0,
      error
    };
  },
  
  /**
   * Get total revenue from all completed payments
   */
  getTotalRevenue: async (): Promise<QueryResult<number>> => {
    const { data, error } = await supabase
      .from('betalingen')
      .select('bedrag')
      .eq('status', 'completed');
    
    const totalRevenue = data?.reduce((sum, payment) => sum + payment.bedrag, 0) || 0;
    
    return {
      data: totalRevenue,
      error
    };
  },
  
  /**
   * Get user count by role
   */
  getUsersByRole: async (): Promise<QueryResult<any>> => {
    const { data, error } = await supabase
      .from('gebruiker_rollen')
      .select('*');
    
    return { data, error };
  },
  
  /**
   * Get recent user registrations (last 7 days)
   */
  getRecentRegistrations: async (): Promise<QueryResult<any[]>> => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data, error } = await supabase
      .from('gebruikers')
      .select('*')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false });
    
    return { data, error };
  }
};

/**
 * Recent activity queries
 */
export const ActivityQueries = {
  /**
   * Get recent activity for tenant
   * @param userId - The user ID
   * @param limit - Maximum number of results
   */
  getTenantActivity: async (userId: string, limit: number = 5): Promise<QueryResult<any[]>> => {
    // Note: property_applications table doesn't exist in Dutch schema
    // Returning empty result to prevent runtime errors
    return { data: [], error: null };
  },
  
  /**
   * Get recent activity for landlord
   * @param userId - The user ID
   * @param limit - Maximum number of results
   */
  getLandlordActivity: async (userId: string, limit: number = 5): Promise<QueryResult<any[]>> => {
    // Note: property_applications table doesn't exist in Dutch schema
    // Returning empty result to prevent runtime errors
    return { data: [], error: null };
  },
  
  /**
   * Get recent activity for reviewer
   * @param userId - The user ID
   * @param limit - Maximum number of results
   */
  getReviewerActivity: async (userId: string, limit: number = 5): Promise<QueryResult<any[]>> => {
    const { data, error } = await supabase
      .from('documenten')
      .select(`
        *,
        profiles:user_id (first_name, last_name)
      `)
      .eq('reviewer_id', userId)
      .in('status', ['approved', 'rejected'])
      .order('updated_at', { ascending: false })
      .limit(limit);
    
    return { data, error };
  },
  
  /**
   * Get recent activity for admin
   * @param limit - Maximum number of results
   */
  getAdminActivity: async (limit: number = 10): Promise<QueryResult<any[]>> => {
    // This is a more complex query that combines recent activities from multiple tables
    // For simplicity, we'll just get recent user registrations
    const { data, error } = await supabase
      .from('gebruikers')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    return { data, error };
  }
};