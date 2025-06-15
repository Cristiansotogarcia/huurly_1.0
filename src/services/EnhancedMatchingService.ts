
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface EnhancedMatchCriteria {
  // Financial criteria
  maxBudget: number;
  minBudget: number;
  totalGuaranteedIncome: number;
  hasGuarantor: boolean;
  
  // Location criteria
  preferredCities: string[];
  maxCommuteTime?: number;
  
  // Property criteria
  bedrooms: number;
  propertyTypes: string[];
  furnished?: boolean;
  parkingRequired?: boolean;
  
  // Lifestyle criteria
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  workFromHome?: boolean;
  
  // Timing criteria
  moveInDatePreferred?: string;
  moveInDateEarliest?: string;
  availabilityFlexible?: boolean;
  leaseDurationPreference?: string;
  
  // Documentation
  hasIncomeProof: boolean;
  hasReferences: boolean;
  rentalHistoryYears: number;
}

export interface EnhancedPropertyMatch {
  property: any;
  tenant: any;
  matchScore: number;
  matchReasons: string[];
  riskFactors: string[];
  landlordConfidence: number;
  compatibility: {
    financial: number;
    location: number;
    lifestyle: number;
    timing: number;
    documentation: number;
  };
}

export interface EnhancedTenantMatch {
  tenant: any;
  property: any;
  matchScore: number;
  matchReasons: string[];
  strengths: string[];
  tenantQuality: number;
  compatibility: {
    financial: number;
    location: number;
    lifestyle: number;
    timing: number;
    documentation: number;
  };
}

