import { supabase } from '@/integrations/supabase/client';

export interface MatchCriteria {
  maxBudget: number;
  minBudget: number;
  preferredCities: string[];
  preferredProvinces: string[];
  bedrooms: number;
  bathrooms?: number;
  propertyTypes: string[];
  furnished?: boolean;
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  maxCommute?: number; // in km
}

export interface PropertyMatch {
  property: any;
  tenant: any;
  matchScore: number;
  matchReasons: string[];
  compatibility: {
    budget: number;
    location: number;
    preferences: number;
    requirements: number;
  };
}

export interface TenantMatch {
  tenant: any;
  property: any;
  matchScore: number;
  matchReasons: string[];
  compatibility: {
    budget: number;
    location: number;
    preferences: number;
    requirements: number;
  };
}

export interface DatabaseResponse<T> {
  data: T | null;
  error: Error | null;
  success: boolean;
}

export class MatchingService {
  /**
   * Find matching properties for a tenant
   */
  async findMatchingProperties(
    tenantId: string,
    limit: number = 20
  ): Promise<DatabaseResponse<PropertyMatch[]>> {
    try {
      // Get tenant preferences
      // @ts-ignore - Suppress Supabase type recursion error
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenant_profiles')
        .select('*')
        .eq('user_id', tenantId)
        .single();

      if (tenantError || !tenantData) {
        return {
          data: null,
          error: new Error('Huurder profiel niet gevonden'),
          success: false,
        };
      }

      // Get active properties
      // @ts-ignore - Suppress Supabase type recursion error
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'active');

      if (propertiesError) {
        return {
          data: null,
          error: new Error('Fout bij ophalen woningen'),
          success: false,
        };
      }

      // Calculate matches
      const matches: PropertyMatch[] = [];

      for (const property of properties || []) {
        const matchResult = this.calculatePropertyMatch(tenantData, property);
        
        if (matchResult.matchScore > 0.3) { // Only include matches above 30%
          matches.push(matchResult);
        }
      }

      // Sort by match score (highest first)
      matches.sort((a, b) => b.matchScore - a.matchScore);

      // Limit results
      const limitedMatches = matches.slice(0, limit);

      return { 
        data: limitedMatches, 
        error: null, 
        success: true 
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
        success: false,
      };
    }
  }

  /**
   * Find matching tenants for a property
   */
  async findMatchingTenants(
    propertyId: string,
    limit: number = 20
  ): Promise<DatabaseResponse<TenantMatch[]>> {
    try {
      // Get property data
      // @ts-ignore - Suppress Supabase type recursion error
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (propertyError || !property) {
        return {
          data: null,
          error: new Error('Woning niet gevonden'),
          success: false,
        };
      }

      // Get active tenant profiles
      // @ts-ignore - Suppress Supabase type recursion error
      const { data: tenants, error: tenantsError } = await supabase
        .from('tenant_profiles')
        .select('*')
        .eq('is_looking_for_place', true);

      if (tenantsError) {
        return {
          data: null,
          error: new Error('Fout bij ophalen huurders'),
          success: false,
        };
      }

      // Calculate matches
      const matches: TenantMatch[] = [];

      for (const tenant of tenants || []) {
        const matchResult = this.calculateTenantMatch(property, tenant);
        
        if (matchResult.matchScore > 0.3) { // Only include matches above 30%
          matches.push(matchResult);
        }
      }

      // Sort by match score (highest first)
      matches.sort((a, b) => b.matchScore - a.matchScore);

      // Limit results
      const limitedMatches = matches.slice(0, limit);

      return { 
        data: limitedMatches, 
        error: null, 
        success: true 
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
        success: false,
      };
    }
  }

  /**
   * Calculate property match for a tenant
   */
  private calculatePropertyMatch(tenant: any, property: any): PropertyMatch {
    const compatibility = {
      budget: 0,
      location: 0,
      preferences: 0,
      requirements: 0,
    };

    const matchReasons: string[] = [];

    // Budget compatibility (40% weight)
    const tenantMaxBudget = tenant.max_budget || 0;
    const tenantMinBudget = tenant.min_budget || 0;
    const propertyRent = property.rent_amount || 0;

    if (propertyRent >= tenantMinBudget && propertyRent <= tenantMaxBudget) {
      compatibility.budget = 1.0;
      matchReasons.push('Binnen budget');
    } else if (propertyRent <= tenantMaxBudget * 1.1) {
      compatibility.budget = 0.7;
      matchReasons.push('Net boven budget');
    } else if (propertyRent >= tenantMinBudget * 0.9) {
      compatibility.budget = 0.5;
      matchReasons.push('Dicht bij budget');
    }

    // Location compatibility (25% weight)
    if (tenant.preferred_city && property.city) {
      if (tenant.preferred_city.toLowerCase() === property.city.toLowerCase()) {
        compatibility.location = 1.0;
        matchReasons.push('Gewenste stad');
      } else if (tenant.preferred_province && property.province) {
        if (tenant.preferred_province.toLowerCase() === property.province.toLowerCase()) {
          compatibility.location = 0.6;
          matchReasons.push('Gewenste provincie');
        }
      }
    }

    // Preferences compatibility (20% weight)
    let preferenceScore = 0;
    let preferenceCount = 0;

    // Bedrooms
    if (tenant.preferred_bedrooms && property.bedrooms) {
      preferenceCount++;
      if (tenant.preferred_bedrooms === property.bedrooms) {
        preferenceScore += 1;
        matchReasons.push(`${property.bedrooms} slaapkamers`);
      } else if (Math.abs(tenant.preferred_bedrooms - property.bedrooms) === 1) {
        preferenceScore += 0.7;
      }
    }

    // Property type
    if (tenant.preferred_property_type && property.property_type) {
      preferenceCount++;
      if (tenant.preferred_property_type === property.property_type) {
        preferenceScore += 1;
        matchReasons.push(property.property_type);
      }
    }

    // Furnished
    if (tenant.furnished_preference !== null && property.furnished !== null) {
      preferenceCount++;
      if (tenant.furnished_preference === property.furnished) {
        preferenceScore += 1;
        if (property.furnished) {
          matchReasons.push('Gemeubileerd');
        }
      }
    }

    compatibility.preferences = preferenceCount > 0 ? preferenceScore / preferenceCount : 0.5;

    // Requirements compatibility (15% weight)
    let requirementScore = 1;

    // Pets
    if (tenant.has_pets && !property.pets_allowed) {
      requirementScore -= 0.5;
    } else if (tenant.has_pets && property.pets_allowed) {
      matchReasons.push('Huisdieren toegestaan');
    }

    // Smoking
    if (tenant.smoking && !property.smoking_allowed) {
      requirementScore -= 0.3;
    } else if (tenant.smoking && property.smoking_allowed) {
      matchReasons.push('Roken toegestaan');
    }

    compatibility.requirements = Math.max(0, requirementScore);

    // Calculate overall match score
    const matchScore = (
      compatibility.budget * 0.4 +
      compatibility.location * 0.25 +
      compatibility.preferences * 0.2 +
      compatibility.requirements * 0.15
    );

    return {
      property,
      tenant,
      matchScore,
      matchReasons,
      compatibility,
    };
  }

  /**
   * Calculate tenant match for a property
   */
  private calculateTenantMatch(property: any, tenant: any): TenantMatch {
    const compatibility = {
      budget: 0,
      location: 0,
      preferences: 0,
      requirements: 0,
    };

    const matchReasons: string[] = [];

    // Budget compatibility (40% weight)
    const tenantMaxBudget = tenant.max_budget || 0;
    const tenantMinBudget = tenant.min_budget || 0;
    const propertyRent = property.rent_amount || 0;

    if (propertyRent >= tenantMinBudget && propertyRent <= tenantMaxBudget) {
      compatibility.budget = 1.0;
      matchReasons.push('Kan huur betalen');
    } else if (propertyRent <= tenantMaxBudget * 1.1) {
      compatibility.budget = 0.7;
      matchReasons.push('Net binnen budget');
    }

    // Location compatibility (25% weight)
    if (tenant.preferred_city && property.city) {
      if (tenant.preferred_city.toLowerCase() === property.city.toLowerCase()) {
        compatibility.location = 1.0;
        matchReasons.push('Gewenste locatie');
      }
    }

    // Preferences compatibility (20% weight)
    let preferenceScore = 0;
    let preferenceCount = 0;

    if (tenant.preferred_bedrooms && property.bedrooms) {
      preferenceCount++;
      if (tenant.preferred_bedrooms === property.bedrooms) {
        preferenceScore += 1;
        matchReasons.push('Gewenst aantal kamers');
      }
    }

    if (tenant.preferred_property_type && property.property_type) {
      preferenceCount++;
      if (tenant.preferred_property_type === property.property_type) {
        preferenceScore += 1;
        matchReasons.push('Gewenst woningtype');
      }
    }

    compatibility.preferences = preferenceCount > 0 ? preferenceScore / preferenceCount : 0.5;

    // Requirements compatibility (15% weight)
    let requirementScore = 1;

    if (tenant.has_pets && !property.pets_allowed) {
      requirementScore -= 0.5;
    }

    if (tenant.smoking && !property.smoking_allowed) {
      requirementScore -= 0.3;
    }

    compatibility.requirements = Math.max(0, requirementScore);

    // Calculate overall match score
    const matchScore = (
      compatibility.budget * 0.4 +
      compatibility.location * 0.25 +
      compatibility.preferences * 0.2 +
      compatibility.requirements * 0.15
    );

    return {
      tenant,
      property,
      matchScore,
      matchReasons,
      compatibility,
    };
  }

  /**
   * Get matching statistics
   */
  async getMatchingStatistics(): Promise<DatabaseResponse<any>> {
    try {
      // Get total counts
      const { data: properties } = await supabase
        .from('properties')
        .select('id')
        .eq('status', 'active');

      const { data: tenants } = await supabase
        .from('tenant_profiles')
        .select('id')
        .eq('is_looking_for_place', true);

      // Calculate potential matches (simplified)
      const totalProperties = properties?.length || 0;
      const totalTenants = tenants?.length || 0;
      const potentialMatches = totalProperties * totalTenants;

      const statistics = {
        totalActiveProperties: totalProperties,
        totalActiveTenants: totalTenants,
        potentialMatches,
        averageMatchesPerProperty: totalTenants,
        averageMatchesPerTenant: totalProperties,
      };

      return { 
        data: statistics, 
        error: null, 
        success: true 
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
        success: false,
      };
    }
  }

  /**
   * Create a match notification
   */
  async createMatchNotification(
    userId: string,
    matchType: 'property' | 'tenant',
    matchId: string,
    matchScore: number
  ): Promise<{ success: boolean; error: Error | null }> {
    try {
      // @ts-ignore - Suppress Supabase type recursion error
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'profile_match',
          title: matchType === 'property' ? 'Nieuwe woning match!' : 'Nieuwe huurder match!',
          message: `We hebben een ${Math.round(matchScore * 100)}% match gevonden voor je.`,
          related_id: matchId,
          is_read: false,
        });

      if (error) {
        return { success: false, error: new Error(error.message) };
      }

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }
}

// Export singleton instance
export const matchingService = new MatchingService();
