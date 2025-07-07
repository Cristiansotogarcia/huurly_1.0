
import { supabase } from '../integrations/supabase/client.ts';
import { logger } from '../lib/logger.ts';

export class MatchingService {
  static async getMatches(tenantId: string) {
    try {
      // Get tenant profile first
      const { data: tenant, error: tenantError } = await supabase
        .from('huurders')
        .select('*')
        .eq('id', tenantId)
        .single();

      if (tenantError) {
        logger.error('Error fetching tenant profile:', tenantError);
        return [];
      }

      // Since the 'panden' table doesn't exist, return empty array
      // This would be the proper implementation when the properties table exists:
      logger.info('MatchingService: Properties table not available, returning empty matches');
      return [];

      // Future implementation:
      /*
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .gte('rent_price', tenant.max_huur ?? 0)
        .lte('rent_price', tenant.max_huur ?? Number.MAX_SAFE_INTEGER)
        .overlaps('location', tenant.locatie_voorkeur ?? [])
        .gte('bedrooms', tenant.min_kamers ?? 1);

      if (propertiesError) throw propertiesError;
      return properties || [];
      */
    } catch (error) {
      logger.error('Error getting matches:', error);
      return [];
    }
  }

  static async getRecommendations(tenantId: string) {
    try {
      // For now, return empty array since properties table doesn't exist
      logger.info('MatchingService: Properties table not available, returning empty recommendations');
      return [];
    } catch (error) {
      logger.error('Error getting recommendations:', error);
      return [];
    }
  }

  static async calculateMatchScore(tenantProfile: any, property: any): Promise<number> {
    let score = 0;

    // Budget match (30% weight) - using correct column names
    const maxBudget = tenantProfile.max_huur || 0;
    if (property.rent_price <= maxBudget) {
      score += 30;
    }

    // Location match (25% weight) - using correct column names
    const locationPreferences = tenantProfile.locatie_voorkeur || [];
    if (locationPreferences.includes(property.city)) {
      score += 25;
    }

    // Bedroom count match (15% weight) - using correct column names
    const minRooms = tenantProfile.min_kamers || 1;
    if (property.bedrooms >= minRooms) {
      score += 15;
    }

    // Furnished preference match (10% weight) - using woningvoorkeur JSON
    const housingPrefs = tenantProfile.woningvoorkeur || {};
    if (housingPrefs.meubilering === property.furnished_status) {
      score += 10;
    }

    // Property type match (20% weight) - using woningvoorkeur JSON
    if (housingPrefs.type === property.property_type) {
      score += 20;
    }

    return Math.min(score, 100); // Cap at 100%
  }

  static async saveMatch(tenantId: string, propertyId: string, score: number) {
    try {
      // For now, just log since matches table might not exist
      logger.info('MatchingService: Would save match', { tenantId, propertyId, score });
      return;
    } catch (error) {
      logger.error('Error saving match:', error);
      throw error;
    }
  }

  static async getMatchHistory(tenantId: string) {
    try {
      // For now, return empty array
      logger.info('MatchingService: Matches table not available, returning empty history');
      return [];
    } catch (error) {
      logger.error('Error getting match history:', error);
      return [];
    }
  }

  static async updateMatchPreferences(tenantId: string, preferences: any) {
    try {
      const { error } = await supabase
        .from('huurders')
        .update({
          locatie_voorkeur: preferences.city ? [preferences.city] : [],
          max_huur: preferences.maxBudget,
          min_kamers: preferences.minBedrooms,
          max_kamers: preferences.maxBedrooms,
          woningvoorkeur: {
            type: preferences.propertyType,
            meubilering: preferences.furnished,
            ...preferences
          },
          bijgewerkt_op: new Date().toISOString()
        })
        .eq('id', tenantId);

      if (error) throw error;
    } catch (error) {
      logger.error('Error updating match preferences:', error);
      throw error;
    }
  }

  // Utility method to get property details (mock for now)
  static async getPropertyDetails(propertyId: string) {
    try {
      // For now, return mock data
      logger.info('MatchingService: Properties table not available, returning mock property details');
      return {
        id: propertyId,
        title: 'Mock Property',
        rent_price: 1500,
        city: 'Amsterdam',
        bedrooms: 2,
        property_type: 'appartement',
        furnished_status: 'ongemeubileerd'
      };
    } catch (error) {
      logger.error('Error getting property details:', error);
      return null;
    }
  }
}
