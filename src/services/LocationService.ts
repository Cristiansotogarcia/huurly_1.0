import { supabase } from '@/integrations/supabase/client';
import { DatabaseService, DatabaseResponse } from '@/lib/database';

export class LocationService extends DatabaseService {
  /**
   * Get all active cities
   */
  async getCities(): Promise<DatabaseResponse<any[]>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('is_active', true)
        .order('name');

      return { data, error };
    });
  }

  /**
   * Get districts for a specific city
   */
  async getDistrictsByCity(cityId: string): Promise<DatabaseResponse<any[]>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('districts')
        .select('*')
        .eq('city_id', cityId)
        .eq('is_active', true)
        .order('name');

      return { data, error };
    });
  }

  /**
   * Get districts for a city by city name
   */
  async getDistrictsByCityName(cityName: string): Promise<DatabaseResponse<any[]>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('districts')
        .select(`
          *,
          cities!inner(name)
        `)
        .eq('cities.name', cityName)
        .eq('is_active', true)
        .eq('cities.is_active', true)
        .order('name');

      return { data, error };
    });
  }

  /**
   * Get all cities with their districts
   */
  async getCitiesWithDistricts(): Promise<DatabaseResponse<any[]>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('cities')
        .select(`
          *,
          districts(*)
        `)
        .eq('is_active', true)
        .eq('districts.is_active', true)
        .order('name');

      return { data, error };
    });
  }

  /**
   * Search cities by name
   */
  async searchCities(searchTerm: string): Promise<DatabaseResponse<any[]>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('is_active', true)
        .ilike('name', `%${searchTerm}%`)
        .order('name')
        .limit(10);

      return { data, error };
    });
  }

  /**
   * Get city by name
   */
  async getCityByName(name: string): Promise<DatabaseResponse<any>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('name', name)
        .eq('is_active', true)
        .single();

      return { data, error };
    });
  }

  /**
   * Add new city (admin only)
   */
  async addCity(name: string, country: string = 'Netherlands'): Promise<DatabaseResponse<any>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    const hasPermission = await this.checkUserPermission(currentUserId, ['Beheerder']);
    if (!hasPermission) {
      return {
        data: null,
        error: new Error('Geen toegang om steden toe te voegen'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('cities')
        .insert({
          name: name.trim(),
          country: country
        })
        .select()
        .single();

      if (error) {
        throw this.handleDatabaseError(error);
      }

      await this.createAuditLog('CREATE', 'cities', data?.id, null, data);

      return { data, error: null };
    });
  }

  /**
   * Add new district (admin only)
   */
  async addDistrict(cityId: string, name: string): Promise<DatabaseResponse<any>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    const hasPermission = await this.checkUserPermission(currentUserId, ['Beheerder']);
    if (!hasPermission) {
      return {
        data: null,
        error: new Error('Geen toegang om wijken toe te voegen'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('districts')
        .insert({
          city_id: cityId,
          name: name.trim()
        })
        .select()
        .single();

      if (error) {
        throw this.handleDatabaseError(error);
      }

      await this.createAuditLog('CREATE', 'districts', data?.id, null, data);

      return { data, error: null };
    });
  }

  /**
   * Update city (admin only)
   */
  async updateCity(cityId: string, updates: { name?: string; country?: string; is_active?: boolean }): Promise<DatabaseResponse<any>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    const hasPermission = await this.checkUserPermission(currentUserId, ['Beheerder']);
    if (!hasPermission) {
      return {
        data: null,
        error: new Error('Geen toegang om steden te wijzigen'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // Get current data for audit log
      const { data: currentData } = await supabase
        .from('cities')
        .select('*')
        .eq('id', cityId)
        .single();

      const { data, error } = await supabase
        .from('cities')
        .update(updates)
        .eq('id', cityId)
        .select()
        .single();

      if (error) {
        throw this.handleDatabaseError(error);
      }

      await this.createAuditLog('UPDATE', 'cities', cityId, currentData, data);

      return { data, error: null };
    });
  }

  /**
   * Update district (admin only)
   */
  async updateDistrict(districtId: string, updates: { name?: string; is_active?: boolean }): Promise<DatabaseResponse<any>> {
    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      return {
        data: null,
        error: new Error('Niet geautoriseerd'),
        success: false,
      };
    }

    const hasPermission = await this.checkUserPermission(currentUserId, ['Beheerder']);
    if (!hasPermission) {
      return {
        data: null,
        error: new Error('Geen toegang om wijken te wijzigen'),
        success: false,
      };
    }

    return this.executeQuery(async () => {
      // Get current data for audit log
      const { data: currentData } = await supabase
        .from('districts')
        .select('*')
        .eq('id', districtId)
        .single();

      const { data, error } = await supabase
        .from('districts')
        .update(updates)
        .eq('id', districtId)
        .select()
        .single();

      if (error) {
        throw this.handleDatabaseError(error);
      }

      await this.createAuditLog('UPDATE', 'districts', districtId, currentData, data);

      return { data, error: null };
    });
  }
}

// Export singleton instance
export const locationService = new LocationService();
