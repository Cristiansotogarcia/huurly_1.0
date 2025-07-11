import { supabase } from '@/integrations/supabase/client';
import { BaseService, ServiceResponse, ValidationError, PermissionError } from './BaseService';
import { Property } from '@/types';
import { isLandlord, hasRole } from '@/utils/roleUtils';
import { ValidationPresets } from '@/utils/validationUtils';

// Property creation data interface (matches database schema)
export interface PropertyCreateData {
  titel: string;
  beschrijving?: string;
  adres: string;
  stad: string;
  huurprijs: number;
  aantal_slaapkamers?: number;
  woning_type?: string;
  foto_urls?: string[];
  beschikbaar_vanaf?: string;
  aantal_kamers?: number;
  oppervlakte?: number;
  postcode?: string;
  provincie?: string;
  meubilering?: string;
  voorzieningen?: string[];
}

// Helper function to convert database row to Property interface
function mapDatabaseToProperty(dbRow: any): Property {
  return {
    id: dbRow.id,
    landlordId: dbRow.verhuurder_id,
    title: dbRow.titel,
    description: dbRow.beschrijving || '',
    address: dbRow.adres,
    city: dbRow.stad,
    rent: dbRow.huurprijs,
    bedrooms: dbRow.aantal_slaapkamers || 0,
    propertyType: dbRow.woning_type || '',
    images: dbRow.foto_urls || [],
    requirements: {
      minIncome: 0,
      allowPets: false
    },
    isActive: dbRow.is_actief ?? true,
    availableFrom: dbRow.beschikbaar_vanaf,
    furnished: dbRow.meubilering === 'gemeubileerd',
    parkingAvailable: false,
    smokingAllowed: false,
    petsAllowed: false
  };
}

export interface PropertySearchFilters {
  stad?: string;
  minHuurprijs?: number;
  maxHuurprijs?: number;
  woningType?: string;
  minOppervlakte?: number;
  maxOppervlakte?: number;
}


export class PropertyService extends BaseService {
  constructor() {
    super('PropertyService');
  }
  async createProperty(data: PropertyCreateData): Promise<ServiceResponse<Property>> {
    return this.executeAuthenticatedOperation(async (currentUserId) => {
      // Validate user role
      const { data: gebruiker } = await supabase
        .from('gebruikers')
        .select('rol')
        .eq('id', currentUserId)
        .single();

      if (!gebruiker || !isLandlord(gebruiker.rol)) {
        throw new PermissionError('Alleen verhuurders kunnen woningen aanmaken');
      }

      // Validate input data
      const validationErrors: string[] = [];
      
      if (!data.titel) {
        validationErrors.push('Titel is verplicht');
      } else {
        const titelValidation = ValidationPresets.property.titel(data.titel);
        if (!titelValidation.isValid) validationErrors.push(titelValidation.error!);
      }
      
      if (!data.adres) {
        validationErrors.push('Adres is verplicht');
      } else {
        const adresValidation = ValidationPresets.property.adres(data.adres);
        if (!adresValidation.isValid) validationErrors.push(adresValidation.error!);
      }
      
      if (!data.stad) {
        validationErrors.push('Stad is verplicht');
      } else {
        const stadValidation = ValidationPresets.property.stad(data.stad);
        if (!stadValidation.isValid) validationErrors.push(stadValidation.error!);
      }
      
      if (!data.huurprijs) {
        validationErrors.push('Huurprijs is verplicht');
      } else {
        const prijsValidation = ValidationPresets.property.huurprijs(data.huurprijs);
        if (!prijsValidation.isValid) validationErrors.push(prijsValidation.error!);
      }
      
      if (validationErrors.length > 0) {
        throw new ValidationError(validationErrors.join(', '));
      }

      const propertyData = {
        verhuurder_id: currentUserId,
        titel: data.titel,
        beschrijving: data.beschrijving || null,
        adres: data.adres,
        stad: data.stad,
        provincie: data.provincie || null,
        postcode: data.postcode || null,
        huurprijs: data.huurprijs,
        oppervlakte: data.oppervlakte || null,
        aantal_kamers: data.aantal_kamers || null,
        aantal_slaapkamers: data.aantal_slaapkamers || null,
        woning_type: data.woning_type || 'appartement',
        meubilering: data.meubilering || 'gemeubileerd',
        voorzieningen: data.voorzieningen || [],
        beschikbaar_vanaf: data.beschikbaar_vanaf || null,
        foto_urls: data.foto_urls || [],
        status: 'actief' as const,
        is_actief: true,
        aangemaakt_op: new Date().toISOString(),
        bijgewerkt_op: new Date().toISOString(),
      };

      const { data: property, error } = await supabase
        .from('woningen')
        .insert(propertyData)
        .select()
        .single();

      if (error) {
        throw this.handleDatabaseError(error);
      }

      await this.createStandardAuditLog('PROPERTY_CREATE', 'woningen', property.id, null, property, currentUserId);

      return mapDatabaseToProperty(property);
    }, 'createProperty', data.titel);
  }

  async getProperties(landlordId?: string): Promise<ServiceResponse<Property[]>> {
    return this.executeAuthenticatedOperation(async (currentUserId) => {
      const targetUserId = landlordId || currentUserId;

      let query = supabase.from('woningen').select('*').order('aangemaakt_op', { ascending: false });

      if (landlordId) {
        query = query.eq('verhuurder_id', landlordId);
      } else {
        query = query.eq('verhuurder_id', currentUserId);
      }

      const { data, error } = await query;

      if (error) {
        throw this.handleDatabaseError(error);
      }

      return (data || []).map(mapDatabaseToProperty);
    }, 'getProperties', landlordId || 'current user');
  }

