import { supabase } from '../integrations/supabase/client';
import { DatabaseService, DatabaseResponse } from '../lib/database';
import { logger } from '../lib/logger';
import { TenantProfile, Subscription, TenantDashboardData } from '../types';
import { Document } from './DocumentService';
import { optimizedSubscriptionService } from './OptimizedSubscriptionService';

interface ConsolidatedDashboardData {
  stats: TenantDashboardData;
  documents: Document[];
  tenantProfile: TenantProfile | null;
  subscription: any;
  profilePictureUrl: string | null;
  hasProfile: boolean;
}

export class ConsolidatedDashboardService extends DatabaseService {
  /** Map raw tenant and user rows to a structured TenantProfile */
  private mapTenantProfile(rawTenant: any, userRow: any): TenantProfile {
    if (!rawTenant || !userRow) {
      return null as unknown as TenantProfile;
    }

    const fullName = userRow.naam || '';
    const [firstName, ...lastParts] = fullName.split(' ');
    const lastName = lastParts.join(' ');

    const housing = rawTenant.woningvoorkeur || {};

    return {
      id: rawTenant.id,
      userId: rawTenant.id,
      firstName,
      lastName,
      email: userRow.email,
      phone: userRow.telefoon || '',
      dateOfBirth: rawTenant.geboortedatum || '',
      profession: rawTenant.beroep || '',
      income: rawTenant.inkomen || 0,
      bio: rawTenant.beschrijving || '',
      motivation: rawTenant.motivatie || '',
      profilePicture: rawTenant.profiel_foto || undefined,
      coverPhoto: rawTenant.cover_foto || undefined,
      isLookingForPlace: rawTenant.profiel_zichtbaar ?? false,
      preferences: {
        minBudget: rawTenant.min_huur || 0,
        maxBudget: rawTenant.max_huur || 0,
        city: Array.isArray(rawTenant.locatie_voorkeur)
          ? rawTenant.locatie_voorkeur[0]
          : rawTenant.locatie_voorkeur || '',
        bedrooms: rawTenant.min_kamers || 1,
        propertyType: housing.type || 'appartement',
        furnishedPreference: housing.meubilering,
        parkingRequired: housing.parkingRequired,
        storageNeeds: housing.storageNeeds,
        leaseDurationPreference: housing.leaseDurationPreference,
      },
      moveInDatePreferred: rawTenant.voorkeur_verhuisdatum || undefined,
      moveInDateEarliest: rawTenant.vroegste_verhuisdatum || undefined,
      availabilityFlexible: rawTenant.beschikbaarheid_flexibel || undefined,
      reasonForMoving: rawTenant.reden_verhuizen || undefined,
      guarantorAvailable: rawTenant.borgsteller_beschikbaar || undefined,
      guarantorName: rawTenant.borgsteller_naam || undefined,
      guarantorPhone: rawTenant.borgsteller_telefoon || undefined,
      guarantorIncome: rawTenant.borgsteller_inkomen || undefined,
      guarantorRelationship: rawTenant.borgsteller_relatie || undefined,
      incomeProofAvailable: rawTenant.inkomensbewijs_beschikbaar || undefined,
      hasPets: rawTenant.huisdieren || undefined,
      smokes: rawTenant.roken || undefined,
      documents: [],
      personalInfo: {
        fullName,
        email: userRow.email,
        phone: userRow.telefoon || '',
        dateOfBirth: rawTenant.geboortedatum || '',
        age: rawTenant.leeftijd || undefined,
        sex: rawTenant.geslacht || undefined,
        nationality: rawTenant.nationaliteit || undefined,
        maritalStatus: rawTenant.burgerlijke_staat || undefined,
      },
      workAndIncome: {
        profession: rawTenant.beroep || '',
        employer: rawTenant.werkgever || undefined,
        employmentStatus: rawTenant.werkstatus || undefined,
        contractType: rawTenant.type_arbeidscontract || undefined,
        monthlyIncome: rawTenant.inkomen || 0,
        workFromHome: rawTenant.thuiswerken || undefined,
        incomeProofAvailable: rawTenant.inkomensbewijs_beschikbaar || undefined,
      },
      housingPreferences: {
        minBudget: rawTenant.min_huur || 0,
        maxBudget: rawTenant.max_huur || 0,
        city: Array.isArray(rawTenant.locatie_voorkeur)
          ? rawTenant.locatie_voorkeur[0]
          : rawTenant.locatie_voorkeur || '',
        bedrooms: rawTenant.min_kamers || 1,
        propertyType: housing.type || 'appartement',
        furnishedPreference: housing.meubilering,
        parkingRequired: housing.parkingRequired,
        storageNeeds: housing.storageNeeds,
        leaseDurationPreference: housing.leaseDurationPreference,
        moveInDatePreferred: rawTenant.voorkeur_verhuisdatum || undefined,
        moveInDateEarliest: rawTenant.vroegste_verhuisdatum || undefined,
        reasonForMoving: rawTenant.reden_verhuizen || undefined,
      },
      lifestyleAndMotivation: {
        bio: rawTenant.beschrijving || '',
        motivation: rawTenant.motivatie || '',
        hasPets: rawTenant.huisdieren || undefined,
        petDetails: rawTenant.details_huisdieren || undefined,
        smokes: rawTenant.roken || undefined,
        smokingDetails: rawTenant.details_roken || undefined,
      },
      verificationStatus: rawTenant.verificatie_status || 'pending',
    } as TenantProfile;
  }

