
import { supabase } from '../integrations/supabase/client.ts';
import { DatabaseService, DatabaseResponse, PaginationOptions, SortOptions } from '../lib/database.ts';
import { User, UserRole } from '../types/index.ts';
import { Tables, TablesInsert, TablesUpdate } from '../integrations/supabase/types.ts';
import { useAuthStore } from '../store/authStore.ts';
import { logger } from '../lib/logger.ts';
import { roleMapper } from '../lib/auth/roleMapper.ts';

// Authentication error class
export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export interface CreateUserProfileData {
  voornaam: string;
  achternaam: string;
  email?: string;
  telefoon?: string;
}

export interface UpdateUserProfileData {
  voornaam?: string;
  achternaam?: string;
  email?: string;
  telefoon?: string;
  is_op_zoek?: boolean;
}

export interface CreateTenantProfileData {
  voornaam: string;
  achternaam: string;
  telefoon: string;
  geboortedatum: string;
  beroep: string;
  maandinkomen: number;
  bio: string;
  stad: string;
  minBudget: number;
  maxBudget: number;
  slaapkamers: number;
  woningtype: string;
  motivatie: string;
  isOpZoek?: boolean;
  nationaliteit?: string;
  geslacht?: 'man' | 'vrouw' | 'anders' | 'zeg_ik_liever_niet';
  burgerlijkeStaat?: 'alleenstaand' | 'getrouwd' | 'partnerschap' | 'gescheiden' | 'weduwe';
  heeftKinderen?: boolean;
  aantalKinderen?: number;
  leeftijdenKinderen?: number[];
  heeftPartner?: boolean;
  naamPartner?: string;
  beroepPartner?: string;
  maandinkomenPartner?: number;
  werkstatusPartner?: string;
  voorkeurswijken?: string[];
  maxReistijd?: number;
  vervoersvoorkeur?: string;
  voorkeurMeubilering?: 'gemeubileerd' | 'ongemeubileerd' | 'geen_voorkeur';
  gewensteVoorzieningen?: string[];
  garantstellerBeschikbaar?: boolean;
  naamGarantsteller?: string;
  telefoonGarantsteller?: string;
  inkomenGarantsteller?: number;
  relatieGarantsteller?: 'ouder' | 'familie' | 'vriend' | 'werkgever' | 'anders';
  inkomensbewijsBeschikbaar?: boolean;
  voorkeurVerhuisdatum?: string;
  vroegsteVerhuisdatum?: string;
  flexibeleBeschikbaarheid?: boolean;
  werkgever?: string;
  werkstatus?: string;
  typeArbeidscontract?: string;
  inAanmerkingVoorHuurtoeslag?: boolean;
  heeftHuisdieren?: boolean;
  detailsHuisdieren?: string;
  rookt?: boolean;
  detailsRoken?: string;
  profielfotoUrl?: string;
}

export interface UserFilters {
  rol?: UserRole;
  isActief?: boolean;
  heeftBetaling?: boolean;
  zoekterm?: string;
}

export interface TenantSearchFilters {
  city?: string;
  maxBudget?: number;
  minIncome?: number;
  propertyType?: string;
  bedrooms?: number;
  familyComposition?: string;
  hasChildren?: boolean;
  maritalStatus?: string;
  nationality?: string;
  preferredDistricts?: string[];
}

// Updated utility function for sanitizing furnishedPreference with Dutch values
function sanitizeFurnishedPreference(value: any): "gemeubileerd" | "ongemeubileerd" | "geen_voorkeur" {
  if (value === "gemeubileerd" || value === "ongemeubileerd" || value === "geen_voorkeur") {
    return value;
  }
  // Convert English values to Dutch values
  if (value === "furnished") return "gemeubileerd";
  if (value === "unfurnished") return "ongemeubileerd";
  if (value === "no_preference") return "geen_voorkeur";
  
  // Log whenever a value needs sanitizing
  logger.warn("UserService: Invalid furnishedPreference value detected, converting to 'geen_voorkeur'. Provided value:", value);
  return "geen_voorkeur";
}