export class EnhancedMatchingService {
  /**
   * Find enhanced matching properties for a tenant with improved scoring
   */
  async findEnhancedMatchingProperties(
    tenantId: string,
    limit: number = 20
  ): Promise<{ data: EnhancedPropertyMatch[] | null; error: Error | null; success: boolean }> {
    try {
      // Get enhanced tenant profile with new fields
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenant_profiles')
        .select(`
          *,
          computed_age,
          total_guaranteed_income
        `)
        .eq('user_id', tenantId)
        .single();

      if (tenantError || !tenantData) {
        return {
          data: null,
          error: new Error('Enhanced tenant profile not found'),
          success: false,
        };
      }

      // Get active properties
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'active');

      if (propertiesError) {
        return {
          data: null,
          error: new Error('Error fetching properties'),
          success: false,
        };
      }

      // Calculate enhanced matches
      const matches: EnhancedPropertyMatch[] = [];

      for (const property of properties || []) {
        const matchResult = this.calculateEnhancedPropertyMatch(tenantData, property);
        
        // Only include high-quality matches (above 40%)
        if (matchResult.matchScore > 0.4) {
          matches.push(matchResult);
        }
      }

      // Sort by match score and landlord confidence
      matches.sort((a, b) => {
        const scoreA = a.matchScore * 0.7 + a.landlordConfidence * 0.3;
        const scoreB = b.matchScore * 0.7 + b.landlordConfidence * 0.3;
        return scoreB - scoreA;
      });

      return { 
        data: matches.slice(0, limit), 
        error: null, 
        success: true 
      };
    } catch (error) {
      logger.error('Error in enhanced property matching:', error);
      return {
        data: null,
        error: error as Error,
        success: false,
      };
    }
  }

  /**
   * Find enhanced matching tenants for a property with improved scoring
   */
  async findEnhancedMatchingTenants(
    propertyId: string,
    limit: number = 20
  ): Promise<{ data: EnhancedTenantMatch[] | null; error: Error | null; success: boolean }> {
    try {
      // Get property data
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (propertyError || !property) {
        return {
          data: null,
          error: new Error('Property not found'),
          success: false,
        };
      }

      // Get active tenant profiles with enhanced fields
      const { data: tenants, error: tenantsError } = await supabase
        .from('tenant_profiles')
        .select(`
          *,
          computed_age,
          total_guaranteed_income
        `)
        .eq('profile_completed', true);

      if (tenantsError) {
        return {
          data: null,
          error: new Error('Error fetching tenant profiles'),
          success: false,
        };
      }

      // Calculate enhanced matches
      const matches: EnhancedTenantMatch[] = [];

      for (const tenant of tenants || []) {
        const matchResult = this.calculateEnhancedTenantMatch(property, tenant);
        
        // Only include high-quality matches (above 40%)
        if (matchResult.matchScore > 0.4) {
          matches.push(matchResult);
        }
      }

      // Sort by match score and tenant quality
      matches.sort((a, b) => {
        const scoreA = a.matchScore * 0.6 + a.tenantQuality * 0.4;
        const scoreB = b.matchScore * 0.6 + b.tenantQuality * 0.4;
        return scoreB - scoreA;
      });

      return { 
        data: matches.slice(0, limit), 
        error: null, 
        success: true 
      };
    } catch (error) {
      logger.error('Error in enhanced tenant matching:', error);
      return {
        data: null,
        error: error as Error,
        success: false,
      };
    }
  }

  /**
   * Calculate enhanced property match with new fields
   */
  private calculateEnhancedPropertyMatch(tenant: any, property: any): EnhancedPropertyMatch {
    const compatibility = {
      financial: 0,
      location: 0,
      lifestyle: 0,
      timing: 0,
      documentation: 0,
    };

    const matchReasons: string[] = [];
    const riskFactors: string[] = [];

    // FINANCIAL COMPATIBILITY (35% weight)
    const propertyRent = property.rent_amount || 0;
    const tenantMaxBudget = tenant.max_budget || 0;
    const totalGuaranteedIncome = tenant.total_guaranteed_income || tenant.monthly_income || 0;
    
    // Income-to-rent ratio analysis
    const incomeRatio = totalGuaranteedIncome > 0 ? propertyRent / totalGuaranteedIncome : 0;
    
    if (propertyRent <= tenantMaxBudget) {
      if (incomeRatio <= 0.3) {
        compatibility.financial = 1.0;
        matchReasons.push('Excellente betaalbaarheid (< 30% van inkomen)');
      } else if (incomeRatio <= 0.4) {
        compatibility.financial = 0.8;
        matchReasons.push('Goede betaalbaarheid (< 40% van inkomen)');
      } else if (incomeRatio <= 0.5) {
        compatibility.financial = 0.6;
        matchReasons.push('Acceptabele betaalbaarheid');
      } else {
        compatibility.financial = 0.3;
        riskFactors.push('Hoge huur-inkomen ratio (> 50%)');
      }
    } else {
      compatibility.financial = 0.1;
      riskFactors.push('Huur boven maximum budget');
    }

    // Guarantor bonus
    if (tenant.guarantor_available && tenant.guarantor_income > 0) {
      compatibility.financial = Math.min(1.0, compatibility.financial + 0.2);
      matchReasons.push('Borg beschikbaar');
    }

    // Income proof available
    if (tenant.income_proof_available) {
      compatibility.financial = Math.min(1.0, compatibility.financial + 0.1);
      matchReasons.push('Inkomensbewijzen beschikbaar');
    }

    // LOCATION COMPATIBILITY (25% weight)
    if (tenant.preferred_city && property.city) {
      if (tenant.preferred_city.toLowerCase() === property.city.toLowerCase()) {
        compatibility.location = 1.0;
        matchReasons.push('Gewenste locatie');
      } else {
        compatibility.location = 0.2;
      }
    }

    // LIFESTYLE COMPATIBILITY (20% weight)
    let lifestyleScore = 0;
    let lifestyleCount = 0;

    // Bedrooms match
    if (tenant.preferred_bedrooms && property.bedrooms) {
      lifestyleCount++;
      if (tenant.preferred_bedrooms === property.bedrooms) {
        lifestyleScore += 1;
        matchReasons.push(`${property.bedrooms} slaapkamers`);
      } else if (Math.abs(tenant.preferred_bedrooms - property.bedrooms) === 1) {
        lifestyleScore += 0.7;
      }
    }

    // Property type match
    if (tenant.preferred_property_type && property.property_type) {
      lifestyleCount++;
      if (tenant.preferred_property_type === property.property_type) {
        lifestyleScore += 1;
        matchReasons.push(`${property.property_type}`);
      }
    }

    // Furnished preference
    if (tenant.furnished_preference && property.furnished !== null) {
      lifestyleCount++;
      const tenantWantsFurnished = tenant.furnished_preference === 'gemeubileerd';
      if (tenantWantsFurnished === property.furnished) {
        lifestyleScore += 1;
        if (property.furnished) matchReasons.push('Gemeubileerd');
      } else if (tenant.furnished_preference === 'geen_voorkeur') {
        lifestyleScore += 0.8;
      }
    }

    // Parking requirement
    if (tenant.parking_required && !property.parking_available) {
      riskFactors.push('Parkeren gewenst maar niet beschikbaar');
    } else if (tenant.parking_required && property.parking_available) {
      matchReasons.push('Parkeerplaats beschikbaar');
      lifestyleScore += 1;
      lifestyleCount++;
    }

    // Pets compatibility
    if (tenant.has_pets && !property.pets_allowed) {
      riskFactors.push('Huisdieren niet toegestaan');
      lifestyleScore -= 0.5;
    } else if (tenant.has_pets && property.pets_allowed) {
      matchReasons.push('Huisdieren toegestaan');
      lifestyleScore += 1;
      lifestyleCount++;
    }

    // Smoking compatibility
    if (tenant.smokes && !property.smoking_allowed) {
      riskFactors.push('Roken niet toegestaan');
      lifestyleScore -= 0.3;
    } else if (tenant.smokes && property.smoking_allowed) {
      matchReasons.push('Roken toegestaan');
      lifestyleScore += 1;
      lifestyleCount++;
    }

    // Work from home space needs
    if (tenant.work_from_home && property.bedrooms >= 2) {
      matchReasons.push('Geschikt voor thuiswerken');
      lifestyleScore += 0.5;
      lifestyleCount++;
    }

    compatibility.lifestyle = lifestyleCount > 0 ? Math.max(0, lifestyleScore / lifestyleCount) : 0.5;

    // TIMING COMPATIBILITY (15% weight)
    if (tenant.move_in_date_preferred && property.available_from) {
      const preferredDate = new Date(tenant.move_in_date_preferred);
      const availableDate = new Date(property.available_from);
      const daysDiff = Math.abs((preferredDate.getTime() - availableDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 7) {
        compatibility.timing = 1.0;
        matchReasons.push('Perfecte timing match');
      } else if (daysDiff <= 30) {
        compatibility.timing = 0.8;
        matchReasons.push('Goede timing match');
      } else if (daysDiff <= 60) {
        compatibility.timing = 0.6;
      } else {
        compatibility.timing = 0.3;
      }
    } else {
      compatibility.timing = tenant.availability_flexible ? 0.8 : 0.5;
    }

    if (tenant.availability_flexible) {
      compatibility.timing = Math.min(1.0, compatibility.timing + 0.2);
      matchReasons.push('Flexibele intrekdatum');
    }

    // DOCUMENTATION COMPATIBILITY (5% weight)
    let docScore = 0;
    
    if (tenant.income_proof_available) docScore += 0.4;
    if (tenant.references_available) docScore += 0.3;
    if (tenant.rental_history_years >= 2) {
      docScore += 0.3;
      matchReasons.push(`${tenant.rental_history_years} jaar huurervaring`);
    }
    
    compatibility.documentation = docScore;

    // Calculate overall match score
    const matchScore = (
      compatibility.financial * 0.35 +
      compatibility.location * 0.25 +
      compatibility.lifestyle * 0.20 +
      compatibility.timing * 0.15 +
      compatibility.documentation * 0.05
    );

    // Calculate landlord confidence score
    let landlordConfidence = 0.5;
    
    // Financial stability indicators
    if (tenant.guarantor_available) landlordConfidence += 0.2;
    if (tenant.income_proof_available) landlordConfidence += 0.1;
    if (tenant.employment_status === 'vast_contract') landlordConfidence += 0.15;
    if (tenant.rental_history_years >= 3) landlordConfidence += 0.1;
    if (tenant.references_available) landlordConfidence += 0.05;
    
    // Risk factors reduce confidence
    if (riskFactors.length > 0) {
      landlordConfidence -= riskFactors.length * 0.1;
    }
    
    landlordConfidence = Math.max(0, Math.min(1, landlordConfidence));

    return {
      property,
      tenant,
      matchScore,
      matchReasons,
      riskFactors,
      landlordConfidence,
      compatibility,
    };
  }

  /**
   * Calculate enhanced tenant match for a property
   */
  private calculateEnhancedTenantMatch(property: any, tenant: any): EnhancedTenantMatch {
    const compatibility = {
      financial: 0,
      location: 0,
      lifestyle: 0,
      timing: 0,
      documentation: 0,
    };

    const matchReasons: string[] = [];
    const strengths: string[] = [];

    // Reuse the property match calculation logic but flip perspective
    const propertyMatch = this.calculateEnhancedPropertyMatch(tenant, property);
    
    // Copy compatibility scores
    compatibility.financial = propertyMatch.compatibility.financial;
    compatibility.location = propertyMatch.compatibility.location;
    compatibility.lifestyle = propertyMatch.compatibility.lifestyle;
    compatibility.timing = propertyMatch.compatibility.timing;
    compatibility.documentation = propertyMatch.compatibility.documentation;

    // Tenant-specific match reasons
    if (tenant.total_guaranteed_income >= property.rent_amount * 3) {
      strengths.push('Sterk financieel profiel');
    }
    
    if (tenant.guarantor_available) {
      strengths.push('Borg beschikbaar');
    }
    
    if (tenant.employment_status === 'vast_contract') {
      strengths.push('Vast contract');
    }
    
    if (tenant.rental_history_years >= 3) {
      strengths.push('Ervaren huurder');
    }
    
    if (tenant.references_available) {
      strengths.push('Referenties beschikbaar');
    }

    // Calculate tenant quality score
    let tenantQuality = 0.5;
    
    // Financial quality
    const incomeRatio = tenant.total_guaranteed_income > 0 ? 
      property.rent_amount / tenant.total_guaranteed_income : 0;
    
    if (incomeRatio <= 0.3) tenantQuality += 0.3;
    else if (incomeRatio <= 0.4) tenantQuality += 0.2;
    else if (incomeRatio <= 0.5) tenantQuality += 0.1;
    
    // Employment quality
    if (tenant.employment_status === 'vast_contract') tenantQuality += 0.2;
    else if (tenant.employment_status === 'tijdelijk_contract') tenantQuality += 0.1;
    
    // Experience quality
    if (tenant.rental_history_years >= 5) tenantQuality += 0.15;
    else if (tenant.rental_history_years >= 2) tenantQuality += 0.1;
    
    // Documentation quality
    if (tenant.income_proof_available) tenantQuality += 0.05;
    if (tenant.references_available) tenantQuality += 0.05;
    
    // Guarantor bonus
    if (tenant.guarantor_available) tenantQuality += 0.15;
    
    tenantQuality = Math.min(1, tenantQuality);

    const matchScore = propertyMatch.matchScore;
    
    // Combine match reasons from property perspective
    matchReasons.push(...propertyMatch.matchReasons);

    return {
      tenant,
      property,
      matchScore,
      matchReasons,
      strengths,
      tenantQuality,
      compatibility,
    };
  }

  /**
   * Get enhanced matching statistics
   */
  async getEnhancedMatchingStatistics(): Promise<{ data: any | null; error: Error | null; success: boolean }> {
    try {
      // Get counts of profiles with new fields
      const { data: completedProfiles } = await supabase
        .from('tenant_profiles')
        .select('id, guarantor_available, income_proof_available, references_available')
        .eq('profile_completed', true);

      const { data: activeProperties } = await supabase
        .from('properties')
        .select('id')
        .eq('status', 'active');

      const totalTenants = completedProfiles?.length || 0;
      const totalProperties = activeProperties?.length || 0;
      
      // Calculate quality metrics
      const tenantsWithGuarantor = completedProfiles?.filter(p => p.guarantor_available).length || 0;
      const tenantsWithIncomeProof = completedProfiles?.filter(p => p.income_proof_available).length || 0;
      const tenantsWithReferences = completedProfiles?.filter(p => p.references_available).length || 0;

      const statistics = {
        totalActiveTenants: totalTenants,
        totalActiveProperties: totalProperties,
        potentialMatches: totalTenants * totalProperties,
        
        // Quality metrics
        tenantsWithGuarantor,
        guarantorPercentage: totalTenants > 0 ? Math.round((tenantsWithGuarantor / totalTenants) * 100) : 0,
        tenantsWithIncomeProof,
        incomeProofPercentage: totalTenants > 0 ? Math.round((tenantsWithIncomeProof / totalTenants) * 100) : 0,
        tenantsWithReferences,
        referencesPercentage: totalTenants > 0 ? Math.round((tenantsWithReferences / totalTenants) * 100) : 0,
        
        // Estimated high-quality matches (conservative estimate)
        estimatedHighQualityMatches: Math.round(totalTenants * totalProperties * 0.15),
        averageMatchesPerProperty: totalTenants,
        averageMatchesPerTenant: totalProperties,
      };

      return { 
        data: statistics, 
        error: null, 
        success: true 
      };
    } catch (error) {
      logger.error('Error getting enhanced matching statistics:', error);
      return {
        data: null,
        error: error as Error,
        success: false,
      };
    }
  }
}

// Export singleton instance
export const enhancedMatchingService = new EnhancedMatchingService();
