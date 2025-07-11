import { BaseEntity, Address, Image, Money, ContactInfo } from '../../shared/types/common';

// Property-related enums
export enum PropertyType {
  APARTMENT = 'apartment',
  HOUSE = 'house',
  STUDIO = 'studio',
  ROOM = 'room',
  LOFT = 'loft',
  PENTHOUSE = 'penthouse'
}

export enum PropertyStatus {
  AVAILABLE = 'available',
  RENTED = 'rented',
  PENDING = 'pending',
  MAINTENANCE = 'maintenance',
  DRAFT = 'draft',
  ARCHIVED = 'archived'
}

export enum FurnishingType {
  FURNISHED = 'furnished',
  SEMI_FURNISHED = 'semi_furnished',
  UNFURNISHED = 'unfurnished'
}

export enum EnergyLabel {
  A_PLUS_PLUS_PLUS = 'A+++',
  A_PLUS_PLUS = 'A++',
  A_PLUS = 'A+',
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
  G = 'G'
}

export enum HeatingType {
  CENTRAL = 'central',
  DISTRICT = 'district',
  GAS = 'gas',
  ELECTRIC = 'electric',
  HEAT_PUMP = 'heat_pump',
  SOLAR = 'solar'
}

// Property interfaces
export interface PropertyAmenity {
  id: string;
  name: string;
  category: 'basic' | 'comfort' | 'luxury' | 'outdoor' | 'safety';
  icon?: string;
}

export interface PropertyFeatures {
  bedrooms: number;
  bathrooms: number;
  living_area: number; // in square meters
  total_area?: number;
  balcony?: boolean;
  balcony_area?: number;
  garden?: boolean;
  garden_area?: number;
  parking?: boolean;
  parking_spaces?: number;
  storage?: boolean;
  elevator?: boolean;
  accessibility?: boolean;
}

export interface PropertyUtilities {
  heating_type: HeatingType;
  energy_label?: EnergyLabel;
  gas_included: boolean;
  water_included: boolean;
  electricity_included: boolean;
  internet_included: boolean;
  tv_included: boolean;
  cleaning_included: boolean;
}

export interface PropertyRules {
  pets_allowed: boolean;
  smoking_allowed: boolean;
  students_allowed: boolean;
  professionals_only: boolean;
  couples_allowed: boolean;
  children_allowed: boolean;
  parties_allowed: boolean;
  max_occupants?: number;
  minimum_age?: number;
  maximum_age?: number;
}

export interface PropertyLandlord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  company?: string;
  verified: boolean;
  response_rate?: number;
  response_time?: string; // e.g., "within 1 hour"
  languages?: string[];
}

export interface PropertyLocation extends Address {
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  neighborhood?: string;
  district?: string;
  public_transport?: {
    nearest_station?: string;
    distance_to_station?: number; // in meters
    lines?: string[];
  };
  nearby_amenities?: {
    supermarket?: number; // distance in meters
    school?: number;
    hospital?: number;
    park?: number;
    restaurant?: number;
  };
}

export interface PropertyPricing {
  monthly_rent: Money;
  deposit: Money;
  service_costs?: Money;
  utilities_estimate?: Money;
  total_monthly_cost: Money;
  price_per_sqm?: number;
  additional_costs?: Array<{
    name: string;
    amount: Money;
    required: boolean;
  }>;
}

export interface PropertyAvailability {
  available_from: string; // ISO date string
  available_until?: string; // ISO date string
  minimum_rental_period?: number; // in months
  maximum_rental_period?: number; // in months
  flexible_dates: boolean;
  immediate_availability: boolean;
}

export interface PropertyMedia {
  images: Image[];
  virtual_tour_url?: string;
  video_url?: string;
  floor_plan?: Image;
  documents?: Array<{
    id: string;
    name: string;
    type: 'contract' | 'rules' | 'energy_certificate' | 'other';
    url: string;
    size: number;
  }>;
}

export interface PropertyStatistics {
  views: number;
  favorites: number;
  applications: number;
  view_history?: Array<{
    date: string;
    views: number;
  }>;
  conversion_rate?: number;
  average_response_time?: number;
}

