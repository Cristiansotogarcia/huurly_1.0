
import { supabase } from '../integrations/supabase/client';
import { logger } from '../lib/logger';
import { Tables } from '../types/database';

export interface MatchResult {
  property: Tables<'woningen'>;
  score: number;
  matchFactors: MatchFactor[];
}

export interface MatchFactor {
  name: string;
  weight: number;
  score: number;
  details: string;
}

export interface MatchPreferences {
  maxBudget?: number;
  minBudget?: number;
  locationPreferences?: string[];
  propertyType?: string;
  minRooms?: number;
  maxRooms?: number;
  furnishedPreference?: string;
  availabilityDate?: string;
}

export class MatchingService {
  /**
   * Get matches for a tenant based on their preferences and profile
   */
  static async getMatches(tenantId: string): Promise<MatchResult[]> {
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

      if (!tenant) {
        logger.warn('Tenant profile not found:', tenantId);
        return [];
      }

      // Get active properties that match basic criteria
      const { data: properties, error: propertiesError } = await supabase
        .from('woningen')
        .select('*')
        .eq('is_actief', true)
        .eq('status', 'actief')
        .lte('huurprijs', tenant.max_huur ?? Number.MAX_SAFE_INTEGER)
        .gte('huurprijs', tenant.min_budget ?? 0)
        .order('huurprijs', { ascending: true });

      if (propertiesError) {
        logger.error('Error fetching properties:', propertiesError);
        return [];
      }

      // Calculate match scores for each property
      const matches: MatchResult[] = [];
      
      for (const property of properties) {
        const matchScore = await this.calculateMatchScore(tenant, property);
        const matchFactors = await this.getMatchFactors(tenant, property);
        
        matches.push({
          property,
          score: matchScore,
          matchFactors
        });
      }

      // Sort by score descending
      matches.sort((a, b) => b.score - a.score);

      // Save top matches to database
      await this.saveTopMatches(tenantId, matches.slice(0, 10));

      return matches;
    } catch (error) {
      logger.error('Error getting matches:', error);
      return [];
    }
  }

  /**
   * Get personalized recommendations for a tenant
   */
  static async getRecommendations(tenantId: string, limit: number = 10): Promise<MatchResult[]> {
    try {
      const matches = await this.getMatches(tenantId);
      return matches.slice(0, limit);
    } catch (error) {
      logger.error('Error getting recommendations:', error);
      return [];
    }
  }

  /**
   * Calculate comprehensive match score between tenant and property
   */
  static async calculateMatchScore(
    tenantProfile: Tables<'huurders'>, 
    property: Tables<'woningen'>
  ): Promise<number> {
    let totalScore = 0;
    let totalWeight = 0;

    // Budget match (30% weight)
    const budgetScore = this.calculateBudgetMatch(tenantProfile, property);
    totalScore += budgetScore * 30;
    totalWeight += 30;

    // Location match (25% weight)
    const locationScore = this.calculateLocationMatch(tenantProfile, property);
    totalScore += locationScore * 25;
    totalWeight += 25;

    // Property features match (20% weight)
    const featuresScore = this.calculateFeaturesMatch(tenantProfile, property);
    totalScore += featuresScore * 20;
    totalWeight += 20;

    // Availability match (15% weight)
    const availabilityScore = this.calculateAvailabilityMatch(tenantProfile, property);
    totalScore += availabilityScore * 15;
    totalWeight += 15;

    // Property type match (10% weight)
    const typeScore = this.calculatePropertyTypeMatch(tenantProfile, property);
    totalScore += typeScore * 10;
    totalWeight += 10;

    return totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) / 100 : 0;
  }

  /**
   * Get detailed match factors for transparency
   */
  static async getMatchFactors(
    tenantProfile: Tables<'huurders'>, 
    property: Tables<'woningen'>
  ): Promise<MatchFactor[]> {
    return [
      {
        name: 'Budget Match',
        weight: 30,
        score: this.calculateBudgetMatch(tenantProfile, property) * 100,
        details: `Tenant budget: €${tenantProfile.max_huur ?? 0}, Property rent: €${property.huurprijs}`
      },
      {
        name: 'Location Match',
        weight: 25,
        score: this.calculateLocationMatch(tenantProfile, property) * 100,
        details: `Preferred locations: ${tenantProfile.locatie_voorkeur?.join(', ') || 'None'}, Property city: ${property.stad}`
      },
      {
        name: 'Features Match',
        weight: 20,
        score: this.calculateFeaturesMatch(tenantProfile, property) * 100,
        details: `Tenant needs: ${tenantProfile.min_kamers ?? 1}+ rooms, Property has: ${property.aantal_kamers ?? 0} rooms`
      },
      {
        name: 'Availability Match',
        weight: 15,
        score: this.calculateAvailabilityMatch(tenantProfile, property) * 100,
        details: `Tenant available from: ${tenantProfile.vroegste_verhuisdatum || 'Any'}, Property available from: ${property.beschikbaar_vanaf || 'Now'}`
      },
      {
        name: 'Property Type Match',
        weight: 10,
        score: this.calculatePropertyTypeMatch(tenantProfile, property) * 100,
        details: `Tenant preference: ${tenantProfile.voorkeur_woningtype || 'Any'}, Property type: ${property.woning_type || 'Unknown'}`
      }
    ];
  }

  /**
   * Calculate budget match score (0-1)
   */
  static calculateBudgetMatch(tenantProfile: Tables<'huurders'>, property: Tables<'woningen'>): number {
    const maxBudget = tenantProfile.max_huur ?? Number.MAX_SAFE_INTEGER;
    const propertyRent = property.huurprijs ?? 0;
    
    if (propertyRent <= maxBudget) {
      // Perfect match if within budget
      return 1;
    } else if (propertyRent <= maxBudget * 1.2) {
      // Partial match if slightly over budget (0.8 to 0)
      return Math.max(0, 1 - ((propertyRent - maxBudget) / (maxBudget * 0.2)));
    }
    
    return 0;
  }

  /**
   * Calculate location match score (0-1)
   */
  static calculateLocationMatch(tenantProfile: Tables<'huurders'>, property: Tables<'woningen'>): number {
    const locationPrefs = tenantProfile.locatie_voorkeur ?? [];
    
    if (locationPrefs.length === 0) {
      return 0.5; // Neutral score if no preferences
    }
    
    if (locationPrefs.includes(property.stad)) {
      return 1; // Perfect match
    }
    
    // Check if property is in preferred province
    if (property.provincie && locationPrefs.includes(property.provincie)) {
      return 0.7; // Good match
    }
    
    return 0.1; // Low match
  }

  /**
   * Calculate property features match score (0-1)
   */
  static calculateFeaturesMatch(tenantProfile: Tables<'huurders'>, property: Tables<'woningen'>): number {
    let score = 0;
    let maxScore = 3; // Room count, area, and basic match

    // Room count match
    const minRooms = tenantProfile.min_kamers ?? 1;
    const propertyRooms = property.aantal_kamers ?? 0;
    if (propertyRooms >= minRooms) {
      score += 1;
    } else if (propertyRooms >= minRooms * 0.8) {
      score += 0.7;
    }

    // Area match (if available)
    const minArea = tenantProfile.woningvoorkeur?.min_area as number ?? 0;
    const propertyArea = property.oppervlakte ?? 0;
    if (minArea > 0) {
      maxScore += 1;
      if (propertyArea >= minArea) {
        score += 1;
      } else if (propertyArea >= minArea * 0.8) {
        score += 0.7;
      }
    }

    // Furnished preference match
    const furnishingPref = tenantProfile.woningvoorkeur?.meubilering as string ?? 'ongemeubileerd';
    const propertyFurnished = property.meubilering ?? 'ongemeubileerd';
    if (furnishingPref === propertyFurnished) {
      score += 1;
    }
    maxScore += 1;

    return maxScore > 0 ? score / maxScore : 0;
  }

  /**
   * Calculate availability match score (0-1)
   */
  static calculateAvailabilityMatch(tenantProfile: Tables<'huurders'>, property: Tables<'woningen'>): number {
    const tenantDate = tenantProfile.vroegste_verhuisdatum;
    const propertyDate = property.beschikbaar_vanaf;

    if (!tenantDate) return 0.8; // Good match if tenant is flexible
    if (!propertyDate) return 0.9; // Very good match if property is immediately available

    // Convert to dates and compare
    const tenantAvailable = new Date(tenantDate);
    const propertyAvailable = new Date(propertyDate);

    if (propertyAvailable <= tenantAvailable) {
      return 1; // Perfect match
    }

    // Calculate time difference in days
    const diffTime = propertyAvailable.getTime() - tenantAvailable.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    // If property is available within 30 days, partial match
    if (diffDays <= 30) {
      return 0.7 + (0.3 * (30 - diffDays) / 30);
    }

    return 0.3; // Low match if property is not available soon
  }

  /**
   * Calculate property type match score (0-1)
   */
  static calculatePropertyTypeMatch(tenantProfile: Tables<'huurders'>, property: Tables<'woningen'>): number {
    const tenantType = tenantProfile.voorkeur_woningtype;
    const propertyType = property.woning_type;

    if (!tenantType || !propertyType) return 0.5; // Neutral if either is undefined

    if (tenantType === propertyType) {
      return 1; // Perfect match
    }

    // Similar property types get partial match
    const similarTypes = {
      'appartement': ['studio', 'loft'],
      'huis': ['villa', 'bungalow'],
      'studio': ['appartement', 'loft']
    };

    if (similarTypes[tenantType]?.includes(propertyType)) {
      return 0.8; // Good match
    }

    return 0.3; // Low match
  }

  /**
   * Save match results to database for analytics and history
   */
  static async saveMatch(tenantId: string, propertyId: string, score: number, status: string = 'pending') {
    try {
      const { data, error } = await supabase
        .from('matches')
        .upsert({
          huurder_id: tenantId,
          woning_id: propertyId,
          score: score,
          status: status,
          aangemaakt_op: new Date().toISOString(),
          bijgewerkt_op: new Date().toISOString()
        }, {
          onConflict: 'huurder_id,woning_id'
        });

      if (error) {
        logger.error('Error saving match:', error);
        return null;
      }

      return data;
    } catch (error) {
      logger.error('Error saving match:', error);
      return null;
    }
  }

  /**
   * Save top matches for a tenant
   */
  static async saveTopMatches(tenantId: string, matches: MatchResult[]) {
    try {
      const matchRecords = matches.map(match => ({
        huurder_id: tenantId,
        woning_id: match.property.id,
        score: match.score,
        status: 'pending',
        aangemaakt_op: new Date().toISOString(),
        bijgewerkt_op: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('matches')
        .upsert(matchRecords, {
          onConflict: 'huurder_id,woning_id'
        });

      if (error) {
        logger.error('Error saving top matches:', error);
      }
    } catch (error) {
      logger.error('Error saving top matches:', error);
    }
  }

  /**
   * Get match history for a tenant
   */
  static async getMatchHistory(tenantId: string) {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          woningen (
            titel,
            stad,
            huurprijs,
            foto_urls
          )
        `)
        .eq('huurder_id', tenantId)
        .order('aangemaakt_op', { ascending: false })
        .limit(20);

      if (error) {
        logger.error('Error getting match history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Error getting match history:', error);
      return [];
    }
  }

  /**
   * Update tenant's match preferences
   */
  static async updateMatchPreferences(tenantId: string, preferences: MatchPreferences) {
    try {
      const { error } = await supabase
        .from('huurders')
        .update({
          locatie_voorkeur: preferences.locationPreferences,
          max_huur: preferences.maxBudget,
          min_kamers: preferences.minRooms,
          max_kamers: preferences.maxRooms,
          voorkeur_woningtype: preferences.propertyType,
          vroegste_verhuisdatum: preferences.availabilityDate,
          woningvoorkeur: {
            meubilering: preferences.furnishedPreference,
            ...preferences
          },
          bijgewerkt_op: new Date().toISOString()
        })
        .eq('id', tenantId);

      if (error) throw error;
      
      logger.info('Match preferences updated for tenant:', tenantId);
      return true;
    } catch (error) {
      logger.error('Error updating match preferences:', error);
      throw error;
    }
  }

  /**
   * Get property details for a specific property
   */
  static async getPropertyDetails(propertyId: string) {
    try {
      const { data, error } = await supabase
        .from('woningen')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (error) {
        logger.error('Error getting property details:', error);
        return null;
      }

      return data;
    } catch (error) {
      logger.error('Error getting property details:', error);
      return null;
    }
  }

  /**
   * Get tenant's saved matches (favorites/bookmarks)
   */
  static async getSavedMatches(tenantId: string) {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          woningen (*)
        `)
        .eq('huurder_id', tenantId)
        .eq('status', 'saved')
        .order('aangemaakt_op', { ascending: false });

      if (error) {
        logger.error('Error getting saved matches:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Error getting saved matches:', error);
      return [];
    }
  }
}
