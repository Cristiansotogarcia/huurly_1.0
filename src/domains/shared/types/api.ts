/**
 * Standard service response format
 */
export interface ServiceResponse<T = any> {
  success: boolean;
  data: T | null;
  error: ServiceErrorDetails | null;
  message?: string;
  metadata?: Record<string, any>;
}

/**
 * Service error details
 */
export interface ServiceErrorDetails {
  message: string;
  code: string;
  statusCode: number;
  details?: Record<string, any>;
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
 * Enhanced service error class
 */
export class ServiceError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, any>;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    statusCode: number = 500,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends ServiceError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization error
 */
export class AuthorizationError extends ServiceError {
  constructor(message: string = 'Access denied') {
    super(message, 'AUTHORIZATION_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

/**
 * Validation error
 */
export class ValidationError extends ServiceError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

/**
 * Not found error
 */
export class NotFoundError extends ServiceError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict error
 */
export class ConflictError extends ServiceError {
  constructor(message: string = 'Resource conflict') {
    super(message, 'CONFLICT_ERROR', 409);
    this.name = 'ConflictError';
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends ServiceError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT_ERROR', 429);
    this.name = 'RateLimitError';
  }
}

/**
 * API request options
 */
export interface ApiRequestOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page: number;
  limit: number;
  offset?: number;
}

/**
 * Sort options
 */
export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Filter options
 */
export interface FilterOptions {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'not_in';
  value: any;
}

/**
 * Search options
 */
export interface SearchOptions {
  query: string;
  fields: string[];
  fuzzy?: boolean;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Bulk operation result
 */
export interface BulkOperationResult<T = any> {
  successful: T[];
  failed: Array<{
    item: T;
    error: ServiceErrorDetails;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  id: string;
  action: string;
  resource: string;
  resourceId: string;
  userId: string;
  timestamp: string;
  oldData?: any;
  newData?: any;
  metadata?: Record<string, any>;
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  services: Record<string, {
    status: 'up' | 'down' | 'degraded';
    responseTime?: number;
    error?: string;
  }>;
}