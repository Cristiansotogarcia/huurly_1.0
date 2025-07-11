
import { supabase } from '../integrations/supabase/client.ts';
import { PostgrestError } from '@supabase/supabase-js';
import { logger } from '../lib/logger.ts';

export interface DatabaseResponse<T> {
  data: T | null;
  error: PostgrestError | Error | null;
  success: boolean;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface SortOptions {
  column: string;
  ascending?: boolean;
}

export class DatabaseService {
  /**
   * Generic method to handle database operations with consistent error handling
   */
  protected async executeQuery<T>(
    queryFn: () => Promise<{ data: T | null; error: PostgrestError | Error | null }>
  ): Promise<DatabaseResponse<T>> {
    try {
      const { data, error } = await queryFn();
      
      if (error) {
         logger.error('Database error:', error);
        return {
          data: null,
          error,
          success: false,
        };
      }

      return {
        data,
        error: null,
        success: true,
      };
    } catch (error) {
       logger.error('Unexpected database error:', error);
      return {
        data: null,
        error: error as Error,
        success: false,
      };
    }
  }

  /**
   * Apply pagination to a query
   */
  protected applyPagination<T>(
    query: any,
    options?: PaginationOptions
  ) {
    if (options?.page && options?.limit) {
      const from = (options.page - 1) * options.limit;
      const to = from + options.limit - 1;
      return query.range(from, to);
    }
    return query;
  }

  /**
   * Apply sorting to a query
   */
  protected applySorting<T>(
    query: any,
    options?: SortOptions
  ) {
    if (options?.column) {
      return query.order(options.column, { ascending: options.ascending ?? true });
    }
    return query;
  }

  /**
   * Get current authenticated user ID
   */
  protected async getCurrentUserId(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  }

  /**
   * Check if user has permission to access resource
   */
  protected async checkUserPermission(
    resourceUserId: string,
    allowedRoles?: string[]
  ): Promise<boolean> {
    const currentUserId = await this.getCurrentUserId();
    
    if (!currentUserId) {
      return false;
    }

    // User can always access their own resources
    if (currentUserId === resourceUserId) {
      return true;
    }

    // Check role-based permissions using gebruikers table instead
    if (allowedRoles && allowedRoles.length > 0) {
      const { data: roleData } = await supabase
        .from('gebruikers')
        .select('rol')
        .eq('id', currentUserId)
        .single();

      if (roleData && allowedRoles.includes(roleData.rol)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Create audit log entry (placeholder for future implementation)
   */
  protected async createAuditLog(
    action: string,
    tableName: string,
    recordId?: string,
    oldValues?: any,
    newValues?: any
  ): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();
      
      // Log to console for now since audit_logs table doesn't exist
       logger.info('Audit Log:', {
        user_id: userId,
        action,
        table_name: tableName,
        record_id: recordId || null,
        old_values: oldValues ? JSON.stringify(oldValues) : null,
        new_values: newValues ? JSON.stringify(newValues) : null,
      });
    } catch (error) {
       logger.error('Failed to create audit log:', error);
    }
  }

  /**
   * Validate required fields
   */
  protected validateRequiredFields(
    data: Record<string, any>,
    requiredFields: string[]
  ): { isValid: boolean; missingFields: string[] } {
    const missingFields = requiredFields.filter(
      field => !data[field] || (typeof data[field] === 'string' && data[field].trim() === '')
    );

    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  }

  /**
   * Sanitize input data
   */
  protected sanitizeInput(data: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        if (typeof value === 'string') {
          // Basic XSS prevention
          sanitized[key] = value.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        } else {
          sanitized[key] = value;
        }
      }
    }

    return sanitized;
  }

  /**
   * Generate unique filename for file uploads
   */
  protected generateUniqueFilename(originalFilename: string, userId: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalFilename.split('.').pop();
    return `${userId}/${timestamp}_${randomString}.${extension}`;
  }

  /**
   * Check if file type is allowed
   */
  protected isAllowedFileType(filename: string, allowedTypes: string[]): boolean {
    const extension = filename.split('.').pop()?.toLowerCase();
    return extension ? allowedTypes.includes(extension) : false;
  }

  /**
   * Format file size for display
   */
  protected formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Validate email format
   */
  protected isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format (Dutch)
   */
  protected isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^(\+31|0)[1-9][0-9]{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Generate search query with full-text search
   */
  protected buildSearchQuery(
    baseQuery: any,
    searchTerm: string,
    searchColumns: string[]
  ) {
    if (!searchTerm || searchTerm.trim() === '') {
      return baseQuery;
    }

    const searchConditions = searchColumns
      .map(column => `${column}.ilike.%${searchTerm}%`)
      .join(',');

    return baseQuery.or(searchConditions);
  }

  /**
   * Handle database constraints and provide user-friendly error messages
   */
  protected handleDatabaseError(error: PostgrestError): Error {
    if (error.code === '23505') {
      // Unique constraint violation
      if (error.message.includes('email')) {
        return new Error('Dit e-mailadres is al in gebruik');
      }
      return new Error('Deze waarde bestaat al in het systeem');
    }

    if (error.code === '23503') {
      // Foreign key constraint violation
      return new Error('Gerelateerde gegevens ontbreken of zijn ongeldig');
    }

    if (error.code === '23514') {
      // Check constraint violation
      return new Error('De ingevoerde gegevens voldoen niet aan de vereisten');
    }

    // Default error message
    return new Error('Er is een fout opgetreden bij het verwerken van je verzoek');
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