  async searchProperties(filters: PropertySearchFilters): Promise<ServiceResponse<Property[]>> {
    return this.executeServiceOperation(async () => {
      let query = supabase
        .from('woningen')
        .select('*')
        .eq('is_actief', true)
        .eq('status', 'actief');

      if (filters.stad) {
        query = query.ilike('stad', `%${filters.stad}%`);
      }

      if (filters.minHuurprijs) {
        query = query.gte('huurprijs', filters.minHuurprijs);
      }

      if (filters.maxHuurprijs) {
        query = query.lte('huurprijs', filters.maxHuurprijs);
      }

      if (filters.woningType) {
        query = query.eq('woning_type', filters.woningType);
      }

      if (filters.minOppervlakte) {
        query = query.gte('oppervlakte', filters.minOppervlakte);
      }

      if (filters.maxOppervlakte) {
        query = query.lte('oppervlakte', filters.maxOppervlakte);
      }

      query = query.order('aangemaakt_op', { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw this.handleDatabaseError(error);
      }

      return (data || []).map(mapDatabaseToProperty);
    }, { operation: 'searchProperties', metadata: filters });
  }

  async updateProperty(id: string, data: Partial<PropertyCreateData>): Promise<ServiceResponse<Property>> {
    return this.executeAuthenticatedOperation(async (currentUserId) => {
      // Validate user role
      const { data: gebruiker } = await supabase
        .from('gebruikers')
        .select('rol')
        .eq('id', currentUserId)
        .single();

      if (!gebruiker || !isLandlord(gebruiker.rol)) {
        throw new PermissionError('Alleen verhuurders kunnen woningen bewerken');
      }

      const sanitizedData = this.sanitizeInput(data);

      const { data: property, error } = await supabase
        .from('woningen')
        .update({
          ...sanitizedData,
          bijgewerkt_op: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('verhuurder_id', currentUserId)
        .select()
        .single();

      if (error) {
        throw this.handleDatabaseError(error);
      }

      await this.createStandardAuditLog('PROPERTY_UPDATE', 'woningen', id, null, property, currentUserId);

      return mapDatabaseToProperty(property);
    }, 'updateProperty', id);
  }

  async deleteProperty(id: string): Promise<ServiceResponse<boolean>> {
    return this.executeAuthenticatedOperation(async (currentUserId) => {
      // Validate user role
      const { data: gebruiker } = await supabase
        .from('gebruikers')
        .select('rol')
        .eq('id', currentUserId)
        .single();

      if (!gebruiker || !isLandlord(gebruiker.rol)) {
        throw new PermissionError('Alleen verhuurders kunnen woningen verwijderen');
      }

      const { error } = await supabase
        .from('woningen')
        .delete()
        .eq('id', id)
        .eq('verhuurder_id', currentUserId);

      if (error) {
        throw this.handleDatabaseError(error);
      }

      await this.createStandardAuditLog('PROPERTY_DELETE', 'woningen', id, null, null, currentUserId);

      return true;
    }, 'deleteProperty', id);
  }

  async getPropertyCount(landlordId: string): Promise<ServiceResponse<number>> {
    return this.executeServiceOperation(async () => {
      const { count, error } = await supabase
        .from('woningen')
        .select('*', { count: 'exact', head: true })
        .eq('verhuurder_id', landlordId);

      if (error) {
        throw this.handleDatabaseError(error);
      }

      return count || 0;
    }, { operation: 'getPropertyCount', resourceId: landlordId });
  }

  async getPropertyApplications(propertyId: string): Promise<ServiceResponse<any[]>> {
    return this.executeAuthenticatedOperation(async (currentUserId) => {
      const { data, error } = await supabase
        .from('aanvragen')
        .select(`
          *,
          huurders (
            naam,
            email,
            profielfoto_url
          )
        `)
        .eq('woning_id', propertyId)
        .eq('verhuurder_id', currentUserId)
        .order('aangemaakt_op', { ascending: false });

      if (error) {
        throw this.handleDatabaseError(error);
      }

      return data || [];
    }, 'getPropertyApplications', propertyId);
  }

  async getPropertyById(propertyId: string): Promise<ServiceResponse<Property>> {
    return this.executeAuthenticatedOperation(async (currentUserId) => {
      const { data, error } = await supabase
        .from('woningen')
        .select('*')
        .eq('id', propertyId)
        .eq('verhuurder_id', currentUserId)
        .single();

      if (error) {
        throw this.handleDatabaseError(error);
      }

      return mapDatabaseToProperty(data);
    }, 'getPropertyById', propertyId);
  }

  async updatePropertyStatus(propertyId: string, status: 'actief' | 'inactief' | 'verhuurd'): Promise<ServiceResponse<Property>> {
    return this.executeAuthenticatedOperation(async (currentUserId) => {
      const { data, error } = await supabase
        .from('woningen')
        .update({
          status,
          bijgewerkt_op: new Date().toISOString(),
        })
        .eq('id', propertyId)
        .eq('verhuurder_id', currentUserId)
        .select()
        .single();

      if (error) {
        throw this.handleDatabaseError(error);
      }

      await this.createStandardAuditLog('UPDATE', 'woningen', propertyId, {
        action: 'status_update',
        new_status: status
      });

      return mapDatabaseToProperty(data);
    }, 'updatePropertyStatus', propertyId);
  }
}

export const propertyService = new PropertyService();