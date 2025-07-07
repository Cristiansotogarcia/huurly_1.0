import { supabase } from '../integrations/supabase/client.ts';
import { DatabaseService, DatabaseResponse, PaginationOptions, SortOptions } from '../lib/database.ts';
import { logger } from '../lib/logger.ts';
import { useAuthStore } from '../store/authStore.ts';

/**
 * Standard service response format
 */
export interface ServiceResponse<T = any> {
  data: T | null;
  error: Error | null;
  success: boolean;
  message?: string;
}

/**
 * Service operation context for logging and auditing
 */
export interface ServiceContext {
  operation: string;
  userId?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
}

/**
 * Authentication error class for consistent error handling
 */
export class AuthenticationError extends Error {
  constructor(message: string = 'Niet geautoriseerd') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Validation error class for input validation failures
 */
export class ValidationError extends Error {
  public readonly field?: string;
  
  constructor(message: string, field?: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

/**
 * Permission error class for authorization failures
 */
export class PermissionError extends Error {
  constructor(message: string = 'Geen toegang tot deze functie') {
    super(message);
    this.name = 'PermissionError';
  }
}

/**
 * Base service class providing standardized patterns for all services
 */
export abstract class BaseService extends DatabaseService {
  protected readonly serviceName: string;

  constructor(serviceName: string) {
    super();
    this.serviceName = serviceName;
  }

  /**
   * Validate authentication and refresh session if needed
   */
  protected async validateAuthentication(): Promise<string> {
    const authStore = useAuthStore.getState();
    
    // Check if session is valid
    const isValid = await authStore.validateSession();
    
    if (!isValid) {
      logger.warn(`${this.serviceName}: Session invalid, attempting refresh...`);
      const refreshed = await authStore.refreshSession();
      
      if (!refreshed) {
        logger.error(`${this.serviceName}: Session refresh failed`);
        throw new AuthenticationError('Uw sessie is verlopen. Log opnieuw in om door te gaan.');
      }
    }

    const currentUserId = await this.getCurrentUserId();
    if (!currentUserId) {
      throw new AuthenticationError();
    }

    return currentUserId;
  }

  /**
   * Execute operation with comprehensive error handling and logging
   */
  protected async executeServiceOperation<T>(
    operation: () => Promise<T>,
    context: ServiceContext
  ): Promise<ServiceResponse<T>> {
    const startTime = Date.now();
    
    try {
      logger.info(`${this.serviceName}: Starting ${context.operation}`, {
        userId: context.userId,
        resourceId: context.resourceId,
        metadata: context.metadata
      });

      const result = await operation();
      
      const duration = Date.now() - startTime;
      logger.info(`${this.serviceName}: Completed ${context.operation} in ${duration}ms`, {
        userId: context.userId,
        resourceId: context.resourceId
      });

      return {
        data: result,
        error: null,
        success: true
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error(`${this.serviceName}: Failed ${context.operation} after ${duration}ms`, {
        error: errorMessage,
        userId: context.userId,
        resourceId: context.resourceId,
        stack: error instanceof Error ? error.stack : undefined
      });

      // Handle authentication errors specially
      if (error instanceof AuthenticationError) {
        const authStore = useAuthStore.getState();
        authStore.logout();
      }

      return {
        data: null,
        error: error instanceof Error ? error : new Error(errorMessage),
        success: false,
        message: errorMessage
      };
    }
  }

  /**
   * Execute authenticated operation with automatic auth validation
   */
  protected async executeAuthenticatedOperation<T>(
    operation: (userId: string) => Promise<T>,
    operationName: string,
    resourceId?: string,
    metadata?: Record<string, any>
  ): Promise<ServiceResponse<T>> {
    return this.executeServiceOperation(async () => {
      const userId = await this.validateAuthentication();
      return await operation(userId);
    }, {
      operation: operationName,
      resourceId,
      metadata
    });
  }

  /**
   * Execute operation with permission check
   */
  protected async executeWithPermission<T>(
    operation: (userId: string) => Promise<T>,
    requiredRoles: string[],
    operationName: string,
    resourceId?: string,
    targetUserId?: string
  ): Promise<ServiceResponse<T>> {
    return this.executeServiceOperation(async () => {
      const userId = await this.validateAuthentication();
      
      const hasPermission = await this.checkUserPermission(
        targetUserId || userId, 
        requiredRoles
      );
      
      if (!hasPermission) {
        throw new PermissionError(`Geen toegang tot ${operationName}`);
      }

      return await operation(userId);
    }, {
      operation: operationName,
      userId: targetUserId,
      resourceId,
      metadata: { requiredRoles }
    });
  }

  /**
   * Standardized input validation
   */
  protected validateInput<T extends Record<string, any>>(
    data: T,
    requiredFields: (keyof T)[],
    customValidators?: Partial<Record<keyof T, (value: any) => boolean | string>>
  ): T {
    const sanitizedData = this.sanitizeInput(data) as T;
    
    // Check required fields
    const validation = this.validateRequiredFields(sanitizedData, requiredFields as string[]);
    if (!validation.isValid) {
      throw new ValidationError(
        `Verplichte velden ontbreken: ${validation.missingFields.join(', ')}`
      );
    }

    // Run custom validators
    if (customValidators) {
      for (const field in customValidators) {
        const validator = customValidators[field];
        if (validator) {
          const value = sanitizedData[field];
          if (value !== undefined && value !== null) {
            const result = validator(value);
            if (typeof result === 'string') {
              throw new ValidationError(result, String(field));
            }
            if (result === false) {
              throw new ValidationError(`Ongeldige waarde voor ${String(field)}`, String(field));
            }
          }
        }
      }
    }

    return sanitizedData;
  }

  /**
   * Standardized database query execution with error handling
   */
  protected async executeStandardQuery<T>(
    query: () => Promise<{ data: T | null; error: any }>,
    operationName: string,
    resourceId?: string
  ): Promise<ServiceResponse<T>> {
    return this.executeServiceOperation(async () => {
      const { data, error } = await query();
      
      if (error) {
        throw this.handleDatabaseError(error);
      }
      
      return data;
    }, {
      operation: operationName,
      resourceId
    });
  }

  /**
   * Execute paginated query with standardized response
   */
  protected async executePaginatedQuery<T>(
    baseQuery: any,
    pagination?: PaginationOptions,
    sort?: SortOptions,
    operationName: string = 'paginated_query'
  ): Promise<ServiceResponse<T[]>> {
    return this.executeServiceOperation(async () => {
      let query = baseQuery;
      
      // Apply sorting
      if (sort) {
        query = this.applySorting(query, sort);
      }
      
      // Apply pagination
      if (pagination) {
        query = this.applyPagination(query, pagination);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw this.handleDatabaseError(error);
      }
      
      return data || [];
    }, {
      operation: operationName,
      metadata: { pagination, sort }
    });
  }

  /**
   * Create audit log with standardized format
   */
  protected async createStandardAuditLog(
    action: string,
    table: string,
    recordId: string | null,
    oldData?: any,
    newData?: any,
    userId?: string
  ): Promise<void> {
    try {
      const currentUserId = userId || await this.getCurrentUserId();
      if (currentUserId) {
        await this.createAuditLog(action, table, recordId, oldData, newData);
      }
    } catch (error) {
      // Log audit failures but don't throw - audit should not break main operations
      logger.error(`${this.serviceName}: Audit log creation failed`, {
        action,
        table,
        recordId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Standardized error response creation
   */
  protected createErrorResponse<T = any>(
    error: Error | string,
    operation?: string
  ): ServiceResponse<T> {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    
    logger.error(`${this.serviceName}: ${operation || 'Operation'} failed`, {
      error: errorObj.message,
      stack: errorObj.stack
    });

    return {
      data: null,
      error: errorObj,
      success: false,
      message: errorObj.message
    };
  }

  /**
   * Standardized success response creation
   */
  protected createSuccessResponse<T>(
    data: T,
    message?: string
  ): ServiceResponse<T> {
    return {
      data,
      error: null,
      success: true,
      message
    };
  }

  /**
   * Common email validation
   */
  protected validateEmail(email: string): boolean {
    return this.isValidEmail(email);
  }

  /**
   * Common phone validation
   */
  protected validatePhone(phone: string): boolean {
    return this.isValidPhoneNumber(phone);
  }

  /**
   * Standardized search query builder
   */
  protected buildStandardSearchQuery(
    baseQuery: any,
    searchTerm: string,
    searchFields: string[]
  ): any {
    return this.buildSearchQuery(baseQuery, searchTerm, searchFields);
  }

  /**
   * Get service metrics for monitoring
   */
  protected getServiceMetrics(): Record<string, any> {
    return {
      serviceName: this.serviceName,
      timestamp: new Date().toISOString(),
      // Additional metrics can be added by extending services
    };
  }
}

/**
 * Service factory for creating standardized service instances
 */
export class ServiceFactory {
  private static instances = new Map<string, BaseService>();

  static getInstance<T extends BaseService>(
    serviceClass: new (...args: any[]) => T,
    ...args: any[]
  ): T {
    const serviceName = serviceClass.name;
    
    if (!this.instances.has(serviceName)) {
      this.instances.set(serviceName, new serviceClass(...args));
    }
    
    return this.instances.get(serviceName) as T;
  }

  static clearInstances(): void {
    this.instances.clear();
  }
}

/**
 * Service utilities for common operations
 */
export class ServiceUtils {
  /**
   * Standardized error message mapping
   */
  static getErrorMessage(error: any): string {
    if (error instanceof AuthenticationError) {
      return 'Uw sessie is verlopen. Log opnieuw in.';
    }
    
    if (error instanceof ValidationError) {
      return error.message;
    }
    
    if (error instanceof PermissionError) {
      return error.message;
    }
    
    // Database errors
    if (error?.code === '23505') {
      return 'Deze gegevens bestaan al in het systeem.';
    }
    
    if (error?.code === '23503') {
      return 'Kan deze actie niet uitvoeren vanwege gekoppelde gegevens.';
    }
    
    return error?.message || 'Er is een onbekende fout opgetreden.';
  }

  /**
   * Retry mechanism for failed operations
   */
  static async retry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
    
    throw lastError!;
  }
}
