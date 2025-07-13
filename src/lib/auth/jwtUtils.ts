import { supabase } from '../../integrations/supabase/client';
import { UserRole } from '../../types';
import { logger } from '../logger';

/**
 * Utility functions for working with JWT claims and user roles
 */

/**
 * Get the current user's roles from JWT claims
 * @returns Array of user roles or null if not authenticated
 */
export async function getCurrentUserRoles(): Promise<string[] | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }

    // Get roles from JWT app_metadata
    const roles = user.app_metadata?.roles;
    
    if (Array.isArray(roles)) {
      return roles;
    }
    
    // Fallback to primary_role if roles array not available
    const primaryRole = user.app_metadata?.primary_role;
    if (primaryRole) {
      return [primaryRole];
    }
    
    return null;
  } catch (error) {
    logger.error('Error getting user roles from JWT:', error);
    return null;
  }
}

/**
 * Get the current user's primary role from JWT claims
 * @returns Primary user role or null if not authenticated
 */
export async function getCurrentUserPrimaryRole(): Promise<UserRole | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }

    // Get primary role from JWT app_metadata
    const primaryRole = user.app_metadata?.primary_role;
    
    if (primaryRole) {
      return primaryRole as UserRole;
    }
    
    // Fallback to user_metadata role
    const userRole = user.user_metadata?.role;
    if (userRole) {
      return userRole as UserRole;
    }
    
    return null;
  } catch (error) {
    logger.error('Error getting user primary role from JWT:', error);
    return null;
  }
}

/**
 * Check if the current user has a specific role
 * @param requiredRole - The role to check for
 * @returns True if user has the role, false otherwise
 */
export async function hasRole(requiredRole: UserRole): Promise<boolean> {
  try {
    const roles = await getCurrentUserRoles();
    
    if (!roles) {
      return false;
    }
    
    return roles.includes(requiredRole);
  } catch (error) {
    logger.error('Error checking user role:', error);
    return false;
  }
}

/**
 * Check if the current user has any of the specified roles
 * @param requiredRoles - Array of roles to check for
 * @returns True if user has any of the roles, false otherwise
 */
export async function hasAnyRole(requiredRoles: UserRole[]): Promise<boolean> {
  try {
    const userRoles = await getCurrentUserRoles();
    
    if (!userRoles) {
      return false;
    }
    
    return requiredRoles.some(role => userRoles.includes(role));
  } catch (error) {
    logger.error('Error checking user roles:', error);
    return false;
  }
}

/**
 * Get the current user's subscription status from JWT claims
 * @returns Subscription status or null if not available
 */
export async function getCurrentUserSubscriptionStatus(): Promise<string | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }

    return user.app_metadata?.subscription_status || null;
  } catch (error) {
    logger.error('Error getting user subscription status from JWT:', error);
    return null;
  }
}

/**
 * Check if the current user has an active subscription
 * @returns True if user has active subscription, false otherwise
 */
export async function hasActiveSubscription(): Promise<boolean> {
  try {
    const status = await getCurrentUserSubscriptionStatus();
    return status === 'actief';
  } catch (error) {
    logger.error('Error checking subscription status:', error);
    return false;
  }
}