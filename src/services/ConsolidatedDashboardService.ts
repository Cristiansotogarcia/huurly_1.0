import { supabase } from '../integrations/supabase/client';
import { DatabaseService, DatabaseResponse } from '../lib/database';
import { logger } from '../lib/logger';
import { TenantProfile, TenantDashboardData } from '../types';
import { Document } from './DocumentService';
import { optimizedSubscriptionService } from './OptimizedSubscriptionService';

interface ConsolidatedDashboardData {
  stats: TenantDashboardData;
  documents: Document[];
  tenantProfile: TenantProfile | null;
  subscription: any;
  profilePictureUrl: string | null;
  coverPhotoUrl: string | null;
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
      age: rawTenant.leeftijd || undefined,
      profession: rawTenant.beroep || '',
      income: rawTenant.inkomen || 0,
      bio: rawTenant.beschrijving || '',
      motivation: rawTenant.motivatie || '',
      profilePicture: rawTenant.profiel_foto || undefined,
      coverPhoto: rawTenant.cover_foto || undefined,
      isLookingForPlace: rawTenant.profiel_zichtbaar ?? false,
      // Expose commonly used flat fields for components expecting them
      preferredLocations: (() => {
        try {
          const locatieVoorkeur = rawTenant.locatie_voorkeur;

          // Handle null/undefined case
          if (!locatieVoorkeur) return [];

          // If it's already an array of objects (new format)
          if (Array.isArray(locatieVoorkeur)) {
            return locatieVoorkeur.map((locationItem: any) => {
              // If it's already a parsed object with name property
              if (typeof locationItem === 'object' && locationItem.name) {
                return locationItem;
              }

              // If it's a JSON string, parse it
              if (typeof locationItem === 'string') {
                try {
                  const parsed = JSON.parse(locationItem);
                  return typeof parsed === 'object' && parsed.name ? parsed : { name: locationItem };
                } catch (error) {
                  // If parsing fails, treat as plain string
                  return { name: locationItem };
                }
              }

              // Fallback
              return { name: String(locationItem) };
            }).filter(loc => loc.name && loc.name.trim() !== '');
          }

          // If it's a single string, try to parse it as JSON array first
          if (typeof locatieVoorkeur === 'string') {
            try {
              const parsed = JSON.parse(locatieVoorkeur);
              if (Array.isArray(parsed)) {
                return parsed.map((item: any) => {
                  if (typeof item === 'object' && item.name) {
                    return item;
                  }
                  if (typeof item === 'string') {
                    try {
                      const parsedItem = JSON.parse(item);
                      return typeof parsedItem === 'object' && parsedItem.name ? parsedItem : { name: item };
                    } catch (error) {
                      return { name: item };
                    }
                  }
                  return { name: String(item) };
                }).filter(loc => loc.name && loc.name.trim() !== '');
              } else if (typeof parsed === 'object' && parsed.name) {
                return [parsed];
              } else {
                return [{ name: parsed }];
              }
            } catch (error) {
              // If JSON parsing fails, treat as plain string (legacy format)
              return [{ name: locatieVoorkeur }];
            }
          }

          // Fallback for any other format
          return [];
        } catch (error) {
          console.error('Error parsing locatie_voorkeur:', error);
          return [];
        }
      })(),
      maxRent: rawTenant.max_huur || 0,
      minRooms: rawTenant.min_kamers || undefined,
      maxRooms: rawTenant.max_kamers || undefined,
      earliestMoveDate: rawTenant.vroegste_verhuisdatum || undefined,
      preferredMoveDate: rawTenant.voorkeur_verhuisdatum || undefined,
      description: rawTenant.beschrijving || '',
      preferences: {
        minBudget: rawTenant.min_budget || 0,
        maxBudget: rawTenant.max_huur || 0,
        city: (() => {
          try {
            const locatieVoorkeur = rawTenant.locatie_voorkeur;

            if (!locatieVoorkeur) return '';

            if (Array.isArray(locatieVoorkeur) && locatieVoorkeur.length > 0) {
              const firstItem = locatieVoorkeur[0];
              if (typeof firstItem === 'object' && firstItem.name) {
                return firstItem.name.split(',')[0].trim(); // Extract city name only
              }
              if (typeof firstItem === 'string') {
                try {
                  const parsed = JSON.parse(firstItem);
                  return typeof parsed === 'object' && parsed.name
                    ? parsed.name.split(',')[0].trim()
                    : firstItem;
                } catch (error) {
                  return firstItem;
                }
              }
              return String(firstItem);
            }

            if (typeof locatieVoorkeur === 'string') {
              try {
                const parsed = JSON.parse(locatieVoorkeur);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  const firstItem = parsed[0];
                  if (typeof firstItem === 'object' && firstItem.name) {
                    return firstItem.name.split(',')[0].trim();
                  }
                  if (typeof firstItem === 'string') {
                    try {
                      const parsedItem = JSON.parse(firstItem);
                      return typeof parsedItem === 'object' && parsedItem.name
                        ? parsedItem.name.split(',')[0].trim()
                        : firstItem;
                    } catch (error) {
                      return firstItem;
                    }
                  }
                  return String(firstItem);
                }
                if (typeof parsed === 'object' && parsed.name) {
                  return parsed.name.split(',')[0].trim();
                }
                return parsed;
              } catch (error) {
                return locatieVoorkeur;
              }
            }

            return '';
          } catch (error) {
            return rawTenant.locatie_voorkeur || '';
          }
        })(),
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
      reasonForMoving: rawTenant.reden_verhuizing || undefined,
      guarantorAvailable: rawTenant.borgsteller_beschikbaar || undefined,
      guarantorName: rawTenant.borgsteller_naam || undefined,
      guarantorPhone: rawTenant.borgsteller_telefoon || undefined,
      guarantorEmail: rawTenant.borgsteller_email || undefined,
      guarantorIncome: rawTenant.borgsteller_inkomen || undefined,
      guarantorRelationship: rawTenant.borgsteller_relatie || undefined,
      guarantorDetails: rawTenant.borgsteller_details || undefined,
      incomeProofAvailable: rawTenant.inkomensbewijs_beschikbaar || undefined,
      extraIncome: rawTenant.extra_inkomen || undefined,
      extraIncomeDescription: rawTenant.extra_inkomen_beschrijving || undefined,
      hasPartner: rawTenant.partner ?? undefined,
      partnerName: rawTenant.partner_naam || undefined,
      partnerProfession: rawTenant.partner_beroep || undefined,
      partnerEmploymentStatus: rawTenant.partner_dienstverband || undefined,
      partnerMonthlyIncome: rawTenant.partner_inkomen || undefined,
      hasChildren: rawTenant.heeft_kinderen || undefined,
      numberOfChildren: rawTenant.aantal_kinderen || undefined,
      childrenAges: rawTenant.kinderen_leeftijden || undefined,
      numberOfHousemates: rawTenant.aantal_huisgenoten || undefined,
      currentLivingSituation: rawTenant.huidige_woonsituatie || undefined,
      hasPets: rawTenant.huisdieren || undefined,
      petDetails: rawTenant.huisdier_details || undefined,
      smokes: rawTenant.roken || undefined,
      smokingDetails: rawTenant.rook_details || undefined,
      storageKelder: rawTenant.opslag_kelder || undefined,
      storageZolder: rawTenant.opslag_zolder || undefined,
      storageBerging: rawTenant.opslag_berging || undefined,
      storageGarage: rawTenant.opslag_garage || undefined,
      storageSchuur: rawTenant.opslag_schuur || undefined,
      referencesAvailable: rawTenant.referenties_beschikbaar || undefined,
      rentalHistoryYears: rawTenant.verhuurgeschiedenis_jaren || undefined,
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
        employmentStatus: rawTenant.dienstverband || undefined,
        contractType: rawTenant.contract_type || rawTenant.contracttype || rawTenant.dienstverband || undefined,
        monthlyIncome: rawTenant.inkomen || 0,
        workFromHome: rawTenant.thuiswerken || undefined,
        incomeProofAvailable: rawTenant.inkomensbewijs_beschikbaar || undefined,
      },
      housingPreferences: {
        minBudget: rawTenant.min_budget || 0,
        maxBudget: rawTenant.max_huur || 0,
        city: (() => {
          try {
            const locatieVoorkeur = rawTenant.locatie_voorkeur;

            if (!locatieVoorkeur) return '';

            if (Array.isArray(locatieVoorkeur) && locatieVoorkeur.length > 0) {
              const firstItem = locatieVoorkeur[0];
              if (typeof firstItem === 'object' && firstItem.name) {
                return firstItem.name.split(',')[0].trim(); // Extract city name only
              }
              if (typeof firstItem === 'string') {
                try {
                  const parsed = JSON.parse(firstItem);
                  return typeof parsed === 'object' && parsed.name
                    ? parsed.name.split(',')[0].trim()
                    : firstItem;
                } catch (error) {
                  return firstItem;
                }
              }
              return String(firstItem);
            }

            if (typeof locatieVoorkeur === 'string') {
              try {
                const parsed = JSON.parse(locatieVoorkeur);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  const firstItem = parsed[0];
                  if (typeof firstItem === 'object' && firstItem.name) {
                    return firstItem.name.split(',')[0].trim();
                  }
                  if (typeof firstItem === 'string') {
                    try {
                      const parsedItem = JSON.parse(firstItem);
                      return typeof parsedItem === 'object' && parsedItem.name
                        ? parsedItem.name.split(',')[0].trim()
                        : firstItem;
                    } catch (error) {
                      return firstItem;
                    }
                  }
                  return String(firstItem);
                }
                if (typeof parsed === 'object' && parsed.name) {
                  return parsed.name.split(',')[0].trim();
                }
                return parsed;
              } catch (error) {
                return locatieVoorkeur;
              }
            }

            return '';
          } catch (error) {
            return rawTenant.locatie_voorkeur || '';
          }
        })(),
        bedrooms: rawTenant.min_kamers || 1,
        minRooms: rawTenant.min_kamers || undefined,
        maxRooms: rawTenant.max_kamers || undefined,
        propertyType: housing.type || 'appartement',
        furnishedPreference: rawTenant.voorkeur_meubilering || housing.meubilering,
        parkingRequired: rawTenant.parkeren_vereist || housing.parkingRequired,
        storageNeeded: rawTenant.opslag_nodig || housing.storageNeeds,
        leaseDurationPreference: rawTenant.huurcontract_voorkeur || housing.leaseDurationPreference,
        moveInDatePreferred: rawTenant.voorkeur_verhuisdatum || undefined,
        moveInDateEarliest: rawTenant.vroegste_verhuisdatum || undefined,
        moveInDate: rawTenant.datum_beschikbaar || undefined,
        moveInDateFlexible: rawTenant.datum_flexibel || undefined,
        reasonForMoving: rawTenant.reden_verhuizing || undefined,
      },
      lifestyleAndMotivation: {
        bio: rawTenant.beschrijving || '',
        motivation: rawTenant.motivatie || '',
        hasPets: rawTenant.huisdieren || undefined,
        petDetails: rawTenant.huisdier_details || undefined,
        smokes: rawTenant.roken || undefined,
        smokingDetails: rawTenant.rook_details || undefined,
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
          photoUrlsResult,
          profileViewsResult,
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

          // Get profile and cover photo URLs from database
          this.getPhotoUrls(userId),

          // Count profile views
          supabase
            .from('profiel_weergaves')
            .select('id', { count: 'exact', head: true })
            .eq('huurder_id', userId),
        ]);

        // Process results
        const stats: TenantDashboardData = {
          profileViews:
            profileViewsResult.status === 'fulfilled'
              ? profileViewsResult.value.count ?? 0
              : 0,
          applications: 0,
          acceptedApplications: 0,
        };

        const rawDocuments =
          documentsResult.status === 'fulfilled' && documentsResult.value.data
            ? documentsResult.value.data
            : [];

        // Type guard to filter documents with a non-null huurder_id
        const isDocumentWithHuurder = (doc: any): doc is any & { huurder_id: string } =>
          doc.huurder_id !== null;

        const documents: Document[] = rawDocuments
          .filter(isDocumentWithHuurder)
          .map((doc) => ({
            id: doc.id,
            huurder_id: doc.huurder_id, // Now correctly typed as string
            beoordelaar_id: doc.beoordelaar_id ?? undefined,
            bestandsnaam: doc.bestandsnaam,
            bestand_url: doc.bestand_url,
            beoordeling_notitie: doc.beoordeling_notitie ?? undefined,
            type: doc.type,
            status: doc.status,
            aangemaakt_op: doc.aangemaakt_op,
            bijgewerkt_op: doc.bijgewerkt_op,
          }));

        const rawTenant =
          profileResult.status === 'fulfilled' && profileResult.value.data
            ? profileResult.value.data
            : null;

        const userRow =
          userResult.status === 'fulfilled' && userResult.value.data
            ? userResult.value.data
            : null;

        const tenantProfile =
          rawTenant && userRow ? this.mapTenantProfile(rawTenant, userRow) : null;

        const subscription =
          subscriptionResult.status === 'fulfilled' &&
          subscriptionResult.value.success &&
          subscriptionResult.value.data?.hasActiveSubscription
            ? { status: 'active', ...subscriptionResult.value.data }
            : null;

        const photoUrls =
          photoUrlsResult.status === 'fulfilled'
            ? photoUrlsResult.value
            : { profilePictureUrl: null, coverPhotoUrl: null };

        const hasProfile = !!rawTenant;

        const consolidatedData: ConsolidatedDashboardData = {
          stats,
          documents,
          tenantProfile,
          subscription,
          profilePictureUrl: photoUrls.profilePictureUrl,
          coverPhotoUrl: photoUrls.coverPhotoUrl,
          hasProfile,
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
   * Get profile picture and cover photo URLs from database
   */
  private async getPhotoUrls(userId: string): Promise<{ profilePictureUrl: string | null; coverPhotoUrl: string | null }> {
    try {
      const { data: tenant } = await supabase
        .from('huurders')
        .select('profiel_foto, cover_foto')
        .eq('id', userId)
        .single();

      return {
        profilePictureUrl: tenant?.profiel_foto || null,
        coverPhotoUrl: tenant?.cover_foto || null
      };
    } catch (error) {
      logger.error('Error getting photo URLs:', error);
      return { profilePictureUrl: null, coverPhotoUrl: null };
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