  /**
   * Fetch all dashboard data in a single optimized query
   */
  async getHuurderDashboardData(userId: string): Promise<DatabaseResponse<ConsolidatedDashboardData>> {
    return this.executeQuery(async () => {
      logger.info('Fetching consolidated dashboard data for user:', userId);

      try {
        // Execute all queries in parallel for maximum performance
        const [
          documentsResult,
          profileResult,
          userResult,
          subscriptionResult,
          profilePictureResult
        ] = await Promise.allSettled([
          // Get user documents
          supabase
            .from('documenten')
            .select('*')
            .eq('huurder_id', userId)
            .order('aangemaakt_op', { ascending: false }),
          
          // Get tenant profile
          supabase
            .from('huurders')
            .select('*')
            .eq('id', userId)
            .maybeSingle(),

          // Get basic user info
          supabase
            .from('gebruikers')
            .select('*')
            .eq('id', userId)
            .maybeSingle(),
          
          // Get active subscription using optimized service
          optimizedSubscriptionService.checkSubscriptionStatus(userId),
          
          // Get profile picture URL from database
          this.getProfilePictureUrl(userId)
        ]);

        // Process results
        const stats = { profileViews: 0, invitations: 0, applications: 0, acceptedApplications: 0 };

        const documents = documentsResult.status === 'fulfilled' && documentsResult.value.data
          ? documentsResult.value.data
          : [];

        const rawTenant = profileResult.status === 'fulfilled' && profileResult.value.data
          ? profileResult.value.data
          : null;

        const userRow = userResult.status === 'fulfilled' && userResult.value.data
          ? userResult.value.data
          : null;

        const tenantProfile = rawTenant && userRow
          ? this.mapTenantProfile(rawTenant, userRow)
          : null;

        const subscription = subscriptionResult.status === 'fulfilled' && subscriptionResult.value.success && subscriptionResult.value.data?.hasActiveSubscription
          ? { status: 'active', ...subscriptionResult.value.data }
          : null;

        const profilePictureUrl = profilePictureResult.status === 'fulfilled'
          ? profilePictureResult.value
          : null;

        const hasProfile = !!rawTenant;

        const consolidatedData: ConsolidatedDashboardData = {
          stats,
          documents,
          tenantProfile,
          subscription,
          profilePictureUrl,
          hasProfile
        };

        logger.info('Successfully fetched consolidated dashboard data');
        return { data: consolidatedData, error: null };

      } catch (error) {
        logger.error('Error fetching consolidated dashboard data:', error);
        return { data: null, error: error as Error };
      }
    });
  }

  /**
   * Get profile picture URL from database
   */
  private async getProfilePictureUrl(userId: string): Promise<string | null> {
    try {
      const { data: tenant } = await supabase
        .from('huurders')
        .select('profiel_foto, cover_foto')
        .eq('id', userId)
        .single();

      return tenant?.profiel_foto || null;
    } catch (error) {
      logger.error('Error getting profile picture URL:', error);
      return null;
    }
  }

  /**
   * Update subscription cache when payment is successful
   */
  async refreshSubscriptionStatus(userId: string): Promise<DatabaseResponse<any>> {
    return this.executeQuery(async () => {
      // Use optimized subscription service with cache refresh
      const result = await optimizedSubscriptionService.refreshSubscriptionStatus(userId);
      
      if (result.success && result.data?.hasActiveSubscription) {
        return { data: result.data, error: null };
      }

      return { data: null, error: null };
    });
  }
}

export const consolidatedDashboardService = new ConsolidatedDashboardService();
