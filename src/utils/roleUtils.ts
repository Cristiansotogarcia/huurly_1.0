import { UserRole } from '@/types';

/**
 * Utility functions for role-based operations
 * Provides consistent role checking and validation across the application
 */

/**
 * Check if a user has a specific role
 */
export const hasRole = (userRole: UserRole | string, requiredRole: UserRole): boolean => {
  return userRole === requiredRole;
};

/**
 * Check if a user has any of the specified roles
 */
export const hasAnyRole = (userRole: UserRole | string, requiredRoles: UserRole[]): boolean => {
  return requiredRoles.includes(userRole as UserRole);
};

/**
 * Check if a user has all of the specified roles (for future multi-role support)
 */
export const hasAllRoles = (userRoles: UserRole[], requiredRoles: UserRole[]): boolean => {
  return requiredRoles.every(role => userRoles.includes(role));
};

/**
 * Validate if a user can access a specific resource based on role
 */
export const canAccessResource = (
  userRole: UserRole | string,
  allowedRoles: UserRole[]
): boolean => {
  return hasAnyRole(userRole, allowedRoles);
};

/**
 * Check if user is a tenant (huurder)
 */
export const isTenant = (userRole: UserRole | string): boolean => {
  return hasRole(userRole, 'huurder');
};

/**
 * Check if user is a landlord (verhuurder)
 */
export const isLandlord = (userRole: UserRole | string): boolean => {
  return hasRole(userRole, 'verhuurder');
};

/**
 * Check if user is an admin (beheerder)
 */
export const isAdmin = (userRole: UserRole | string): boolean => {
  return hasRole(userRole, 'beheerder');
};

/**
 * Check if user is a reviewer (beoordelaar)
 */
export const isReviewer = (userRole: UserRole | string): boolean => {
  return hasRole(userRole, 'beoordelaar');
};

/**
 * Get user-friendly role name in Dutch
 */
export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames: Record<UserRole, string> = {
    huurder: 'Huurder',
    verhuurder: 'Verhuurder',
    beheerder: 'Beheerder',
    beoordelaar: 'Beoordelaar'
  };
  
  return roleNames[role] || 'Onbekend';
};

/**
 * Get role-specific permissions
 */
export const getRolePermissions = (role: UserRole): string[] => {
  const permissions: Record<UserRole, string[]> = {
    huurder: [
      'view_properties',
      'create_applications',
      'upload_documents',
      'view_own_profile',
      'edit_own_profile'
    ],
    verhuurder: [
      'create_properties',
      'edit_own_properties',
      'view_applications',
      'accept_reject_applications',
      'view_tenant_profiles',
      'view_own_profile',
      'edit_own_profile'
    ],
    beheerder: [
      'view_all_users',
      'edit_all_users',
      'view_all_properties',
      'edit_all_properties',
      'view_all_applications',
      'manage_system_settings',
      'view_audit_logs'
    ],
    beoordelaar: [
      'review_documents',
      'approve_reject_documents',
      'view_tenant_profiles',
      'view_applications'
    ]
  };
  
  return permissions[role] || [];
};

/**
 * Check if user has a specific permission
 */
export const hasPermission = (userRole: UserRole, permission: string): boolean => {
  const userPermissions = getRolePermissions(userRole);
  return userPermissions.includes(permission);
};

/**
 * Role-based error messages in Dutch
 */
export const getRoleErrorMessage = (requiredRole: UserRole): string => {
  const messages: Record<UserRole, string> = {
    huurder: 'Deze functie is alleen beschikbaar voor huurders.',
    verhuurder: 'Deze functie is alleen beschikbaar voor verhuurders.',
    beheerder: 'Deze functie is alleen beschikbaar voor beheerders.',
    beoordelaar: 'Deze functie is alleen beschikbaar voor beoordelaars.'
  };
  
  return messages[requiredRole] || 'Geen toegang tot deze functie.';
};

/**
 * Get default dashboard route for role
 */
export const getDefaultDashboardRoute = (role: UserRole): string => {
  const routes: Record<UserRole, string> = {
    huurder: '/huurder-dashboard',
    verhuurder: '/verhuurder-dashboard',
    beheerder: '/beheerder-dashboard',
    beoordelaar: '/beoordelaar-dashboard'
  };
  
  return routes[role] || '/';
};

/**
 * Validate role transition (for role changes)
 */
export const canChangeRole = (currentRole: UserRole, newRole: UserRole): boolean => {
  // Define allowed role transitions
  const allowedTransitions: Record<UserRole, UserRole[]> = {
    huurder: ['verhuurder'], // Tenants can become landlords
    verhuurder: ['huurder'], // Landlords can become tenants
    beheerder: ['huurder', 'verhuurder', 'beoordelaar'], // Admins can change to any role
    beoordelaar: [] // Reviewers cannot change roles without admin intervention
  };
  
  return allowedTransitions[currentRole]?.includes(newRole) || false;
};