export class UserService extends DatabaseService {
  /**
   * Validate authentication and refresh session if needed
   */
  private async validateAuthentication(): Promise<void> {
    const authStore = useAuthStore.getState();
    
    // Check if session is valid
    const isValid = await authStore.validateSession();
    
    if (!isValid) {
      logger.warn('Session invalid, attempting refresh...');
      const refreshed = await authStore.refreshSession();
      
      if (!refreshed) {
        logger.error('Session refresh failed, user needs to re-authenticate');
        throw new AuthenticationError('Uw sessie is verlopen. Log opnieuw in om door te gaan.');
      }
    }
  }

  /**
   * Execute operation with authentication guard
   */
  private async withAuthGuard<T>(operation: () => Promise<T>): Promise<T> {
    try {
      await this.validateAuthentication();
      return await operation();
    } catch (error) {
      if (error instanceof AuthenticationError) {
        // Force logout on authentication failure
        const authStore = useAuthStore.getState();
        authStore.logout();
        throw error;
      }
      throw error;
    }
  }

  /**
   * Create user profile
   */
  async createProfile(
    userId: string,
    data: CreateUserProfileData
  ): Promise<DatabaseResponse<Tables<'gebruikers'>>> {
    const sanitizedData = this.sanitizeInput(data);
    
    const validation = this.validateRequiredFields(sanitizedData, ['voornaam', 'achternaam']);
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

    if (sanitizedData.telefoon && !this.isValidPhoneNumber(sanitizedData.telefoon)) {
      return {
        data: null,
        error: new Error('Ongeldig telefoonnummer'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // Get user email from auth
      const { data: { user } } = await supabase.auth.getUser();
      const email = user?.email;
      
      if (!email) {
        throw new Error('Gebruiker e-mail niet gevonden');
      }
      
      // Determine role from email or use default
      const role = roleMapper.determineRoleFromEmail(email);
      const dbRole = roleMapper.mapRoleToDatabase(role);
      
      const { data, error } = await supabase
        .from('gebruikers')
        .insert({
          id: userId,
          email: email,
          naam: `${sanitizedData.voornaam} ${sanitizedData.achternaam}`,
          rol: dbRole,
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
  async getProfile(userId: string): Promise<DatabaseResponse<Tables<'gebruikers'>>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('gebruikers')
        .select('*')
        .eq('id', userId)
        .single();

      return { data, error };
    });
  }

  /**
   * Create or update tenant profile - unified method
   */
  async createTenantProfile(data: CreateTenantProfileData): Promise<DatabaseResponse<Tables<'huurders'>>> {
    return this.withAuthGuard(async () => {
      const currentUserId = await this.getCurrentUserId();
      if (!currentUserId) {
        return {
          data: null,
          error: new AuthenticationError('Niet geautoriseerd'),
          success: false,
        };
      }

      const sanitizedData = this.sanitizeInput(data);

      const validation = this.validateRequiredFields(sanitizedData, [
        'voornaam', 'achternaam', 'telefoon', 'geboortedatum', 'beroep', 
        'maandinkomen', 'bio', 'stad', 'minBudget', 'maxBudget', 'motivatie'
      ]);
      if (!validation.isValid) {
        return {
          data: null,
          error: new Error(`Verplichte velden ontbreken: ${validation.missingFields.join(', ')}`),
          success: false,
        };
      }

      if (!this.isValidPhoneNumber(sanitizedData.telefoon)) {
        return {
          data: null,
          error: new Error('Ongeldig telefoonnummer'),
          success: false,
        };
      }

      return this.executeQuery(async () => {
        // 1. Update basic profile in gebruikers table
        const { error: profileError } = await supabase
          .from('gebruikers')
          .update({
            naam: `${sanitizedData.voornaam} ${sanitizedData.achternaam}`,
            telefoon: sanitizedData.telefoon,
            profiel_compleet: true,
          })
          .eq('id', currentUserId);

        if (profileError) {
          throw this.handleDatabaseError(profileError);
        }

        // 2. Check if tenant profile already exists
        const { data: existingProfile } = await supabase
          .from('huurders')
          .select('id')
          .eq('id', currentUserId)
          .maybeSingle();

        logger.info("Existing tenant profile check:", existingProfile);

        // 3. Prepare tenant profile data using actual database column names
        const tenantProfileData: any = {
          id: currentUserId,
          beroep: sanitizedData.beroep,
          inkomen: sanitizedData.maandinkomen,
          beschrijving: sanitizedData.bio,
          locatie_voorkeur: [sanitizedData.stad],
          max_huur: sanitizedData.maxBudget,
          min_kamers: sanitizedData.slaapkamers || 1,
          max_kamers: sanitizedData.slaapkamers ? sanitizedData.slaapkamers + 1 : 3,
          
          // Family information
          partner: sanitizedData.heeftPartner || false,
          kinderen: sanitizedData.aantalKinderen || 0,
          roken: sanitizedData.rookt || false,
          huisdieren: sanitizedData.heeftHuisdieren || false,
          
          // Guarantor information
          borgsteller_beschikbaar: sanitizedData.garantstellerBeschikbaar || false,
          borgsteller_naam: sanitizedData.naamGarantsteller || null,
          borgsteller_telefoon: sanitizedData.telefoonGarantsteller || null,
          borgsteller_inkomen: sanitizedData.inkomenGarantsteller || null,
          borgsteller_relatie: sanitizedData.relatieGarantsteller || null,
          inkomensbewijs_beschikbaar: sanitizedData.inkomensbewijsBeschikbaar || false,
          
          // Timing information
          voorkeur_verhuisdatum: sanitizedData.voorkeurVerhuisdatum ? new Date(sanitizedData.voorkeurVerhuisdatum) : null,
          vroegste_verhuisdatum: sanitizedData.vroegsteVerhuisdatum ? new Date(sanitizedData.vroegsteVerhuisdatum) : null,
          beschikbaarheid_flexibel: sanitizedData.flexibeleBeschikbaarheid || false,
          
          // Preferences stored in JSON
          woningvoorkeur: {
            type: sanitizedData.woningtype || 'appartement',
            meubilering: sanitizeFurnishedPreference(sanitizedData.voorkeurMeubilering),
            voorzieningen: sanitizedData.gewensteVoorzieningen || [],
            wijken: sanitizedData.voorkeurswijken || [],
            maxReistijd: sanitizedData.maxReistijd || 30,
            vervoer: sanitizedData.vervoersvoorkeur || 'openbaar_vervoer'
          },
          
          profielfoto_url: sanitizedData.profielfotoUrl || null,
        };

        // Calculate age from birth date
        if (sanitizedData.geboortedatum) {
          const birthDate = new Date(sanitizedData.geboortedatum);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          tenantProfileData.leeftijd = age;
        }

        let tenantProfile;
        let isUpdate = false;

        if (existingProfile) {
          // Update existing profile
          logger.info("Updating existing tenant profile for user:", currentUserId);
          isUpdate = true;
          
          const { data, error: tenantError } = await supabase
            .from('huurders')
            .update(tenantProfileData)
            .eq('id', currentUserId)
            .select()
            .single();

          if (tenantError) {
            throw this.handleDatabaseError(tenantError);
          }
          tenantProfile = data;
        } else {
          // Create new profile
          logger.info("Creating new tenant profile for user:", currentUserId);
          
          const { data, error: tenantError } = await supabase
            .from('huurders')
            .insert(tenantProfileData)
            .select()
            .single();

          if (tenantError) {
            throw this.handleDatabaseError(tenantError);
          }
          tenantProfile = data;
        }

        await this.createAuditLog(
          isUpdate ? 'UPDATE' : 'CREATE', 
          'tenant_profiles', 
          currentUserId, 
          existingProfile, 
          tenantProfile
        );

        return { data: tenantProfile, error: null };
      });
    });
  }

  /**
   * Get tenant profile by user ID
   */
  async getTenantProfile(userId: string): Promise<DatabaseResponse<Tables<'huurders'>>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('huurders')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      return { data, error };
    });
  }

