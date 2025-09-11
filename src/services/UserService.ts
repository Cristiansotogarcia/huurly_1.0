import { supabase } from '../integrations/supabase/client.ts';
import { DatabaseService, DatabaseResponse, PaginationOptions, SortOptions } from '../lib/database.ts';
import { UserRole } from '../types/index.ts';
import { Tables } from '../integrations/supabase/types.ts';
import { useAuthStore } from '../store/authStore.ts';
import { logger } from '../lib/logger.ts';
import { roleMapper } from '../lib/auth/roleMapper.ts';
import { convertToISODate } from '../utils/dateUtils.ts';

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
  inkomen: number;
  beschrijving: string;
  stad: string;
  min_budget: number;
  max_budget: number;
  voorkeur_slaapkamers: number;
  voorkeur_woningtype: string;
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
  profiel_foto?: string;
  coverFotoUrl?: string;
  // Additional fields from enhanced profile form
  burgerlijke_staat?: string;
  dienstverband?: string;
  thuiswerken?: boolean;
  borgsteller_beschikbaar?: boolean;
  borgsteller_naam?: string;
  borgsteller_relatie?: string;
  borgsteller_telefoon?: string;
  borgsteller_inkomen?: number;
  borgsteller_email?: string;
  voorkeurslocaties?: Array<{
    name: string;
    lat?: number;
    lng?: number;
    radius?: number;
  }>;
  min_kamers?: number;
  max_kamers?: number;
  meubilering_voorkeur?: string;
  vroegste_verhuisdatum?: string;
  voorkeur_verhuisdatum?: string;
  beschikbaarheid_flexibel?: boolean;
  parkeren_vereist?: boolean;
  opslag_kelder?: boolean;
  opslag_zolder?: boolean;
  opslag_berging?: boolean;
  opslag_garage?: boolean;
  opslag_schuur?: boolean;
  verhuurgeschiedenis_jaren?: number;
  reden_verhuizing?: string;
  referenties_beschikbaar?: boolean;
  heeft_kinderen?: boolean;
  aantal_kinderen?: number;
  kinderen_leeftijden?: number[];
  heeft_partner?: boolean;
  partner_naam?: string;
  partner_beroep?: string;
  partner_dienstverband?: string;
  partner_maandinkomen?: number;
  extra_inkomen?: number;
  extra_inkomen_beschrijving?: string;
  contract_type?: string;
  huisdieren?: boolean;
  huisdier_details?: string;
  rookt_details?: string;
  voorkeurs_slaapkamers?: number;
  verhuis_datum_voorkeur?: Date;
  verhuis_datum_vroegst?: Date;
  beschikbaarheid_flexibel_timing?: boolean;
  huurcontract_voorkeur?: string;
  opslag_behoeften?: string;
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


export class UserService extends DatabaseService {
  /**
   * Helper method to calculate age from birth date
   */
  private calculateAge(birthDate: string | Date): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

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
   * Create new tenant profile
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

