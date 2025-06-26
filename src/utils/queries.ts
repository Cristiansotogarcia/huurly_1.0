
import { supabase } from '../integrations/supabase/client';
import { logger } from '../lib/logger';

// Get current user's tenant profile
export const getCurrentUserProfile = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('huurders')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      logger.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    logger.error('Error in getCurrentUserProfile:', error);
    return null;
  }
};

// Get all users for admin dashboard
export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('gebruikers')
      .select('*')
      .order('aangemaakt_op', { ascending: false });

    if (error) {
      logger.error('Error fetching users:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    logger.error('Error in getAllUsers:', error);
    return [];
  }
};

// Get tenant profiles for verhuurder dashboard
export const getTenantProfiles = async () => {
  try {
    const { data, error } = await supabase
      .from('huurders')
      .select('*')
      .eq('profiel_compleet', true)
      .order('bijgewerkt_op', { ascending: false });

    if (error) {
      logger.error('Error fetching tenant profiles:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    logger.error('Error in getTenantProfiles:', error);
    return [];
  }
};

// Update user profile
export const updateUserProfile = async (userId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('gebruikers')
      .update({
        ...updates,
        bijgewerkt_op: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      logger.error('Error updating user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    logger.error('Error in updateUserProfile:', error);
    return null;
  }
};

// Get documents for review
export const getDocumentsForReview = async () => {
  try {
    const { data, error } = await supabase
      .from('documenten')
      .select(`
        *,
        huurders (
          naam,
          email
        )
      `)
      .eq('status', 'wachtend')
      .order('aangemaakt_op', { ascending: true });

    if (error) {
      logger.error('Error fetching documents for review:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    logger.error('Error in getDocumentsForReview:', error);
    return [];
  }
};

// Update document status
export const updateDocumentStatus = async (documentId: string, status: 'goedgekeurd' | 'afgekeurd', notes?: string) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('documenten')
      .update({
        status,
        beoordelaar_id: user?.id || null,
        beoordeling_notitie: notes || null,
        bijgewerkt_op: new Date().toISOString(),
      })
      .eq('id', documentId)
      .select()
      .single();

    if (error) {
      logger.error('Error updating document status:', error);
      return null;
    }

    return data;
  } catch (error) {
    logger.error('Error in updateDocumentStatus:', error);
    return null;
  }
};

// Get user documents
export const getUserDocuments = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('documenten')
      .select('*')
      .eq('huurder_id', userId)
      .order('aangemaakt_op', { ascending: false });

    if (error) {
      logger.error('Error fetching user documents:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    logger.error('Error in getUserDocuments:', error);
    return [];
  }
};

// Get dashboard statistics
export const getDashboardStats = async () => {
  try {
    const [usersResult, documentsResult, subscriptionsResult] = await Promise.all([
      supabase.from('gebruikers').select('id', { count: 'exact', head: true }),
      supabase.from('documenten').select('id', { count: 'exact', head: true }),
      supabase.from('abonnementen').select('id').eq('status', 'actief')
    ]);

    return {
      totalUsers: usersResult.count || 0,
      totalDocuments: documentsResult.count || 0,
      activeSubscriptions: subscriptionsResult.data?.length || 0,
      pendingDocuments: 0 // Will be calculated separately if needed
    };
  } catch (error) {
    logger.error('Error fetching dashboard stats:', error);
    return {
      totalUsers: 0,
      totalDocuments: 0,
      activeSubscriptions: 0,
      pendingDocuments: 0
    };
  }
};
