
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface LocationResponse<T> {
  data: T | null;
  error: Error | null;
  success: boolean;
}

export class LocationService {
  /**
   * Get all cities from dutch_cities_neighborhoods table
   */
  async getCities(): Promise<LocationResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('dutch_cities_neighborhoods')
        .select('city_name, province')
        .order('city_name');

      if (error) {
        logger.error('Error fetching cities:', error);
        return { data: null, error: new Error(error.message), success: false };
      }

      // Remove duplicates and create unique city list
      const uniqueCities = Array.from(
        new Map(data?.map(item => [item.city_name, item]) || []).values()
      );

      return { data: uniqueCities, error: null, success: true };
    } catch (error) {
      logger.error('Unexpected error in getCities:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Unknown error'), 
        success: false 
      };
    }
  }

  /**
   * Get neighborhoods for a specific city
   */
  async getNeighborhoodsByCity(cityName: string): Promise<LocationResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('dutch_cities_neighborhoods')
        .select('*')
        .eq('city_name', cityName)
        .order('neighborhood_name');

      if (error) {
        logger.error('Error fetching neighborhoods:', error);
        return { data: null, error: new Error(error.message), success: false };
      }

      return { data: data || [], error: null, success: true };
    } catch (error) {
      logger.error('Unexpected error in getNeighborhoodsByCity:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Unknown error'), 
        success: false 
      };
    }
  }

  /**
   * Get all cities with their neighborhoods
   */
  async getCitiesWithNeighborhoods(): Promise<LocationResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('dutch_cities_neighborhoods')
        .select('*')
        .order('city_name, neighborhood_name');

      if (error) {
        logger.error('Error fetching cities with neighborhoods:', error);
        return { data: null, error: new Error(error.message), success: false };
      }

      // Group by city
      const groupedData = data?.reduce((acc: any, item: any) => {
        const cityKey = item.city_name;
        if (!acc[cityKey]) {
          acc[cityKey] = {
            city_name: item.city_name,
            province: item.province,
            neighborhoods: []
          };
        }
        acc[cityKey].neighborhoods.push({
          neighborhood_name: item.neighborhood_name,
          postal_code_prefix: item.postal_code_prefix,
          population: item.population
        });
        return acc;
      }, {});

      const result = Object.values(groupedData || {});
      return { data: result, error: null, success: true };
    } catch (error) {
      logger.error('Unexpected error in getCitiesWithNeighborhoods:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Unknown error'), 
        success: false 
      };
    }
  }

  /**
   * Search cities by name
   */
  async searchCities(searchTerm: string): Promise<LocationResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('dutch_cities_neighborhoods')
        .select('city_name, province')
        .ilike('city_name', `%${searchTerm}%`)
        .order('city_name')
        .limit(10);

      if (error) {
        logger.error('Error searching cities:', error);
        return { data: null, error: new Error(error.message), success: false };
      }

      // Remove duplicates
      const uniqueCities = Array.from(
        new Map(data?.map(item => [item.city_name, item]) || []).values()
      );

      return { data: uniqueCities, error: null, success: true };
    } catch (error) {
      logger.error('Unexpected error in searchCities:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Unknown error'), 
        success: false 
      };
    }
  }

  /**
   * Get city by name
   */
  async getCityByName(name: string): Promise<LocationResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('dutch_cities_neighborhoods')
        .select('city_name, province')
        .eq('city_name', name)
        .limit(1)
        .single();

      if (error) {
        logger.error('Error fetching city by name:', error);
        return { data: null, error: new Error(error.message), success: false };
      }

      return { data, error: null, success: true };
    } catch (error) {
      logger.error('Unexpected error in getCityByName:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Unknown error'), 
        success: false 
      };
    }
  }
}

// Export singleton instance
export const locationService = new LocationService();
