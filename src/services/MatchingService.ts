
import { supabase } from '@/integrations/supabase/client';

export class MatchingService {
  static async getMatches(tenantId: string) {
    try {
      // Get tenant profile first
      const { data: tenant, error: tenantError } = await supabase
        .from('tenant_profiles')
        .select('*')
        .eq('user_id', tenantId)
        .single();

      if (tenantError) throw tenantError;

      // For now, return empty array since properties table doesn't exist
      // TODO: Implement proper matching when properties table is available
      console.log('MatchingService: Properties table not available, returning empty matches');
      return [];

      // This would be the proper implementation when properties table exists:
      /*
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .gte('rent', tenant.min_budget || 0)
        .lte('rent', tenant.max_budget || 999999)
        .eq('city', tenant.preferred_city || '')
        .gte('bedrooms', tenant.preferred_bedrooms || 1);

      if (propertiesError) throw propertiesError;

      return properties || [];
      */
    } catch (error) {
      console.error('Error getting matches:', error);
      return [];
    }
  }

  static async getRecommendations(tenantId: string) {
    try {
      // For now, return empty array since properties table doesn't exist
      console.log('MatchingService: Properties table not available, returning empty recommendations');
      return [];

      // This would be the proper implementation:
      /*
      const { data: properties, error } = await supabase
        .from('properties')
        .select('*')
        .limit(10);

      if (error) throw error;
      return properties || [];
      */
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }

  static async calculateMatchScore(tenantProfile: any, property: any): Promise<number> {
    let score = 0;

    // Budget match (30% weight)
    if (property.rent <= tenantProfile.max_budget && property.rent >= tenantProfile.min_budget) {
      score += 30;
    }

    // Location match (25% weight)
    if (property.city === tenantProfile.preferred_city) {
      score += 25;
    }

    // Property type match (20% weight)
    if (property.type === tenantProfile.preferred_property_type) {
      score += 20;
    }

    // Bedroom count match (15% weight)
    if (property.bedrooms >= tenantProfile.preferred_bedrooms) {
      score += 15;
    }

    // Furnished preference match (10% weight)
    if (property.furnished === tenantProfile.furnished_preference) {
      score += 10;
    }

    return Math.min(score, 100); // Cap at 100%
  }

  static async saveMatch(tenantId: string, propertyId: string, score: number) {
    try {
      // For now, just log since matches table might not exist
      console.log('MatchingService: Would save match', { tenantId, propertyId, score });
      return;

      // This would be the proper implementation:
      /*
      const { error } = await supabase
        .from('matches')
        .insert({
          tenant_id: tenantId,
          property_id: propertyId,
          match_score: score,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      */
    } catch (error) {
      console.error('Error saving match:', error);
      throw error;
    }
  }

  static async getMatchHistory(tenantId: string) {
    try {
      // For now, return empty array
      console.log('MatchingService: Matches table not available, returning empty history');
      return [];

      // This would be the proper implementation:
      /*
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          properties (*)
        `)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
      */
    } catch (error) {
      console.error('Error getting match history:', error);
      return [];
    }
  }

  static async updateMatchPreferences(tenantId: string, preferences: any) {
    try {
      const { error } = await supabase
        .from('tenant_profiles')
        .update({
          preferred_city: preferences.city,
          preferred_property_type: preferences.propertyType,
          preferred_bedrooms: preferences.bedrooms,
          max_budget: preferences.maxBudget,
          min_budget: preferences.minBudget,
          furnished_preference: preferences.furnished,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', tenantId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating match preferences:', error);
      throw error;
    }
  }

  // Utility method to get property details (mock for now)
  static async getPropertyDetails(propertyId: string) {
    try {
      // For now, return mock data
      console.log('MatchingService: Properties table not available, returning mock property details');
      return {
        id: propertyId,
        title: 'Mock Property',
        rent: 1500,
        city: 'Amsterdam',
        bedrooms: 2,
        type: 'apartment',
        furnished: 'ongemeubileerd'
      };

      // This would be the proper implementation:
      /*
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (error) throw error;
      return data;
      */
    } catch (error) {
      console.error('Error getting property details:', error);
      return null;
    }
  }
}
