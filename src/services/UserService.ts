import { supabase } from '@/integrations/supabase/client';
import { DatabaseService, DatabaseResponse, PaginationOptions, SortOptions } from '@/lib/database';
import { User, UserRole } from '@/types';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export interface CreateUserProfileData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

export interface UpdateUserProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  is_looking_for_place?: boolean;
}

export interface CreateTenantProfileData {
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  profession: string;
  monthlyIncome: number;
  bio: string;
  city: string;
  minBudget: number;
  maxBudget: number;
  bedrooms: number;
  propertyType: string;
  motivation: string;
}

export interface UserFilters {
  role?: UserRole;
  isActive?: boolean;
  hasPayment?: boolean;
  searchTerm?: string;
}

export interface TenantSearchFilters {
  city?: string;
  maxBudget?: number;
  minIncome?: number;
  propertyType?: string;
  bedrooms?: number;
}

export class UserService extends DatabaseService {
  /**
   * Create user profile
   */
  async createProfile(
    userId: string,
    data: CreateUserProfileData
  ): Promise<DatabaseResponse<Tables<'profiles'>>> {
    const sanitizedData = this.sanitizeInput(data);
    
    const validation = this.validateRequiredFields(sanitizedData, ['firstName', 'lastName']);
    if (!validation.isValid) {
      return {
        data: null,
        error: new Error(`Verplichte velden ontbreken: ${validation.missingFields.join(', ')}`),
        success: false,
      };
    }

    if (sanitizedData.email && !this.isValidEmail(sanitizedData.email)) {
      return {
        data: null,
        error: new Error('Ongeldig e-mailadres'),
        success: false,
      };
    }

    if (sanitizedData.phone && !this.isValidPhoneNumber(sanitizedData.phone)) {
      return {
        data: null,
        error: new Error('Ongeldig telefoonnummer'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          first_name: sanitizedData.firstName,
          last_name: sanitizedData.lastName,
        })
        .select()
        .single();

      if (error) {
        throw this.handleDatabaseError(error);
      }

      await this.createAuditLog('CREATE', 'profiles', data?.id, null, data);
      
      return { data, error: null };
    });
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId: string): Promise<DatabaseResponse<Tables<'profiles'>>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      return { data, error };
    });
  }

  /**
   * Create complete tenant profile
   */
  async createTenantProfile(data: CreateTenantProfileData): Promise<DatabaseResponse<any>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    const sanitizedData = this.sanitizeInput(data);
    
    const validation = this.validateRequiredFields(sanitizedData, [
      'firstName', 'lastName', 'phone', 'dateOfBirth', 'profession', 
      'monthlyIncome', 'bio', 'city', 'minBudget', 'maxBudget', 'motivation'
    ]);
    if (!validation.isValid) {
      return {
        data: null,
        error: new Error(`Verplichte velden ontbreken: ${validation.missingFields.join(', ')}`),
        success: false,
      };
    }

    if (!this.isValidPhoneNumber(sanitizedData.phone)) {
      return {
        data: null,
        error: new Error('Ongeldig telefoonnummer'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // 1. Update basic profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: sanitizedData.firstName,
          last_name: sanitizedData.lastName,
          is_looking_for_place: true,
        })
        .eq('id', currentUserId);

      if (profileError) {
        throw this.handleDatabaseError(profileError);
      }

      // 2. Create or update tenant profile
      const { data: tenantProfile, error: tenantError } = await supabase
        .from('tenant_profiles')
        .upsert({
          user_id: currentUserId,
          first_name: sanitizedData.firstName,
          last_name: sanitizedData.lastName,
          phone: sanitizedData.phone,
          date_of_birth: sanitizedData.dateOfBirth,
          profession: sanitizedData.profession,
          monthly_income: sanitizedData.monthlyIncome,
          bio: sanitizedData.bio,
          preferred_city: sanitizedData.city,
          min_budget: sanitizedData.minBudget,
          max_budget: sanitizedData.maxBudget,
          preferred_bedrooms: sanitizedData.bedrooms,
          preferred_property_type: sanitizedData.propertyType,
          motivation: sanitizedData.motivation,
          profile_completed: true,
        })
        .select()
        .single();

      if (tenantError) {
        throw this.handleDatabaseError(tenantError);
      }

      await this.createAuditLog('CREATE', 'tenant_profiles', currentUserId, null, tenantProfile);

      return { data: tenantProfile, error: null };
    });
  }

  /**
   * Get tenant profile by user ID
   */
  async getTenantProfile(userId: string): Promise<DatabaseResponse<Tables<'tenant_profiles'>>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('tenant_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      return { data, error };
    });
  }

  /**
   * Get all tenant profiles with search filters
   */
  async getTenantProfiles(
    filters?: TenantSearchFilters,
    pagination?: PaginationOptions,
    sort?: SortOptions
  ): Promise<DatabaseResponse<any[]>> {
    return this.executeQuery(async () => {
      // First get tenant profiles with filters
      let tenantQuery = supabase
        .from('tenant_profiles')
        .select('*')
        .eq('profile_completed', true);

      // Apply filters
      if (filters?.city) {
        tenantQuery = tenantQuery.ilike('preferred_city', `%${filters.city}%`);
      }

      if (filters?.maxBudget) {
        tenantQuery = tenantQuery.lte('max_budget', filters.maxBudget);
      }

      if (filters?.minIncome) {
        tenantQuery = tenantQuery.gte('monthly_income', filters.minIncome);
      }

      if (filters?.propertyType) {
        tenantQuery = tenantQuery.eq('preferred_property_type', filters.propertyType);
      }

      if (filters?.bedrooms) {
        tenantQuery = tenantQuery.eq('preferred_bedrooms', filters.bedrooms);
      }

      // Apply sorting
      tenantQuery = this.applySorting(tenantQuery, sort || { column: 'created_at', ascending: false });

      // Apply pagination
      tenantQuery = this.applyPagination(tenantQuery, pagination);

      const { data: tenantData, error: tenantError } = await tenantQuery;

      if (tenantError) {
        return { data: null, error: tenantError };
      }

      if (!tenantData || tenantData.length === 0) {
        return { data: [], error: null };
      }

      // Get user IDs from tenant profiles
      const userIds = tenantData.map(tenant => tenant.user_id);

      // Get corresponding profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, is_looking_for_place')
        .in('id', userIds)
        .eq('is_looking_for_place', true);

      if (profilesError) {
        return { data: null, error: profilesError };
      }

      // Manual join - combine tenant profiles with their corresponding profiles
      const joinedData = tenantData.map(tenant => {
        const profile = profilesData?.find(p => p.id === tenant.user_id);
        return {
          ...tenant,
          profiles: profile
        };
      }).filter(item => item.profiles); // Only include tenants with valid profiles

      return { data: joinedData, error: null };
    });
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updates: UpdateUserProfileData
  ): Promise<DatabaseResponse<Tables<'profiles'>>> {
    const sanitizedData = this.sanitizeInput(updates);

    if (sanitizedData.email && !this.isValidEmail(sanitizedData.email)) {
      return {
        data: null,
        error: new Error('Ongeldig e-mailadres'),
        success: false,
      };
    }

    if (sanitizedData.phone && !this.isValidPhoneNumber(sanitizedData.phone)) {
      return {
        data: null,
        error: new Error('Ongeldig telefoonnummer'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // Get current data for audit log
      const { data: currentData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const updateData: any = {};
      if (sanitizedData.firstName) updateData.first_name = sanitizedData.firstName;
      if (sanitizedData.lastName) updateData.last_name = sanitizedData.lastName;
      if (sanitizedData.is_looking_for_place !== undefined) updateData.is_looking_for_place = sanitizedData.is_looking_for_place;

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw this.handleDatabaseError(error);
      }

      await this.createAuditLog('UPDATE', 'profiles', userId, currentData, data);

      return { data, error: null };
    });
  }

  /**
   * Get user role
   */
  async getUserRole(userId: string): Promise<DatabaseResponse<Tables<'user_roles'>>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .single();

      return { data, error };
    });
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(
    userId: string,
    role: 'Huurder' | 'Verhuurder' | 'Beoordelaar' | 'Beheerder'
  ): Promise<DatabaseResponse<Tables<'user_roles'>>> {
    const hasPermission = await this.checkUserPermission(userId, ['Beheerder']);
    if (!hasPermission) {
      return {
        data: null,
        error: new Error('Geen toegang om rollen te wijzigen'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // Get current data for audit log
      const { data: currentData } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .single();

      const { data, error } = await supabase
        .from('user_roles')
        .update({ role })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw this.handleDatabaseError(error);
      }

      await this.createAuditLog('UPDATE', 'user_roles', userId, currentData, data);

      return { data, error: null };
    });
  }

  /**
   * Get all users with filters (admin only)
   */
  async getUsers(
    filters?: UserFilters,
    pagination?: PaginationOptions,
    sort?: SortOptions
  ): Promise<DatabaseResponse<any[]>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    const hasPermission = await this.checkUserPermission(currentUserId, ['Beheerder']);
    if (!hasPermission) {
      return {
        data: null,
        error: new Error('Geen toegang tot gebruikerslijst'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      let query = supabase
        .from('profiles')
        .select(`
          *,
          user_roles!inner(role, subscription_status),
          payment_records(status, created_at)
        `);

      // Apply filters
      if (filters?.role) {
        // Map frontend role to database role
        let dbRole: 'Huurder' | 'Verhuurder' | 'Beoordelaar' | 'Beheerder';
        switch (filters.role) {
          case 'huurder':
            dbRole = 'Huurder';
            break;
          case 'verhuurder':
            dbRole = 'Verhuurder';
            break;
          case 'beoordelaar':
            dbRole = 'Beoordelaar';
            break;
          case 'beheerder':
            dbRole = 'Beheerder';
            break;
          default:
            dbRole = 'Huurder';
        }
        query = query.eq('user_roles.role', dbRole);
      }

      if (filters?.searchTerm) {
        query = this.buildSearchQuery(
          query,
          filters.searchTerm,
          ['first_name', 'last_name']
        );
      }

      // Apply sorting
      query = this.applySorting(query, sort || { column: 'created_at', ascending: false });

      // Apply pagination
      query = this.applyPagination(query, pagination);

      const { data, error } = await query;

      return { data, error };
    });
  }

  /**
   * Suspend user account (admin only)
   */
  async suspendUser(userId: string): Promise<DatabaseResponse<boolean>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    const hasPermission = await this.checkUserPermission(currentUserId, ['Beheerder']);
    if (!hasPermission) {
      return {
        data: null,
        error: new Error('Geen toegang om gebruikers te schorsen'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // Update user role subscription status to suspended
      const { error } = await supabase
        .from('user_roles')
        .update({ subscription_status: 'suspended' })
        .eq('user_id', userId);

      if (error) {
        throw this.handleDatabaseError(error);
      }

      await this.createAuditLog('SUSPEND', 'user_roles', userId);

      return { data: true, error: null };
    });
  }

  /**
   * Activate user account (admin only)
   */
  async activateUser(userId: string): Promise<DatabaseResponse<boolean>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    const hasPermission = await this.checkUserPermission(currentUserId, ['Beheerder']);
    if (!hasPermission) {
      return {
        data: null,
        error: new Error('Geen toegang om gebruikers te activeren'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // Update user role subscription status to active
      const { error } = await supabase
        .from('user_roles')
        .update({ subscription_status: 'active' })
        .eq('user_id', userId);

      if (error) {
        throw this.handleDatabaseError(error);
      }

      await this.createAuditLog('ACTIVATE', 'user_roles', userId);

      return { data: true, error: null };
    });
  }

  /**
   * Delete user account (admin only)
   */
  async deleteUser(userId: string): Promise<DatabaseResponse<boolean>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    const hasPermission = await this.checkUserPermission(currentUserId, ['Beheerder']);
    if (!hasPermission) {
      return {
        data: null,
        error: new Error('Geen toegang om gebruikers te verwijderen'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // Get user data for audit log
      const { data: userData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Delete profile (this should cascade to related records)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        throw this.handleDatabaseError(error);
      }

      await this.createAuditLog('DELETE', 'profiles', userId, userData);

      return { data: true, error: null };
    });
  }

  /**
   * Get user statistics (admin only)
   */
  async getUserStatistics(): Promise<DatabaseResponse<any>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    const hasPermission = await this.checkUserPermission(currentUserId, ['Beheerder']);
    if (!hasPermission) {
      return {
        data: null,
        error: new Error('Geen toegang tot statistieken'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // Get total users by role
      const { data: roleStats, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .order('role');

      if (roleError) {
        throw this.handleDatabaseError(roleError);
      }

      // Get active users (with recent activity)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: activeUsers, error: activeError } = await supabase
        .from('profiles')
        .select('id')
        .gte('updated_at', thirtyDaysAgo.toISOString());

      if (activeError) {
        throw this.handleDatabaseError(activeError);
      }

      // Get users with payments
      const { data: paidUsers, error: paymentError } = await supabase
        .from('payment_records')
        .select('user_id')
        .eq('status', 'completed');

      if (paymentError) {
        throw this.handleDatabaseError(paymentError);
      }

      const statistics = {
        totalUsers: roleStats?.length || 0,
        usersByRole: roleStats?.reduce((acc: any, user: any) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {}),
        activeUsers: activeUsers?.length || 0,
        paidUsers: new Set(paidUsers?.map(p => p.user_id)).size || 0,
      };

      return { data: statistics, error: null };
    });
  }
}

// Export singleton instance
export const userService = new UserService();
