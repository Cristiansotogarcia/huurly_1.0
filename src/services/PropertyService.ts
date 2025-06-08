import { supabase } from '@/integrations/supabase/client';
import { DatabaseService, DatabaseResponse, PaginationOptions, SortOptions } from '@/lib/database';
import { Property } from '@/types';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export interface CreatePropertyData {
  title: string;
  description: string;
  address: string;
  city: string;
  postalCode?: string;
  province?: string;
  rentAmount: number;
  bedrooms: number;
  bathrooms?: number;
  squareMeters?: number;
  propertyType?: string;
  furnished?: boolean;
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  availableFrom?: string;
  availableUntil?: string;
  maxOffers?: number;
}

export interface UpdatePropertyData {
  title?: string;
  description?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  province?: string;
  rentAmount?: number;
  bedrooms?: number;
  bathrooms?: number;
  squareMeters?: number;
  propertyType?: string;
  furnished?: boolean;
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  availableFrom?: string;
  availableUntil?: string;
  maxOffers?: number;
  status?: string;
}

export interface PropertyFilters {
  city?: string;
  province?: string;
  minRent?: number;
  maxRent?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
  furnished?: boolean;
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  availableFrom?: string;
  searchTerm?: string;
  landlordId?: string;
  status?: string;
}

export class PropertyService extends DatabaseService {
  /**
   * Create a new property
   */
  async createProperty(
    data: CreatePropertyData
  ): Promise<DatabaseResponse<Tables<'properties'>>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    // Check if user is a landlord
    const hasPermission = await this.checkUserPermission(currentUserId, ['Verhuurder', 'Beheerder']);
    if (!hasPermission) {
      return {
        data: null,
        error: new Error('Alleen verhuurders kunnen woningen toevoegen'),
        success: false,
      };
    }

    const sanitizedData = this.sanitizeInput(data);
    
    const validation = this.validateRequiredFields(sanitizedData, [
      'title', 'description', 'address', 'city', 'rentAmount', 'bedrooms'
    ]);
    if (!validation.isValid) {
      return {
        data: null,
        error: new Error(`Verplichte velden ontbreken: ${validation.missingFields.join(', ')}`),
        success: false,
      };
    }

    if (sanitizedData.rentAmount <= 0) {
      return {
        data: null,
        error: new Error('Huurprijs moet groter zijn dan 0'),
        success: false,
      };
    }

    if (sanitizedData.bedrooms <= 0) {
      return {
        data: null,
        error: new Error('Aantal slaapkamers moet groter zijn dan 0'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('properties')
        .insert({
          landlord_id: currentUserId,
          title: sanitizedData.title,
          description: sanitizedData.description,
          address: sanitizedData.address,
          city: sanitizedData.city,
          postal_code: sanitizedData.postalCode,
          province: sanitizedData.province,
          rent_amount: sanitizedData.rentAmount,
          bedrooms: sanitizedData.bedrooms,
          bathrooms: sanitizedData.bathrooms,
          square_meters: sanitizedData.squareMeters,
          property_type: sanitizedData.propertyType,
          furnished: sanitizedData.furnished,
          pets_allowed: sanitizedData.petsAllowed,
          smoking_allowed: sanitizedData.smokingAllowed,
          available_from: sanitizedData.availableFrom,
          available_until: sanitizedData.availableUntil,
          max_offers: sanitizedData.maxOffers || 10,
          status: 'active',
        })
        .select()
        .single();

      if (error) {
        throw this.handleDatabaseError(error);
      }

      await this.createAuditLog('CREATE', 'properties', data?.id, null, data);
      
      return { data, error: null };
    });
  }