  /**
   * Update existing tenant profile - now delegates to createTenantProfile
   */
  async updateTenantProfile(data: CreateTenantProfileData): Promise<DatabaseResponse<Tables<'huurders'>>> {
    // Just call createTenantProfile since it now handles both create and update
    return this.createTenantProfile(data);
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
      // Get tenant profiles with filters
      let tenantQuery = supabase
        .from('huurders')
        .select('*')
        .not('beschrijving', 'is', null); // Only get profiles with descriptions (completed profiles)

      // Apply filters using correct column names
      if (filters?.city) {
        tenantQuery = tenantQuery.overlaps('locatie_voorkeur', [filters.city]);
      }

      if (filters?.maxBudget) {
        tenantQuery = tenantQuery.lte('max_huur', filters.maxBudget);
      }

      if (filters?.minIncome) {
        tenantQuery = tenantQuery.gte('inkomen', filters.minIncome);
      }

      if (filters?.bedrooms) {
        tenantQuery = tenantQuery.gte('min_kamers', filters.bedrooms);
      }

      if (filters?.hasChildren !== undefined) {
        if (filters.hasChildren) {
          tenantQuery = tenantQuery.gt('kinderen', 0);
        } else {
          tenantQuery = tenantQuery.eq('kinderen', 0);
        }
      }

      // Apply sorting
      tenantQuery = this.applySorting(tenantQuery, sort || { column: 'aangemaakt_op', ascending: false });

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
      const userIds = tenantData.map(tenant => tenant.id);

      // Get corresponding profiles from gebruikers table
      const { data: profilesData, error: profilesError } = await supabase
        .from('gebruikers')
        .select('id, naam, email, profiel_compleet')
        .in('id', userIds)
        .eq('profiel_compleet', true);

      if (profilesError) {
        return { data: null, error: profilesError };
      }

      // Manual join - combine tenant profiles with their corresponding profiles
      const joinedData = tenantData.map(tenant => {
        const profile = profilesData?.find(p => p.id === tenant.id);
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
  ): Promise<DatabaseResponse<Tables<'gebruikers'>>> {
    const sanitizedData = this.sanitizeInput(updates);

    if (sanitizedData.email && !this.isValidEmail(sanitizedData.email)) {
      return {
        data: null,
        error: new Error('Ongeldig e-mailadres'),
        success: false,
      };
    }

    if (sanitizedData.telefoon && !this.isValidPhoneNumber(sanitizedData.telefoon)) {
      return {
        data: null,
        error: new Error('Ongeldig telefoonnummer'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // Get current data for audit log
      const { data: currentData } = await supabase
        .from('gebruikers')
        .select('*')
        .eq('id', userId)
        .single();

      const updateData: any = {};
      if (sanitizedData.voornaam || sanitizedData.achternaam) {
        // If either first or last name is updated, update the full name
        // Get current name parts from naam field if available
        const currentNaam = currentData?.naam || '';
        const [currentFirstName, ...currentLastNameParts] = currentNaam.split(' ');
        const currentLastName = currentLastNameParts.join(' ');
        
        const firstName = sanitizedData.voornaam || currentFirstName;
        const lastName = sanitizedData.achternaam || currentLastName;
        updateData.naam = `${firstName} ${lastName}`;
      }
      if (sanitizedData.email) updateData.email = sanitizedData.email;
      if (sanitizedData.telefoon) updateData.telefoon = sanitizedData.telefoon;

      const { data, error } = await supabase
        .from('gebruikers')
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
  async getUserRole(userId: string): Promise<DatabaseResponse<Tables<'gebruiker_rollen'>>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('gebruiker_rollen')
        .select('*')
        .eq('user_id', userId)
        .single();

      return { data, error };
    });
  }
  
  /**
   * Get profile picture URL for a user
   */
  async getProfilePictureUrl(userId: string): Promise<string | null> {
    try {
      const { data: tenant } = await supabase
        .from('huurders')
        .select('profielfoto_url')
        .eq('id', userId)
        .single();

      return tenant?.profielfoto_url || null;
    } catch (error) {
      logger.error('Error fetching profile picture URL:', error);
      return null;
    }
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(
    userId: string,
    role: 'Huurder' | 'Verhuurder' | 'Beoordelaar' | 'Beheerder'
  ): Promise<DatabaseResponse<Tables<'gebruiker_rollen'>>> {
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
        .from('gebruiker_rollen')
        .select('*')
        .eq('user_id', userId)
        .single();

      const { data, error } = await supabase
        .from('gebruiker_rollen')
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
        .from('gebruikers')
        .select(`
          *,
          gebruiker_rollen!inner(role, subscription_status)
        `);

      // Apply filters
      if (filters?.rol) {
        // Map frontend role to database role
        let dbRole: 'Huurder' | 'Verhuurder' | 'Beoordelaar' | 'Beheerder';
        switch (filters.rol) {
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
        query = query.eq('gebruiker_rollen.role', dbRole);
      }

      if (filters?.heeftBetaling) {
        const { data: paymentUserIds, error: paymentError } = await supabase
          .from('abonnementen')
          .select('gebruiker_id')
          .eq('status', 'actief');

        if (paymentError) {
          throw this.handleDatabaseError(paymentError);
        }

        const userIdsWithPayment = paymentUserIds.map((p: any) => p.gebruiker_id);
        if (userIdsWithPayment.length > 0) {
          query = query.in('id', userIdsWithPayment);
        } else {
          // If hasPayment is true but no one has paid, return no users.
          query = query.in('id', ['00000000-0000-0000-0000-000000000000']);
        }
      }

      if (filters?.zoekterm) {
        query = this.buildSearchQuery(
          query,
          filters.zoekterm,
          ['naam', 'email']
        );
      }

      // Apply sorting
      query = this.applySorting(query, sort || { column: 'aangemaakt_op', ascending: false });

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
        .from('gebruiker_rollen')
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
        .from('gebruiker_rollen')
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
        .from('gebruikers')
        .select('*')
        .eq('id', userId)
        .single();

      // Delete profile (this should cascade to related records)
      const { error } = await supabase
        .from('gebruikers')
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
   * Get user subscription
   */
  async getSubscription(userId: string): Promise<DatabaseResponse<any>> {
    return this.executeQuery(async () => {
      // Validate session before making the request
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('No active session for subscription fetch');
        return { data: null, error: null };
      }

      // Check if current user matches the requested userId (for security)
      if (session.user.id !== userId) {
        console.warn('User ID mismatch in subscription fetch');
        return { data: null, error: new Error('Unauthorized') };
      }

      try {
        // First, try to get active subscription using maybeSingle to avoid 406 errors
        const { data: activeData, error: activeError } = await supabase
          .from('abonnementen')
          .select('*')
          .eq('huurder_id', userId)
          .eq('status', 'actief')
          .maybeSingle();

        if (activeError) {
          console.error('Error fetching active subscription:', activeError);
          // Return null instead of throwing error to prevent breaking the app
          return { data: null, error: null };
        }

        if (activeData) {
          console.log('Found active subscription for user:', userId);
          return { data: activeData, error: null };
        }

        // If no active subscription, check for pending ones
        const { data: pendingData, error: pendingError } = await supabase
          .from('abonnementen')
          .select('*')
          .eq('huurder_id', userId)
          .eq('status', 'wachtend')
          .order('aangemaakt_op', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (pendingError) {
          console.error('Error fetching pending subscription:', pendingError);
          return { data: null, error: null };
        }

        if (pendingData) {
          console.warn('Found pending subscription for user:', userId, 'Subscription ID:', pendingData.stripe_subscription_id);
          // Return null for pending subscriptions so user is treated as not subscribed
          return { data: null, error: null };
        }

        // No subscription found
        console.log('No subscription found for user:', userId);
        return { data: null, error: null };

      } catch (error) {
        console.error('Unexpected error in getSubscription:', error);
        return { data: null, error: null };
      }
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
        .from('gebruiker_rollen')
        .select('role')
        .order('role');

      if (roleError) {
        throw this.handleDatabaseError(roleError);
      }

      // Get active users (with recent activity)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: activeUsers, error: activeError } = await supabase
        .from('gebruikers')
        .select('id')
        .gte('bijgewerkt_op', thirtyDaysAgo.toISOString());

      if (activeError) {
        throw this.handleDatabaseError(activeError);
      }

      // Get users with payments
      const { data: paidUsers, error: paymentError } = await supabase
        .from('abonnementen')
        .select('huurder_id')
        .eq('status', 'actief');

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
        paidUsers: new Set(paidUsers?.map(p => p.huurder_id)).size || 0,
      };

      return { data: statistics, error: null };
    });
  }
}

// Export singleton instance
export const userService = new UserService();
