
import { UserRole } from '../../types/index.ts';
import { logger } from '../logger.ts';
import { supabase } from '../../integrations/supabase/client.ts';

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
    logger.info(`Mapping database role: ${dbRole} for email: ${email}`);

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
        logger.warn(`Unknown database role: ${dbRole} defaulting to huurder`);
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

  /**
   * Look up role from database for a specific user
   */
  async getRoleFromDatabase(userId: string): Promise<UserRole | null> {
    try {
      logger.info(`Looking up role from database for user: ${userId}`);

      const { data, error } = await supabase
        .from('gebruikers')
        .select('rol')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        logger.error(`Error looking up role from database: ${error.message}`);
        return null;
      }

      if (data?.rol) {
        const mappedRole = this.mapRoleFromDatabase(data.rol, userId);
        logger.info(`Found role in database: ${data.rol} mapped to: ${mappedRole}`);
        return mappedRole;
      }

      logger.warn(`No role found in database for user: ${userId}`);
      return null;
    } catch (error) {
      logger.error(`Error querying role from database: ${error}`);
      return null;
    }
  }
}

export const roleMapper = new RoleMapper();