// Main Property interface
export interface Property extends BaseEntity {
  title: string;
  description: string;
  type: PropertyType;
  status: PropertyStatus;
  furnishing: FurnishingType;
  
  // Location and contact
  location: PropertyLocation;
  landlord: PropertyLandlord;
  
  // Property details
  features: PropertyFeatures;
  amenities: PropertyAmenity[];
  utilities: PropertyUtilities;
  rules: PropertyRules;
  
  // Pricing and availability
  pricing: PropertyPricing;
  availability: PropertyAvailability;
  
  // Media and content
  media: PropertyMedia;
  
  // Metadata
  statistics?: PropertyStatistics;
  featured: boolean;
  verified: boolean;
  last_updated: string;
  
  // SEO and search
  slug?: string;
  tags?: string[];
  search_keywords?: string[];
}

// Property creation and update interfaces
export interface CreatePropertyData {
  title: string;
  description: string;
  type: PropertyType;
  furnishing: FurnishingType;
  location: Omit<PropertyLocation, 'coordinates'>;
  features: PropertyFeatures;
  amenities: string[]; // amenity IDs
  utilities: PropertyUtilities;
  rules: PropertyRules;
  pricing: PropertyPricing;
  availability: PropertyAvailability;
  images: File[];
  virtual_tour_url?: string;
  video_url?: string;
  floor_plan?: File;
}

export interface UpdatePropertyData extends Partial<CreatePropertyData> {
  id: string;
  status?: PropertyStatus;
  featured?: boolean;
}

// Property search and filtering
export interface PropertySearchFilters {
  location?: {
    city?: string;
    neighborhood?: string;
    radius?: number; // in km
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  price_range?: {
    min?: number;
    max?: number;
  };
  property_type?: PropertyType[];
  furnishing?: FurnishingType[];
  features?: {
    min_bedrooms?: number;
    max_bedrooms?: number;
    min_bathrooms?: number;
    min_area?: number;
    max_area?: number;
    balcony?: boolean;
    garden?: boolean;
    parking?: boolean;
    elevator?: boolean;
  };
  amenities?: string[]; // amenity IDs
  availability?: {
    available_from?: string;
    available_until?: string;
    immediate?: boolean;
  };
  rules?: {
    pets_allowed?: boolean;
    smoking_allowed?: boolean;
    students_allowed?: boolean;
  };
  utilities?: {
    gas_included?: boolean;
    water_included?: boolean;
    electricity_included?: boolean;
    internet_included?: boolean;
  };
  verified_only?: boolean;
  featured_only?: boolean;
}

export interface PropertySearchOptions {
  sort_by?: 'price_asc' | 'price_desc' | 'date_desc' | 'date_asc' | 'relevance' | 'distance';
  page?: number;
  limit?: number;
  include_statistics?: boolean;
}

export interface PropertySearchResult {
  properties: Property[];
  total_count: number;
  page: number;
  limit: number;
  has_more: boolean;
  filters_applied: PropertySearchFilters;
  suggested_filters?: Partial<PropertySearchFilters>;
}

// Property list view options
export interface PropertyListViewOptions {
  view_mode: 'grid' | 'list' | 'map';
  show_favorites: boolean;
  show_contact_info: boolean;
  show_statistics: boolean;
}

// Property comparison
export interface PropertyComparison {
  properties: Property[];
  comparison_fields: Array<{
    field: keyof Property;
    label: string;
    type: 'text' | 'number' | 'boolean' | 'array' | 'object';
  }>;
}

// Property analytics
export interface PropertyAnalytics {
  property_id: string;
  period: {
    start: string;
    end: string;
  };
  metrics: {
    total_views: number;
    unique_views: number;
    favorites_added: number;
    applications_received: number;
    contact_requests: number;
    conversion_rate: number;
  };
  demographics?: {
    age_groups: Record<string, number>;
    income_ranges: Record<string, number>;
    locations: Record<string, number>;
  };
  performance_score?: number;
  recommendations?: string[];
}

// Export utility types
export type PropertyFormData = CreatePropertyData;
export type PropertyUpdateFormData = UpdatePropertyData;
export type PropertyFilters = PropertySearchFilters;
export type PropertySortOption = PropertySearchOptions['sort_by'];