      // Validate required fields
      const validation = this.validateRequiredFields(sanitizedData, [
        'voornaam', 'achternaam', 'telefoon', 'geboortedatum', 'beroep',
        'beschrijving', 'motivatie'
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
        // Check if profile already exists
        const { data: existingProfile } = await supabase
          .from('huurders')
          .select('id')
          .eq('id', currentUserId)
          .maybeSingle();

        if (existingProfile) {
          return {
            data: null,
            error: new Error('Profiel bestaat al'),
            success: false,
          };
        }

        // Prepare tenant profile data
        const tenantProfileData = {
          id: currentUserId,
          voornaam: sanitizedData.voornaam,
          achternaam: sanitizedData.achternaam,
          telefoon: sanitizedData.telefoon,
          geboortedatum: sanitizedData.geboortedatum ? convertToISODate(sanitizedData.geboortedatum) : null,
          geslacht: sanitizedData.geslacht,
          burgerlijke_staat: sanitizedData.burgerlijke_staat || sanitizedData.burgerlijkeStaat,
          nationaliteit: sanitizedData.nationaliteit,
          beroep: sanitizedData.beroep,
          werkgever: sanitizedData.werkgever,
          dienstverband: sanitizedData.dienstverband || sanitizedData.typeArbeidscontract,
          inkomen: sanitizedData.maandinkomen || sanitizedData.inkomen,
          beschrijving: sanitizedData.beschrijving,
          motivatie: sanitizedData.motivatie,
          locatie_voorkeur: Array.isArray(sanitizedData.locatie_voorkeur) ? sanitizedData.locatie_voorkeur : (sanitizedData.stad ? [sanitizedData.stad] : null),
          max_huur: sanitizedData.max_budget,
          min_budget: sanitizedData.min_budget,
          min_kamers: sanitizedData.min_kamers || 1,
          max_kamers: sanitizedData.max_kamers || 3,
          leeftijd: sanitizedData.geboortedatum ? this.calculateAge(sanitizedData.geboortedatum) : null,
          heeft_kinderen: sanitizedData.heeft_kinderen || false,
          aantal_kinderen: sanitizedData.aantal_kinderen || 0,
          kinderen_leeftijden: sanitizedData.kinderen_leeftijden || [],
          aantal_huisgenoten: sanitizedData.aantal_huisgenoten || 0,
          huidige_woonsituatie: sanitizedData.huidige_woonsituatie,
          partner: sanitizedData.partner || false,
          roken: sanitizedData.roken || false,
          huisdieren: sanitizedData.huisdieren || false,
          borgsteller_beschikbaar: sanitizedData.borgsteller_beschikbaar || false,
          borgsteller_naam: sanitizedData.borgsteller_naam,
          borgsteller_telefoon: sanitizedData.borgsteller_telefoon,
          borgsteller_inkomen: sanitizedData.borgsteller_inkomen,
          borgsteller_relatie: sanitizedData.borgsteller_relatie,
          borgsteller_email: sanitizedData.borgsteller_email,
          inkomensbewijs_beschikbaar: sanitizedData.inkomensbewijs_beschikbaar || false,
          voorkeur_verhuisdatum: sanitizedData.voorkeur_verhuisdatum ? convertToISODate(sanitizedData.voorkeur_verhuisdatum) : null,
          vroegste_verhuisdatum: sanitizedData.vroegste_verhuisdatum ? convertToISODate(sanitizedData.vroegste_verhuisdatum) : null,
          beschikbaarheid_flexibel: sanitizedData.beschikbaarheid_flexibel || false,
          huurcontract_voorkeur: sanitizedData.huurcontract_voorkeur,
          reden_verhuizing: sanitizedData.reden_verhuizing,
          woningvoorkeur: {
            type: sanitizedData.voorkeur_woningtype || 'appartement',
            meubilering: sanitizedData.meubilering_voorkeur || 'geen_voorkeur',
            voorzieningen: sanitizedData.gewenste_voorzieningen || [],
            wijken: sanitizedData.locatie_voorkeur || [],
            maxReistijd: sanitizedData.max_reistijd || 30,
            vervoer: sanitizedData.vervoers_voorkeur || 'openbaar_vervoer',
            slaapkamers_voorkeur: sanitizedData.voorkeur_slaapkamers,
            parkeren: sanitizedData.parkeren_vereist || false,
            opslag: {
              kelder: sanitizedData.opslag_kelder || false,
              zolder: sanitizedData.opslag_zolder || false,
              berging: sanitizedData.opslag_berging || false,
              garage: sanitizedData.opslag_garage || false,
              schuur: sanitizedData.opslag_schuur || false,
            }
          },
          thuiswerken: sanitizedData.thuiswerken || false,
          extra_inkomen: sanitizedData.extra_inkomen,
          extra_inkomen_beschrijving: sanitizedData.extra_inkomen_beschrijving,
          partner_inkomen: sanitizedData.partner_inkomen,
          huisdier_details: sanitizedData.huisdier_details,
          rook_details: sanitizedData.rook_details,
          verhuurgeschiedenis_jaren: sanitizedData.verhuurgeschiedenis_jaren,
          referenties_beschikbaar: sanitizedData.referenties_beschikbaar || false,
          profiel_foto: sanitizedData.profiel_foto,
          cover_foto: sanitizedData.cover_foto,
        };

        const { data, error } = await supabase
          .from('huurders')
          .insert(tenantProfileData)
          .select()
          .single();

        if (error) {
          throw this.handleDatabaseError(error);
        }

        await this.createAuditLog('CREATE', 'tenant_profiles', currentUserId, null, data);
        return { data, error: null };
      });
    });
  }

  /**
   * Update existing tenant profile
   */
  async updateTenantProfile(data: CreateTenantProfileData): Promise<DatabaseResponse<Tables<'huurders'>>> {
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

      // Validate required fields
      const validation = this.validateRequiredFields(sanitizedData, [
        'voornaam', 'achternaam', 'telefoon', 'geboortedatum', 'beroep',
        'beschrijving', 'motivatie'
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
        // Check if profile exists
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from('huurders')
          .select('*')
          .eq('id', currentUserId)
          .maybeSingle();

        if (profileCheckError) {
          return {
            data: null,
            error: new Error(`Profiel controle fout: ${profileCheckError.message}`),
            success: false,
          };
        }

        if (!existingProfile) {
          // Try to create the profile instead
          const createResult = await this.createTenantProfile(sanitizedData as CreateTenantProfileData);
          return createResult;
        }

        // Prepare update data - use only confirmed database columns to avoid schema cache issues
        const tenantProfileData: any = {
          // Core profile information
          voornaam: sanitizedData.voornaam,
          achternaam: sanitizedData.achternaam,
          telefoon: sanitizedData.telefoon,
          geboortedatum: sanitizedData.geboortedatum ? convertToISODate(sanitizedData.geboortedatum) : null,
          geslacht: sanitizedData.geslacht,
          burgerlijke_staat: sanitizedData.burgerlijkeStaat || sanitizedData.burgerlijke_staat,
          nationaliteit: sanitizedData.nationaliteit,

          // Employment information
          beroep: sanitizedData.beroep,
          werkgever: sanitizedData.werkgever,
          dienstverband: sanitizedData.typeArbeidscontract || sanitizedData.dienstverband,
          inkomen: sanitizedData.inkomen || sanitizedData.maandinkomen || 0,

          // Profile description and motivation
          beschrijving: sanitizedData.beschrijving,
          motivatie: sanitizedData.motivatie,

          // Housing preferences - using only fields that exist in actual database
          locatie_voorkeur: Array.isArray(sanitizedData.locatie_voorkeur) ? sanitizedData.locatie_voorkeur : (sanitizedData.stad ? [sanitizedData.stad] : []),
          max_huur: sanitizedData.max_budget || 0,
          min_budget: sanitizedData.min_budget || 0,
          min_kamers: sanitizedData.min_kamers || 1,
          max_kamers: sanitizedData.max_kamers || 3,

          // Family information
          heeft_kinderen: sanitizedData.heeft_kinderen || false,
          aantal_kinderen: sanitizedData.aantal_kinderen || 0,
          kinderen_leeftijden: sanitizedData.kinderen_leeftijden || [],

          // Household information
          aantal_huisgenoten: sanitizedData.aantal_huisgenoten || 0,
          huidige_woonsituatie: sanitizedData.huidige_woonsituatie,

          // Partner information
          partner: sanitizedData.heeftPartner || sanitizedData.partner || false,
          partner_naam: sanitizedData.naamPartner || sanitizedData.partner_naam,
          partner_beroep: sanitizedData.beroepPartner || sanitizedData.partner_beroep,
          partner_dienstverband: sanitizedData.werkstatusPartner || sanitizedData.partner_dienstverband,
          partner_inkomen: sanitizedData.partner_inkomen || 0,

          // Additional income
          extra_inkomen: sanitizedData.extra_inkomen || 0,
          extra_inkomen_beschrijving: sanitizedData.extra_inkomen_beschrijving,

          // Preferences and habits
          roken: sanitizedData.roken || false,
          huisdieren: sanitizedData.huisdieren || false,
          thuiswerken: sanitizedData.thuiswerken || false,

          // Guarantor information
          borgsteller_beschikbaar: sanitizedData.borgsteller_beschikbaar || false,
          borgsteller_naam: sanitizedData.borgsteller_naam,
          borgsteller_relatie: sanitizedData.borgsteller_relatie,
          borgsteller_telefoon: sanitizedData.borgsteller_telefoon,
          borgsteller_inkomen: sanitizedData.borgsteller_inkomen || 0,
          borgsteller_email: sanitizedData.borgsteller_email,

          // Additional details
          inkomensbewijs_beschikbaar: sanitizedData.inkomensbewijsBeschikbaar || sanitizedData.inkomensbewijs_beschikbaar || false,
          voorkeur_verhuisdatum: sanitizedData.voorkeurVerhuisdatum || sanitizedData.voorkeur_verhuisdatum ? convertToISODate(sanitizedData.voorkeurVerhuisdatum || sanitizedData.voorkeur_verhuisdatum) : null,
          vroegste_verhuisdatum: sanitizedData.vroegsteVerhuisdatum || sanitizedData.vroegste_verhuisdatum ? convertToISODate(sanitizedData.vroegsteVerhuisdatum || sanitizedData.vroegste_verhuisdatum) : null,
          beschikbaarheid_flexibel: sanitizedData.flexibeleBeschikbaarheid || sanitizedData.beschikbaarheid_flexibel || false,
          huurcontract_voorkeur: sanitizedData.huurcontract_voorkeur,
          reden_verhuizing: sanitizedData.redenVerhuizing || sanitizedData.reden_verhuizing,
          verhuurgeschiedenis_jaren: sanitizedData.verhuurgeschiedenis_jaren || 0,
          referenties_beschikbaar: sanitizedData.referentiesBeschikbaar || sanitizedData.referenties_beschikbaar || false,

          // Profile images
          profiel_foto: sanitizedData.profiel_foto || sanitizedData.profielfotoUrl,
          cover_foto: sanitizedData.cover_foto || sanitizedData.coverFotoUrl,

          // Additional details
          huisdier_details: sanitizedData.detailsHuisdieren || sanitizedData.huisdier_details,
          rook_details: sanitizedData.detailsRoken || sanitizedData.rook_details,

          // Storage preferences
          opslag_kelder: sanitizedData.opslag_kelder || sanitizedData.storage_kelder || false,
          opslag_zolder: sanitizedData.opslag_zolder || sanitizedData.storage_zolder || false,
          opslag_berging: sanitizedData.opslag_berging || sanitizedData.storage_berging || false,
          opslag_garage: sanitizedData.opslag_garage || sanitizedData.storage_garage || false,
          opslag_schuur: sanitizedData.opslag_schuur || sanitizedData.storage_schuur || false,

          // Update woningvoorkeur JSON to include parking preference
          woningvoorkeur: {
            type: sanitizedData.voorkeur_woningtype || 'appartement',
            meubilering: sanitizedData.meubilering_voorkeur || 'geen_voorkeur',
            voorzieningen: sanitizedData.gewenste_voorzieningen || [],
            wijken: sanitizedData.locatie_voorkeur || [],
            maxReistijd: sanitizedData.max_reistijd || 30,
            vervoer: sanitizedData.vervoers_voorkeur || 'openbaar_vervoer',
            slaapkamers_voorkeur: sanitizedData.voorkeur_slaapkamers,
            parkeren: sanitizedData.parkeren_vereist || sanitizedData.parking_required || false,
            opslag: {
              kelder: sanitizedData.opslag_kelder || sanitizedData.storage_kelder || false,
              zolder: sanitizedData.opslag_zolder || sanitizedData.storage_zolder || false,
              berging: sanitizedData.opslag_berging || sanitizedData.storage_berging || false,
              garage: sanitizedData.opslag_garage || sanitizedData.storage_garage || false,
              schuur: sanitizedData.opslag_schuur || sanitizedData.storage_schuur || false,
            }
          },
        };

        const { data, error } = await supabase
          .from('huurders')
          .update(tenantProfileData)
          .eq('id', currentUserId)
          .select()
          .single();

        if (error) {
          throw this.handleDatabaseError(error);
        }

        await this.createAuditLog('UPDATE', 'tenant_profiles', currentUserId, existingProfile, data);
        return { data, error: null };
      });
    });
  }

  /**
   * Create or update tenant profile - unified method (legacy compatibility)
   */
  async createTenantProfileUnified(data: CreateTenantProfileData): Promise<DatabaseResponse<Tables<'huurders'>>> {
    return this.withAuthGuard(async () => {
      const currentUserId = await this.getCurrentUserId();
      if (!currentUserId) {
        return {
          data: null,
          error: new AuthenticationError('Niet geautoriseerd'),
          success: false,
        };
      }

      // Check if profile exists to determine create vs update
      const { data: existingProfile } = await supabase
        .from('huurders')
        .select('id')
        .eq('id', currentUserId)
        .maybeSingle();

      if (existingProfile) {
        return this.updateTenantProfile(data);
      } else {
        return this.createTenantProfile(data);
      }
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
          tenantQuery = tenantQuery.gt('aantal_kinderen', 0);
        } else {
          tenantQuery = tenantQuery.eq('aantal_kinderen', 0);
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
        .select('profiel_foto')
        .eq('id', userId)
        .single();

      return tenant?.profiel_foto || null;
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
        return { data: null, error: null };
      }

      // Check if current user matches the requested userId (for security)
      if (session.user.id !== userId) {
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
          // Return null instead of throwing error to prevent breaking the app
          return { data: null, error: null };
        }

        if (activeData) {
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
          return { data: null, error: null };
        }

        if (pendingData) {
          // Return null for pending subscriptions so user is treated as not subscribed
          return { data: null, error: null };
        }

        // No subscription found
        return { data: null, error: null };

      } catch (error) {
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

  /**
   * Alias for getUsers method for admin dashboard compatibility
   */
  async getAllUsers(
    filters?: UserFilters,
    pagination?: PaginationOptions,
    sort?: SortOptions
  ): Promise<DatabaseResponse<any[]>> {
    return this.getUsers(filters, pagination, sort);
  }

  /**
   * Create a new user account (admin only)
   */
  async createUserAccount(data: {
    email: string;
    password: string;
    role: UserRole;
    voornaam: string;
    achternaam: string;
    telefoon?: string;
  }): Promise<DatabaseResponse<any>> {
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
        error: new Error('Geen toegang om gebruikers aan te maken'),
        success: false,
      };
    }

    const sanitizedData = this.sanitizeInput(data);

    const validation = this.validateRequiredFields(sanitizedData, ['email', 'password', 'role', 'voornaam', 'achternaam']);
    if (!validation.isValid) {
      return {
        data: null,
        error: new Error(`Verplichte velden ontbreken: ${validation.missingFields.join(', ')}`),
        success: false,
      };
    }

    if (!this.isValidEmail(sanitizedData.email)) {
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
      // Create the auth user first using admin client
      const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
        email: sanitizedData.email,
        password: sanitizedData.password,
        email_confirm: true,
        user_metadata: {
          first_name: sanitizedData.voornaam,
          last_name: sanitizedData.achternaam,
          role: sanitizedData.role
        }
      });

      if (authError || !newUser.user) {
        throw new Error(`Fout bij aanmaken auth gebruiker: ${authError?.message || 'Onbekende fout'}`);
      }

      const userId = newUser.user.id;

      try {
        // Create user profile
        const { data: profile, error: profileError } = await supabase
          .from('gebruikers')
          .insert({
            id: userId,
            naam: `${sanitizedData.voornaam} ${sanitizedData.achternaam}`,
            email: sanitizedData.email,
            telefoon: sanitizedData.telefoon,
            rol: sanitizedData.role,
            profiel_compleet: true,
            is_actief: true
          })
          .select()
          .single();

        if (profileError) {
          throw new Error(`Fout bij aanmaken profiel: ${profileError.message}`);
        }

        // Create role record
        const { error: roleError } = await supabase
          .from('gebruiker_rollen')
          .insert({
            user_id: userId,
            role: sanitizedData.role,
            subscription_status: sanitizedData.role === 'huurder' ? 'pending' : 'active'
          });

        if (roleError) {
          throw new Error(`Fout bij aanmaken rol: ${roleError.message}`);
        }

        // Create role-specific profile if needed
        if (sanitizedData.role === 'huurder') {
          await supabase
            .from('huurders')
            .insert({
              id: userId,
              voornaam: sanitizedData.voornaam,
              achternaam: sanitizedData.achternaam,
              email: sanitizedData.email,
              telefoon: sanitizedData.telefoon || '',
              profiel_compleet: false
            });
        } else if (sanitizedData.role === 'verhuurder') {
          await supabase
            .from('verhuurders')
            .insert({
              id: userId,
              bedrijfsnaam: `${sanitizedData.voornaam} ${sanitizedData.achternaam}`,
              email: sanitizedData.email,
              telefoon: sanitizedData.telefoon || '',
              profiel_compleet: true
            });
        } else if (sanitizedData.role === 'beoordelaar') {
          await supabase
            .from('beoordelaars')
            .insert({
              id: userId,
              naam: `${sanitizedData.voornaam} ${sanitizedData.achternaam}`,
              email: sanitizedData.email,
              profiel_compleet: true
            });
        }

        await this.createAuditLog('CREATE', 'gebruikers', userId, currentUserId, {
          action: 'admin_user_creation',
          role: sanitizedData.role,
          email: sanitizedData.email
        });

        return { data: profile, error: null };
      } catch (error) {
        // If profile creation fails, clean up the auth user
        await supabase.auth.admin.deleteUser(userId);
        throw error;
      }
    });
  }


}

// Export singleton instance
export const userService = new UserService();
