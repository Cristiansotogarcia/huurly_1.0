import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

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
      let dbQuery = supabase
        .from('properties')
        .select('*, landlord:landlord_id(*)', { count: 'exact' });
      
      // Apply text search if query is provided
      if (query && query.trim() !== '') {
        dbQuery = dbQuery.or(
          `title.ilike.%${query}%,description.ilike.%${query}%,address.ilike.%${query}%,city.ilike.%${query}%`
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
      dbQuery = dbQuery.order(sortBy, { ascending: sortOrder === 'asc' });
      
      // Apply pagination
      dbQuery = dbQuery.range(offset, offset + limit - 1);
      
      // Execute the query
      const { data, error, count } = await dbQuery;
      
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
        .from('tenant_profiles')
        .select('*, user:user_id(*)', { count: 'exact' });
      
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
      dbQuery = dbQuery.order(sortBy, { ascending: sortOrder === 'asc' });
      
      // Apply pagination
      dbQuery = dbQuery.range(offset, offset + limit - 1);
      
      // Execute the query
      const { data, error, count } = await dbQuery;
      
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
        .from('user_documents')
        .select('*, user:user_id(*), approved_by_user:approved_by(*)', { count: 'exact' });
      
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
      dbQuery = dbQuery.order(sortBy, { ascending: sortOrder === 'asc' });
      
      // Apply pagination
      dbQuery = dbQuery.range(offset, offset + limit - 1);
      
      // Execute the query
      const { data, error, count } = await dbQuery;
      
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
        .from('user_roles')
        .select('*, user:user_id(*)', { count: 'exact' });
      
      // Apply text search if query is provided
      if (query && query.trim() !== '') {
        // We need to search in the auth.users table which we can't directly query
        // Instead, we'll get all users and filter in memory (not ideal for large datasets)
        const { data: allUsers, error: usersError } = await dbQuery;
        
        if (usersError) {
          logger.error('Error fetching users for search:', usersError);
          return { success: false, error: usersError };
        }
        
        // Filter users by query
        const filteredUsers = allUsers?.filter(userRole => {
          const user = userRole.user;
          if (!user) return false;
          
          const searchableFields = [
            user.email,
            user.phone,
            userRole.role
          ];
          
          return searchableFields.some(field => 
            field && field.toLowerCase().includes(query.toLowerCase())
          );
        }) || [];
        
        // Apply sorting
        filteredUsers.sort((a, b) => {
          const aValue = a[sortBy];
          const bValue = b[sortBy];
          
          if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });
        
        // Apply pagination
        const paginatedUsers = filteredUsers.slice(offset, offset + limit);
        
        logger.info(`Found ${filteredUsers.length} users matching the criteria`);
        return { success: true, data: paginatedUsers, count: filteredUsers.length };
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
      dbQuery = dbQuery.order(sortBy, { ascending: sortOrder === 'asc' });
      
      // Apply pagination
      dbQuery = dbQuery.range(offset, offset + limit - 1);
      
      // Execute the query
      const { data, error, count } = await dbQuery;
      
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