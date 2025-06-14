
import { UserRole } from '@/types';
import { logger } from '@/lib/logger';

class RoleMapper {
  /**
   * Map frontend role to database role
   */
  mapRoleToDatabase(role: UserRole): 'Huurder' | 'Verhuurder' | 'Beheerder' | 'Beoordelaar' {
    switch (role) {
      case 'huurder':
        return 'Huurder';
      case 'verhuurder':
        return 'Verhuurder';
      case 'beoordelaar':
        return 'Beoordelaar';
      case 'beheerder':
        return 'Beheerder';
      default:
        return 'Huurder';
    }
  }

  /**
   * Map database role to frontend role
   */
  mapRoleFromDatabase(dbRole: string, email?: string): UserRole {
    logger.info('Mapping database role:', dbRole, 'for email:', email);
    
    switch (dbRole) {
      case 'Huurder':
        return 'huurder';
      case 'Verhuurder':
        return 'verhuurder';
      case 'Beoordelaar':
        return 'beoordelaar';
      case 'Beheerder':
        return 'beheerder';
      default:
        // Fallback logic based on email if role is unclear
        if (email) {
          if (email.includes('@beoordelaar.') || email.includes('bert@')) {
            return 'beoordelaar';
          }
          if (email.includes('admin') || email.includes('beheerder') || email.includes('@huurly.nl')) {
            return 'beheerder';
          }
          if (email.includes('verhuurder') || email.includes('landlord')) {
            return 'verhuurder';
          }
        }
        logger.warn('Unknown database role:', dbRole, 'defaulting to huurder');
        return 'huurder';
    }
  }

  /**
   * Determine role from email address
   */
  determineRoleFromEmail(email?: string): UserRole {
    if (!email) return 'huurder';
    
    const lowerEmail = email.toLowerCase();
    
    if (lowerEmail.includes('@beoordelaar.') || lowerEmail.includes('bert@')) {
      return 'beoordelaar';
    }
    
    if (lowerEmail.includes('admin') || lowerEmail.includes('beheerder') || lowerEmail.includes('@huurly.nl')) {
      return 'beheerder';
    }
    
    if (lowerEmail.includes('verhuurder') || lowerEmail.includes('landlord')) {
      return 'verhuurder';
    }
    
    return 'huurder';
  }
}

export const roleMapper = new RoleMapper();
