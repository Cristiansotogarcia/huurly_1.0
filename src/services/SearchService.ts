import { supabase } from '../integrations/supabase/client.ts';
import { logger } from '../lib/logger.ts';

export interface SearchOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface SearchResponse<T> {
  success: boolean;
  data?: T[];
  count?: number;
  error?: any;
}

/**
 * Service for handling search operations across the application
 */
export class SearchService {
  /**
   * Search for properties with various filters
   * @param query - The search query string
   * @param options - Search options including pagination, sorting, and filters
   * @returns Filtered properties and total count
   */
  static async searchProperties(query: string, options: SearchOptions = {}): Promise<SearchResponse<any>> {
    try {
      logger.info('Searching properties with query:', query, 'options:', options);
      
      const {
        limit = 10,
        offset = 0,
        sortBy = 'created_at',
        sortOrder = 'desc',
        filters = {}
      } = options;
      
      // Start building the query
      // Using type assertion since 'properties' table exists in the database but is missing from types
      let dbQuery = supabase
        .from('verhuurders' as any)
        .select('*, landlord:landlord_id(*)', { count: 'exact' });
      
      // Text search is not supported for 'verhuurders' table as it lacks searchable text fields.
      
      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Handle range filters (min/max)
          if (key.endsWith('_min') && typeof value === 'number') {
            const actualKey = key.replace('_min', '');
            dbQuery = dbQuery.gte(actualKey, value);
          } else if (key.endsWith('_max') && typeof value === 'number') {
            const actualKey = key.replace('_max', '');
            dbQuery = dbQuery.lte(actualKey, value);
          } else if (Array.isArray(value) && value.length > 0) {
            // Handle array values (IN operator)
            dbQuery = dbQuery.in(key, value);
          } else if (typeof value === 'boolean') {
            // Handle boolean values
            dbQuery = dbQuery.eq(key, value);
          } else if (typeof value === 'string' && value.trim() !== '') {
            // Handle string values
            dbQuery = dbQuery.eq(key, value);
          } else if (typeof value === 'number') {
            // Handle numeric values
            dbQuery = dbQuery.eq(key, value);
          }
        }
      });
      
      // Apply sorting
      dbQuery = dbQuery.order(sortBy, { ascending: sortOrder === 'asc' }) as any;
      
      // Apply pagination
      dbQuery = dbQuery.range(offset, offset + limit - 1) as any;
      
      // Execute the query
      const { data, error, count } = await dbQuery as any;
      
      if (error) {
        logger.error('Error searching properties:', error);
        return { success: false, error };
      }
      
      logger.info(`Found ${count || 0} properties matching the criteria`);
      return { success: true, data: data || [], count };
    } catch (error) {
      logger.error('Error in searchProperties:', error);
      return { success: false, error };
    }
  }
  
  /**
   * Search for tenant profiles
   * @param query - The search query string
   * @param options - Search options including pagination, sorting, and filters
   * @returns Filtered tenant profiles and total count
   */
  static async searchTenantProfiles(query: string, options: SearchOptions = {}): Promise<SearchResponse<any>> {
    try {
      logger.info('Searching tenant profiles with query:', query, 'options:', options);
      
      const {
        limit = 10,
        offset = 0,
        sortBy = 'created_at',
        sortOrder = 'desc',
        filters = {}
      } = options;
      
      // Start building the query
      let dbQuery = supabase
        .from('huurders')
        .select('*, user:gebruikers(*)', { count: 'exact' }) as any;
      
      // Apply text search if query is provided
      if (query && query.trim() !== '') {
        dbQuery = dbQuery.or(
          `first_name.ilike.%${query}%,last_name.ilike.%${query}%,occupation.ilike.%${query}%,city.ilike.%${query}%`
        );
      }
      
      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Handle range filters (min/max)
          if (key.endsWith('_min') && typeof value === 'number') {
            const actualKey = key.replace('_min', '');
            dbQuery = dbQuery.gte(actualKey, value);
          } else if (key.endsWith('_max') && typeof value === 'number') {
            const actualKey = key.replace('_max', '');
            dbQuery = dbQuery.lte(actualKey, value);
          } else if (Array.isArray(value) && value.length > 0) {
            // Handle array values (IN operator)
            dbQuery = dbQuery.in(key, value);
          } else if (typeof value === 'boolean') {
            // Handle boolean values
            dbQuery = dbQuery.eq(key, value);
          } else if (typeof value === 'string' && value.trim() !== '') {
            // Handle string values
            dbQuery = dbQuery.eq(key, value);
          } else if (typeof value === 'number') {
            // Handle numeric values
            dbQuery = dbQuery.eq(key, value);
          }
        }
      });
      
      // Apply sorting
      dbQuery = dbQuery.order(sortBy, { ascending: sortOrder === 'asc' }) as any;
      
      // Apply pagination
      dbQuery = dbQuery.range(offset, offset + limit - 1) as any;
      
      // Execute the query
      const { data, error, count } = await dbQuery as any;
      
      if (error) {
        logger.error('Error searching tenant profiles:', error);
        return { success: false, error };
      }
      
      logger.info(`Found ${count || 0} tenant profiles matching the criteria`);
      return { success: true, data: data || [], count };
    } catch (error) {
      logger.error('Error in searchTenantProfiles:', error);
      return { success: false, error };
    }
  }
  
  /**
   * Search for documents
   * @param query - The search query string
   * @param options - Search options including pagination, sorting, and filters
   * @returns Filtered documents and total count
   */
  static async searchDocuments(query: string, options: SearchOptions = {}): Promise<SearchResponse<any>> {
    try {
      logger.info('Searching documents with query:', query, 'options:', options);
      
      const {
        limit = 10,
        offset = 0,
        sortBy = 'created_at',
        sortOrder = 'desc',
        filters = {}
      } = options;
      
      // Start building the query
      let dbQuery = supabase
        .from('documenten')
        .select('*, user:user_id(*), approved_by_user:approved_by(*)', { count: 'exact' }) as any;
      
      // Apply text search if query is provided
      if (query && query.trim() !== '') {
        dbQuery = dbQuery.or(
          `document_type.ilike.%${query}%,notes.ilike.%${query}%`
        );
      }
      
      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value) && value.length > 0) {
            // Handle array values (IN operator)
            dbQuery = dbQuery.in(key, value);
          } else if (typeof value === 'boolean') {
            // Handle boolean values
            dbQuery = dbQuery.eq(key, value);
          } else if (typeof value === 'string' && value.trim() !== '') {
            // Handle string values
            dbQuery = dbQuery.eq(key, value);
          } else if (typeof value === 'number') {
            // Handle numeric values
            dbQuery = dbQuery.eq(key, value);
          }
        }
      });
      
      // Apply sorting
      dbQuery = dbQuery.order(sortBy, { ascending: sortOrder === 'asc' }) as any;
      
      // Apply pagination
      dbQuery = dbQuery.range(offset, offset + limit - 1) as any;
      
      // Execute the query
      const { data, error, count } = await dbQuery as any;
      
      if (error) {
        logger.error('Error searching documents:', error);
        return { success: false, error };
      }
      
      logger.info(`Found ${count || 0} documents matching the criteria`);
      return { success: true, data: data || [], count };
    } catch (error) {
      logger.error('Error in searchDocuments:', error);
      return { success: false, error };
    }
  }
  
  /**
   * Search for users
   * @param query - The search query string
   * @param options - Search options including pagination, sorting, and filters
   * @returns Filtered users and total count
   */
  static async searchUsers(query: string, options: SearchOptions = {}): Promise<SearchResponse<any>> {
    try {
      logger.info('Searching users with query:', query, 'options:', options);
      
      const {
        limit = 10,
        offset = 0,
        sortBy = 'created_at',
        sortOrder = 'desc',
        filters = {}
      } = options;
      
      // Start building the query
      let dbQuery = supabase
        .from('gebruiker_rollen')
        .select('*, user:user_id(*)', { count: 'exact' }) as any;
      
      // Apply text search if query is provided
      if (query && query.trim() !== '') {
        dbQuery = dbQuery.or(
          `user.email.ilike.%${query}%,user.phone.ilike.%${query}%,role.ilike.%${query}%`
        );
      }
      
      // If no query is provided, we can use the database filtering
      
      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value) && value.length > 0) {
            // Handle array values (IN operator)
            dbQuery = dbQuery.in(key, value);
          } else if (typeof value === 'boolean') {
            // Handle boolean values
            dbQuery = dbQuery.eq(key, value);
          } else if (typeof value === 'string' && value.trim() !== '') {
            // Handle string values
            dbQuery = dbQuery.eq(key, value);
          } else if (typeof value === 'number') {
            // Handle numeric values
            dbQuery = dbQuery.eq(key, value);
          }
        }
      });
      
      // Apply sorting
      dbQuery = dbQuery.order(sortBy, { ascending: sortOrder === 'asc' }) as any;
      
      // Apply pagination
      dbQuery = dbQuery.range(offset, offset + limit - 1) as any;
      
      // Execute the query
      const { data, error, count } = await dbQuery as any;
      
      if (error) {
        logger.error('Error searching users:', error);
        return { success: false, error };
      }
      
      logger.info(`Found ${count || 0} users matching the criteria`);
      return { success: true, data: data || [], count };
    } catch (error) {
      logger.error('Error in searchUsers:', error);
      return { success: false, error };
    }
  }
}

export default SearchService;