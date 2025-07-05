import { supabase } from '@/integrations/supabase/client';
import { DatabaseService, DatabaseResponse } from '@/lib/database';
import { ErrorHandler } from '@/lib/errors';
import { logger } from '@/lib/logger';

export interface Property {
  id: string;
  verhuurder_id: string;
  titel: string;
  beschrijving?: string;
  adres: string;
  stad: string;
  provincie?: string;
  postcode?: string;
  huurprijs: number;
  oppervlakte?: number;
  aantal_kamers?: number;
  aantal_slaapkamers?: number;
  woning_type: string;
  meubilering: string;
  voorzieningen?: string[];
  beschikbaar_vanaf?: string;
  status: 'actief' | 'inactief' | 'verhuurd';
  foto_urls?: string[];
  is_actief: boolean;
  aangemaakt_op: string;
  bijgewerkt_op: string;
}

export interface CreatePropertyData {
  titel: string;
  beschrijving?: string;
  adres: string;
  stad: string;
  provincie?: string;
  postcode?: string;
  huurprijs: number;
  oppervlakte?: number;
  aantal_kamers?: number;
  aantal_slaapkamers?: number;
  woning_type?: string;
  meubilering?: string;
  voorzieningen?: string[];
  beschikbaar_vanaf?: string;
  foto_urls?: string[];
  is_actief?: boolean;
}

export interface PropertySearchFilters {
  stad?: string;
  maxHuurprijs?: number;
  minKamers?: number;
  woningType?: string;
  meubilering?: string;
  beschikbaarVanaf?: string;
}

export class PropertyService extends DatabaseService {
  async createProperty(data: CreatePropertyData): Promise<DatabaseResponse<Property>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: ErrorHandler.normalize('Niet geautoriseerd'),
        success: false,
      };
    }

    const sanitizedData = this.sanitizeInput(data);
    const validation = this.validateRequiredFields(sanitizedData, [
      'titel', 'adres', 'stad', 'huurprijs'
    ]);

    if (!validation.isValid) {
      return {
        data: null,
        error: new Error(`Verplichte velden ontbreken: ${validation.missingFields.join(', ')}`),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const { data: property, error } = await supabase
        .from('woningen')
        .insert({
          verhuurder_id: currentUserId,
          titel: sanitizedData.titel,
          beschrijving: sanitizedData.beschrijving,
          adres: sanitizedData.adres,
          stad: sanitizedData.stad,
          provincie: sanitizedData.provincie,
          postcode: sanitizedData.postcode,
          huurprijs: sanitizedData.huurprijs,
          oppervlakte: sanitizedData.oppervlakte,
          aantal_kamers: sanitizedData.aantal_kamers,
          aantal_slaapkamers: sanitizedData.aantal_slaapkamers,
          woning_type: sanitizedData.woning_type || 'appartement',
          meubilering: sanitizedData.meubilering || 'ongemeubileerd',
          voorzieningen: sanitizedData.voorzieningen || [],
          beschikbaar_vanaf: sanitizedData.beschikbaar_vanaf,
          foto_urls: sanitizedData.foto_urls || [],
          status: 'actief',
          is_actief: true,
        })
        .select()
        .single();

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      // Update landlord property count
      await supabase
        .from('verhuurders')
        .update({
          aantal_woningen: (await this.getPropertyCount(currentUserId)).data || 1
        })
        .eq('id', currentUserId);

      await this.createAuditLog('CREATE', 'woningen', property.id, currentUserId, property);

      return { data: property as Property, error: null };
    });
  }

  async getProperties(landlordId?: string): Promise<DatabaseResponse<Property[]>> {
    const currentUserId = await this.getCurrentUserId();
    const targetUserId = landlordId || currentUserId;

    if (!currentUserId || (!landlordId && !currentUserId)) {
      return {
        data: null,
        error: ErrorHandler.normalize('Niet geautoriseerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      let query = supabase.from('woningen').select('*').order('aangemaakt_op', { ascending: false });

      if (landlordId) {
        query = query.eq('verhuurder_id', landlordId);
      } else {
        query = query.eq('verhuurder_id', currentUserId);
      }

      const { data, error } = await query;

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      return { data: (data || []) as Property[], error: null };
    });
  }

  async searchProperties(filters: PropertySearchFilters): Promise<DatabaseResponse<Property[]>> {
    return this.executeQuery(async () => {
      let query = supabase
        .from('woningen')
        .select('*')
        .eq('is_actief', true)
        .eq('status', 'actief');

      if (filters.stad) {
        query = query.ilike('stad', `%${filters.stad}%`);
      }

      if (filters.maxHuurprijs) {
        query = query.lte('huurprijs', filters.maxHuurprijs);
      }

      if (filters.minKamers) {
        query = query.gte('aantal_kamers', filters.minKamers);
      }

      if (filters.woningType) {
        query = query.eq('woning_type', filters.woningType);
      }

      if (filters.meubilering) {
        query = query.eq('meubilering', filters.meubilering);
      }

      if (filters.beschikbaarVanaf) {
        query = query.gte('beschikbaar_vanaf', filters.beschikbaarVanaf);
      }

      query = query.order('aangemaakt_op', { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      return { data: (data || []) as Property[], error: null };
    });
  }

  async updateProperty(id: string, data: Partial<CreatePropertyData>): Promise<DatabaseResponse<Property>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: ErrorHandler.normalize('Niet geautoriseerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
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
        throw ErrorHandler.handleDatabaseError(error);
      }

      await this.createAuditLog('UPDATE', 'woningen', id, currentUserId, property);

      return { data: property as Property, error: null };
    });
  }

  async deleteProperty(id: string): Promise<DatabaseResponse<boolean>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: ErrorHandler.normalize('Niet geautoriseerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const { error } = await supabase
        .from('woningen')
        .delete()
        .eq('id', id)
        .eq('verhuurder_id', currentUserId);

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      // Update landlord property count
      await supabase
        .from('verhuurders')
        .update({
          aantal_woningen: (await this.getPropertyCount(currentUserId)).data || 0
        })
        .eq('id', currentUserId);

      await this.createAuditLog('DELETE', 'woningen', id, currentUserId, null);

      return { data: true, error: null };
    });
  }

  async getPropertyCount(landlordId: string): Promise<DatabaseResponse<number>> {
    return this.executeQuery(async () => {
      const { count, error } = await supabase
        .from('woningen')
        .select('*', { count: 'exact', head: true })
        .eq('verhuurder_id', landlordId);

      if (error) {
        throw ErrorHandler.handleDatabaseError(error);
      }

      return { data: count || 0, error: null };
    });
  }

  async getPropertyApplications(propertyId: string): Promise<DatabaseResponse<any[]>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: ErrorHandler.normalize('Niet geautoriseerd'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
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
        throw ErrorHandler.handleDatabaseError(error);
      }

      return { data: data || [], error: null };
    });
  }
}

export const propertyService = new PropertyService();