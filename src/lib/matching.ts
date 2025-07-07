export interface LifestyleFilters {
  huisdieren?: boolean;
  roken?: boolean;
}

export interface SearchCriteria {
  city?: string;
  minBudget?: number;
  maxBudget?: number;
  lifestyle?: LifestyleFilters;
}

export interface CompatibilityResult {
  location: number;
  budget: number;
  lifestyle: number;
  total: number;
}

export function computeCompatibility(tenant: any, criteria: SearchCriteria): CompatibilityResult {
  let location = 0;
  if (criteria.city && Array.isArray(tenant.locatie_voorkeur)) {
    location = tenant.locatie_voorkeur.includes(criteria.city) ? 100 : 0;
  }

  let budget = 0;
  if (criteria.minBudget !== undefined || criteria.maxBudget !== undefined) {
    const max = tenant.max_huur ?? 0;
    if (
      (criteria.minBudget === undefined || max >= criteria.minBudget) &&
      (criteria.maxBudget === undefined || max <= criteria.maxBudget)
    ) {
      budget = 100;
    } else if (criteria.maxBudget) {
      const diff = Math.abs(max - criteria.maxBudget);
      budget = Math.max(0, 100 - diff / criteria.maxBudget * 100);
    }
  }

  let lifestyleCount = 0;
  let lifestyleScore = 0;
  if (criteria.lifestyle) {
    if (criteria.lifestyle.huisdieren !== undefined) {
      lifestyleCount++;
      if (tenant.huisdieren === criteria.lifestyle.huisdieren) lifestyleScore++;
    }
    if (criteria.lifestyle.roken !== undefined) {
      lifestyleCount++;
      if (tenant.roken === criteria.lifestyle.roken) lifestyleScore++;
    }
  }
  const lifestyle = lifestyleCount ? (lifestyleScore / lifestyleCount) * 100 : 0;

  const total = (location + budget + lifestyle) / 3;
  return {
    location: Math.round(location),
    budget: Math.round(budget),
    lifestyle: Math.round(lifestyle),
    total: Math.round(total)
  };
}
