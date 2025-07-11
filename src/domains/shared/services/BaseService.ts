import { supabase } from '../../../integrations/supabase/client';
import { logger } from '../../../lib/logger';
import { ServiceResponse, ServiceContext, ServiceError } from '../types/api';

/**
 * Enhanced Base Service with improved architecture
 * Provides standardized patterns for all domain services
 */
export abstract class BaseService {
  protected readonly serviceName: string;
  protected readonly domain: string;

  constructor(serviceName: string, domain: string) {
    this.serviceName = serviceName;
    this.domain = domain;
  }

  /**
   * Execute operation with comprehensive error handling and logging
   */
  protected async executeOperation<T>(
    operation: () => Promise<T>,
    context: ServiceContext
  ): Promise<ServiceResponse<T>> {
    const startTime = Date.now();
    const operationId = this.generateOperationId();
    
    try {
      logger.info(`[${this.domain}:${this.serviceName}] Starting ${context.operation}`, {
        operationId,
        userId: context.userId,
        resourceId: context.resourceId,
        metadata: context.metadata
      });

      const result = await operation();
      
      const duration = Date.now() - startTime;
      logger.info(`[${this.domain}:${this.serviceName}] Completed ${context.operation}`, {
        operationId,
        duration,
        userId: context.userId,
        resourceId: context.resourceId
      });

      return this.createSuccessResponse(result);

    } catch (error) {
      const duration = Date.now() - startTime;
      const serviceError = this.normalizeError(error);
      
      logger.error(`[${this.domain}:${this.serviceName}] Failed ${context.operation}`, {
        operationId,
        duration,
        error: serviceError.message,
        code: serviceError.code,
        userId: context.userId,
        resourceId: context.resourceId,
        stack: serviceError.stack
      });

      return this.createErrorResponse(serviceError);
    }
  }

  /**
   * Execute database query with standardized error handling
   */
  protected async executeQuery<T>(
    queryFn: () => Promise<{ data: T | null; error: any }>,
    context: ServiceContext
  ): Promise<ServiceResponse<T>> {
    return this.executeOperation(async () => {
      const { data, error } = await queryFn();
      
      if (error) {
        throw this.createDatabaseError(error);
      }
      
      return data;
    }, context);
  }

  /**
   * Validate input data with comprehensive validation
   */
  protected validateInput<T extends Record<string, any>>(
    data: T,
    schema: ValidationSchema<T>
  ): T {
    const sanitizedData = this.sanitizeInput(data);
    const errors: BaseValidationError[] = [];

    // Validate required fields
    for (const field of schema.required || []) {
      if (!this.hasValue(sanitizedData[field])) {
        errors.push({
          field: String(field),
          message: `${String(field)} is required`,
          code: 'REQUIRED_FIELD'
        });
      }
    }

    // Validate field rules
    for (const [field, rules] of Object.entries(schema.fields || {})) {
      const value = sanitizedData[field as keyof T];
      if (this.hasValue(value)) {
        const fieldErrors = this.validateField(field, value, rules);
        errors.push(...fieldErrors);
      }
    }

    if (errors.length > 0) {
      throw new ServiceError(
        'Validation failed',
        'VALIDATION_ERROR',
        400,
        { validationErrors: errors }
      );
    }

    return sanitizedData as T;
  }

  /**
   * Create standardized success response
   */
  protected createSuccessResponse<T>(
    data: T,
    message?: string,
    metadata?: Record<string, any>
  ): ServiceResponse<T> {
    return {
      success: true,
      data,
      error: null,
      message,
      metadata
    };
  }

  /**
   * Create standardized error response
   */
  protected createErrorResponse<T = null>(
    error: ServiceError,
    data: T = null as T
  ): ServiceResponse<T> {
    return {
      success: false,
      data,
      error: {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        details: error.details
      },
      message: error.message
    };
  }

  /**
   * Normalize different error types to ServiceError
   */
  private normalizeError(error: unknown): ServiceError {
    if (error instanceof ServiceError) {
      return error;
    }

    if (error instanceof Error) {
      return new ServiceError(
        error.message,
        'UNKNOWN_ERROR',
        500,
        { originalError: error.name }
      );
    }

    return new ServiceError(
      'An unknown error occurred',
      'UNKNOWN_ERROR',
      500
    );
  }

  /**
   * Create database-specific error
   */
  private createDatabaseError(dbError: any): ServiceError {
    const errorMap: Record<string, { message: string; code: string }> = {
      '23505': {
        message: 'This record already exists',
        code: 'DUPLICATE_RECORD'
      },
      '23503': {
        message: 'Cannot delete record due to related data',
        code: 'FOREIGN_KEY_CONSTRAINT'
      },
      '42P01': {
        message: 'Table does not exist',
        code: 'TABLE_NOT_FOUND'
      }
    };

    const mappedError = errorMap[dbError.code];
    if (mappedError) {
      return new ServiceError(
        mappedError.message,
        mappedError.code,
        400,
        { dbCode: dbError.code, dbMessage: dbError.message }
      );
    }

    return new ServiceError(
      dbError.message || 'Database operation failed',
      'DATABASE_ERROR',
      500,
      { dbCode: dbError.code }
    );
  }

  /**
   * Sanitize input data
   */
  private sanitizeInput<T extends Record<string, any>>(data: T): T {
    const sanitized = { ...data };
    
    for (const [key, value] of Object.entries(sanitized)) {
      if (typeof value === 'string') {
        sanitized[key as keyof T] = value.trim() as T[keyof T];
      }
    }
    
    return sanitized;
  }

  /**
   * Check if value exists and is not empty
   */
  private hasValue(value: any): boolean {
    return value !== null && value !== undefined && value !== '';
  }

  /**
   * Validate individual field
   */
  private validateField(
    field: string,
    value: any,
    rules: FieldValidationRules
  ): BaseValidationError[] {
    const errors: BaseValidationError[] = [];

    if (rules.type && typeof value !== rules.type) {
      errors.push({
        field,
        message: `${field} must be of type ${rules.type}`,
        code: 'INVALID_TYPE'
      });
    }

    if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
      errors.push({
        field,
        message: `${field} must be at least ${rules.minLength} characters`,
        code: 'MIN_LENGTH'
      });
    }

    if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
      errors.push({
        field,
        message: `${field} must be no more than ${rules.maxLength} characters`,
        code: 'MAX_LENGTH'
      });
    }

    if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
      errors.push({
        field,
        message: rules.patternMessage || `${field} format is invalid`,
        code: 'INVALID_FORMAT'
      });
    }

    if (rules.custom) {
      const customResult = rules.custom(value);
      if (customResult !== true) {
        errors.push({
          field,
          message: typeof customResult === 'string' ? customResult : `${field} is invalid`,
          code: 'CUSTOM_VALIDATION'
        });
      }
    }

    return errors;
  }

  /**
   * Generate unique operation ID for tracking
   */
  private generateOperationId(): string {
    return `${this.domain}_${this.serviceName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Validation schema interface
 */
export interface ValidationSchema<T> {
  required?: (keyof T)[];
  fields?: Partial<Record<keyof T, FieldValidationRules>>;
}

/**
 * Field validation rules
 */
export interface FieldValidationRules {
  type?: 'string' | 'number' | 'boolean' | 'object';
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  patternMessage?: string;
  custom?: (value: any) => boolean | string;
}

/**
 * Validation error interface
 */
export interface BaseValidationError {
  field: string;
  message: string;
  code: string;
}