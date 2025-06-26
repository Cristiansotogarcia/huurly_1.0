
<<<<<<< codex/troubleshoot-npm-test-and-network-access-issues
import { UserRole } from '../../types/index.ts';
=======
import { UserRole } from '../types/index.ts';
>>>>>>> main
import { logger } from '../logger.ts';

class RoleMapper {
  /**
   * Map frontend role to database role
   */
  mapRoleToDatabase(role: UserRole): 'huurder' | 'verhuurder' | 'admin' | 'beoordelaar' {
    switch (role) {
      case 'huurder':
        return 'huurder';
      case 'verhuurder':
        return 'verhuurder';
      case 'beoordelaar':
        return 'beoordelaar';
      case 'beheerder':
        return 'admin';
      default:
        return 'huurder';
    }
  }

  /**
   * Map database role to frontend role
   */
  mapRoleFromDatabase(dbRole: string, email?: string): UserRole {
    logger.info('Mapping database role:', dbRole, 'for email:', email);
    
    switch (dbRole) {
      case 'huurder':
        return 'huurder';
      case 'verhuurder':
        return 'verhuurder';
      case 'beoordelaar':
        return 'beoordelaar';
      case 'admin':
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