  /**
   * Get property by ID
   */
  async getProperty(propertyId: string): Promise<DatabaseResponse<any>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images(image_url, image_order, is_primary),
          property_applications(id, status, applied_at, tenant_id),
          property_offers(id, status, offered_at, tenant_id)
        `)
        .eq('id', propertyId)
        .single();

      return { data, error };
    });
  }

  /**
   * Update property
   */
  async updateProperty(
    propertyId: string,
    updates: UpdatePropertyData
  ): Promise<DatabaseResponse<Tables<'properties'>>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    // Check if user owns this property or is admin
    const { data: property } = await supabase
      .from('properties')
      .select('landlord_id')
      .eq('id', propertyId)
      .single();

    if (!property) {
      return {
        data: null,
        error: new Error('Woning niet gevonden'),
        success: false,
      };
    }

    const hasPermission = await this.checkUserPermission(property.landlord_id, ['Beheerder']);
    if (!hasPermission) {
      return {
        data: null,
        error: new Error('Geen toegang tot deze woning'),
        success: false,
      };
    }

    const sanitizedData = this.sanitizeInput(updates);

    if (sanitizedData.rentAmount !== undefined && sanitizedData.rentAmount <= 0) {
      return {
        data: null,
        error: new Error('Huurprijs moet groter zijn dan 0'),
        success: false,
      };
    }

    if (sanitizedData.bedrooms !== undefined && sanitizedData.bedrooms <= 0) {
      return {
        data: null,
        error: new Error('Aantal slaapkamers moet groter zijn dan 0'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // Get current data for audit log
      const { data: currentData } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      const updateData: any = {};
      if (sanitizedData.title) updateData.title = sanitizedData.title;
      if (sanitizedData.description) updateData.description = sanitizedData.description;
      if (sanitizedData.address) updateData.address = sanitizedData.address;
      if (sanitizedData.city) updateData.city = sanitizedData.city;
      if (sanitizedData.postalCode) updateData.postal_code = sanitizedData.postalCode;
      if (sanitizedData.province) updateData.province = sanitizedData.province;
      if (sanitizedData.rentAmount) updateData.rent_amount = sanitizedData.rentAmount;
      if (sanitizedData.bedrooms) updateData.bedrooms = sanitizedData.bedrooms;
      if (sanitizedData.bathrooms !== undefined) updateData.bathrooms = sanitizedData.bathrooms;
      if (sanitizedData.squareMeters !== undefined) updateData.square_meters = sanitizedData.squareMeters;
      if (sanitizedData.propertyType) updateData.property_type = sanitizedData.propertyType;
      if (sanitizedData.furnished !== undefined) updateData.furnished = sanitizedData.furnished;
      if (sanitizedData.petsAllowed !== undefined) updateData.pets_allowed = sanitizedData.petsAllowed;
      if (sanitizedData.smokingAllowed !== undefined) updateData.smoking_allowed = sanitizedData.smokingAllowed;
      if (sanitizedData.availableFrom) updateData.available_from = sanitizedData.availableFrom;
      if (sanitizedData.availableUntil) updateData.available_until = sanitizedData.availableUntil;
      if (sanitizedData.maxOffers !== undefined) updateData.max_offers = sanitizedData.maxOffers;
      if (sanitizedData.status) updateData.status = sanitizedData.status;

      const { data, error } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', propertyId)
        .select()
        .single();

      if (error) {
        throw this.handleDatabaseError(error);
      }

      await this.createAuditLog('UPDATE', 'properties', propertyId, currentData, data);

      return { data, error: null };
    });
  }

  /**
   * Delete property
   */
  async deleteProperty(propertyId: string): Promise<DatabaseResponse<boolean>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    // Check if user owns this property or is admin
    const { data: property } = await supabase
      .from('properties')
      .select('landlord_id')
      .eq('id', propertyId)
      .single();

    if (!property) {
      return {
        data: null,
        error: new Error('Woning niet gevonden'),
        success: false,
      };
    }

    const hasPermission = await this.checkUserPermission(property.landlord_id, ['Beheerder']);
    if (!hasPermission) {
      return {
        data: null,
        error: new Error('Geen toegang tot deze woning'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // Get property data for audit log
      const { data: propertyData } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) {
        throw this.handleDatabaseError(error);
      }

      await this.createAuditLog('DELETE', 'properties', propertyId, propertyData);

      return { data: true, error: null };
    });
  }

  /**
   * Search properties with filters
   */
  async searchProperties(
    filters?: PropertyFilters,
    pagination?: PaginationOptions,
    sort?: SortOptions
  ): Promise<DatabaseResponse<any[]>> {
    return this.executeQuery(async () => {
      let query = supabase
        .from('properties')
        .select(`
          *,
          property_images(image_url, image_order, is_primary)
        `)
        .eq('status', 'active');

      // Apply filters
      if (filters?.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }

      if (filters?.province) {
        query = query.ilike('province', `%${filters.province}%`);
      }

      if (filters?.minRent) {
        query = query.gte('rent_amount', filters.minRent);
      }

      if (filters?.maxRent) {
        query = query.lte('rent_amount', filters.maxRent);
      }

      if (filters?.bedrooms) {
        query = query.eq('bedrooms', filters.bedrooms);
      }

      if (filters?.bathrooms) {
        query = query.eq('bathrooms', filters.bathrooms);
      }

      if (filters?.propertyType) {
        query = query.eq('property_type', filters.propertyType);
      }

      if (filters?.furnished !== undefined) {
        query = query.eq('furnished', filters.furnished);
      }

      if (filters?.petsAllowed !== undefined) {
        query = query.eq('pets_allowed', filters.petsAllowed);
      }

      if (filters?.smokingAllowed !== undefined) {
        query = query.eq('smoking_allowed', filters.smokingAllowed);
      }

      if (filters?.availableFrom) {
        query = query.gte('available_from', filters.availableFrom);
      }

      if (filters?.landlordId) {
        query = query.eq('landlord_id', filters.landlordId);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.searchTerm) {
        query = this.buildSearchQuery(
          query,
          filters.searchTerm,
          ['title', 'description', 'address', 'city']
        );
      }

      // Apply sorting
      query = this.applySorting(query, sort || { column: 'created_at', ascending: false });

      // Apply pagination
      query = this.applyPagination(query, pagination);

      const { data, error } = await query;

      return { data, error };
    });
  }

  /**
   * Get properties by landlord
   */
  async getPropertiesByLandlord(
    landlordId: string,
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

    // Check if user can access this landlord's properties
    const hasPermission = await this.checkUserPermission(landlordId, ['Beheerder']);
    if (!hasPermission) {
      return {
        data: null,
        error: new Error('Geen toegang tot deze woningen'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      let query = supabase
        .from('properties')
        .select(`
          *,
          property_images(image_url, image_order, is_primary),
          property_applications(id, status, applied_at),
          property_offers(id, status, offered_at)
        `)
        .eq('landlord_id', landlordId);

      // Apply sorting
      query = this.applySorting(query, sort || { column: 'created_at', ascending: false });

      // Apply pagination
      query = this.applyPagination(query, pagination);

      const { data, error } = await query;

      return { data, error };
    });
  }

  /**
   * Add property image
   */
  async addPropertyImage(
    propertyId: string,
    imageUrl: string,
    imageOrder?: number,
    isPrimary?: boolean
  ): Promise<DatabaseResponse<Tables<'property_images'>>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    // Check if user owns this property
    const { data: property } = await supabase
      .from('properties')
      .select('landlord_id')
      .eq('id', propertyId)
      .single();

    if (!property) {
      return {
        data: null,
        error: new Error('Woning niet gevonden'),
        success: false,
      };
    }

    const hasPermission = await this.checkUserPermission(property.landlord_id, ['Beheerder']);
    if (!hasPermission) {
      return {
        data: null,
        error: new Error('Geen toegang tot deze woning'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // If this is set as primary, unset other primary images
      if (isPrimary) {
        await supabase
          .from('property_images')
          .update({ is_primary: false })
          .eq('property_id', propertyId);
      }

      const { data, error } = await supabase
        .from('property_images')
        .insert({
          property_id: propertyId,
          image_url: imageUrl,
          image_order: imageOrder,
          is_primary: isPrimary || false,
        })
        .select()
        .single();

      if (error) {
        throw this.handleDatabaseError(error);
      }

      await this.createAuditLog('CREATE', 'property_images', data?.id, null, data);

      return { data, error: null };
    });
  }

  /**
   * Remove property image
   */
  async removePropertyImage(imageId: string): Promise<DatabaseResponse<boolean>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    // Get image data to check property ownership first
    const { data: image } = await supabase
      .from('property_images')
      .select('property_id, properties(landlord_id)')
      .eq('id', imageId)
      .single();

    if (!image) {
      return {
        data: null,
        error: new Error('Afbeelding niet gevonden'),
        success: false,
      };
    }

    const hasPermission = await this.checkUserPermission(
      (image as any).properties.landlord_id,
      ['Beheerder']
    );
    if (!hasPermission) {
      return {
        data: null,
        error: new Error('Geen toegang tot deze afbeelding'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const { error } = await supabase
        .from('property_images')
        .delete()
        .eq('id', imageId);

      if (error) {
        throw this.handleDatabaseError(error);
      }

      await this.createAuditLog('DELETE', 'property_images', imageId, image);

      return { data: true, error: null };
    });
  }

  /**
   * Get property statistics
   */
  async getPropertyStatistics(landlordId?: string): Promise<DatabaseResponse<any>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    // If landlordId is provided, check permissions
    if (landlordId) {
      const hasPermission = await this.checkUserPermission(landlordId, ['Beheerder']);
      if (!hasPermission) {
        return {
          data: null,
          error: new Error('Geen toegang tot deze statistieken'),
          success: false,
        };
      }
    }

    return this.executeQuery(async () => {
      let query = supabase.from('properties').select('status, rent_amount, bedrooms');

      if (landlordId) {
        query = query.eq('landlord_id', landlordId);
      }

      const { data: properties, error } = await query;

      if (error) {
        throw this.handleDatabaseError(error);
      }

      const statistics = {
        totalProperties: properties?.length || 0,
        activeProperties: properties?.filter(p => p.status === 'active').length || 0,
        inactiveProperties: properties?.filter(p => p.status === 'inactive').length || 0,
        averageRent: properties?.length 
          ? properties.reduce((sum, p) => sum + p.rent_amount, 0) / properties.length 
          : 0,
        propertiesByBedrooms: properties?.reduce((acc: any, p: any) => {
          acc[p.bedrooms] = (acc[p.bedrooms] || 0) + 1;
          return acc;
        }, {}),
      };

      return { data: statistics, error: null };
    });
  }
}

// Export singleton instance
export const propertyService = new PropertyService();
