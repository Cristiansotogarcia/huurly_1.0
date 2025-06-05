/**
 * Centralized error handling and custom error types
 */

export enum ErrorCode {
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELDS = 'MISSING_REQUIRED_FIELDS',
  INVALID_FORMAT = 'INVALID_FORMAT',
  
  // Database errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  RECORD_NOT_FOUND = 'RECORD_NOT_FOUND',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  FOREIGN_KEY_CONSTRAINT = 'FOREIGN_KEY_CONSTRAINT',
  
  // File upload errors
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  
  // Business logic errors
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_UNAVAILABLE = 'RESOURCE_UNAVAILABLE',
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED',
  
  // External service errors
  PAYMENT_ERROR = 'PAYMENT_ERROR',
  EMAIL_SERVICE_ERROR = 'EMAIL_SERVICE_ERROR',
  
  // Generic errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export class HuurlyError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, any>;
  public readonly timestamp: string;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'HuurlyError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HuurlyError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

// Specific error classes for common scenarios
export class ValidationError extends HuurlyError {
  constructor(message: string, details?: Record<string, any>) {
    super(ErrorCode.VALIDATION_ERROR, message, 400, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends HuurlyError {
  constructor(message: string = 'Niet geautoriseerd') {
    super(ErrorCode.UNAUTHORIZED, message, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends HuurlyError {
  constructor(message: string = 'Onvoldoende rechten') {
    super(ErrorCode.FORBIDDEN, message, 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends HuurlyError {
  constructor(resource: string = 'Resource') {
    super(ErrorCode.RECORD_NOT_FOUND, `${resource} niet gevonden`, 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends HuurlyError {
  constructor(message: string) {
    super(ErrorCode.DUPLICATE_ENTRY, message, 409);
    this.name = 'ConflictError';
  }
}

export class FileUploadError extends HuurlyError {
  constructor(message: string, code: ErrorCode = ErrorCode.UPLOAD_FAILED) {
    super(code, message, 400);
    this.name = 'FileUploadError';
  }
}

// Error message translations
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.UNAUTHORIZED]: 'Je bent niet ingelogd. Log eerst in om door te gaan.',
  [ErrorCode.FORBIDDEN]: 'Je hebt geen toegang tot deze functie.',
  [ErrorCode.INVALID_CREDENTIALS]: 'Ongeldige inloggegevens.',
  
  [ErrorCode.VALIDATION_ERROR]: 'De ingevoerde gegevens zijn ongeldig.',
  [ErrorCode.MISSING_REQUIRED_FIELDS]: 'Verplichte velden ontbreken.',
  [ErrorCode.INVALID_FORMAT]: 'De ingevoerde gegevens hebben een ongeldig formaat.',
  
  [ErrorCode.DATABASE_ERROR]: 'Er is een fout opgetreden bij het opslaan van gegevens.',
  [ErrorCode.RECORD_NOT_FOUND]: 'De gevraagde gegevens zijn niet gevonden.',
  [ErrorCode.DUPLICATE_ENTRY]: 'Deze gegevens bestaan al in het systeem.',
  [ErrorCode.FOREIGN_KEY_CONSTRAINT]: 'Gerelateerde gegevens ontbreken of zijn ongeldig.',
  
  [ErrorCode.FILE_TOO_LARGE]: 'Het bestand is te groot.',
  [ErrorCode.INVALID_FILE_TYPE]: 'Dit bestandstype wordt niet ondersteund.',
  [ErrorCode.UPLOAD_FAILED]: 'Het uploaden van het bestand is mislukt.',
  
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: 'Je hebt onvoldoende rechten voor deze actie.',
  [ErrorCode.RESOURCE_UNAVAILABLE]: 'Deze resource is momenteel niet beschikbaar.',
  [ErrorCode.OPERATION_NOT_ALLOWED]: 'Deze actie is niet toegestaan.',
  
  [ErrorCode.PAYMENT_ERROR]: 'Er is een fout opgetreden bij de betaling.',
  [ErrorCode.EMAIL_SERVICE_ERROR]: 'Er is een fout opgetreden bij het versturen van de e-mail.',
  
  [ErrorCode.INTERNAL_ERROR]: 'Er is een interne fout opgetreden.',
  [ErrorCode.NETWORK_ERROR]: 'Er is een netwerkfout opgetreden.',
  [ErrorCode.UNKNOWN_ERROR]: 'Er is een onbekende fout opgetreden.'
};

// Error handling utilities
export class ErrorHandler {
  /**
   * Convert any error to a HuurlyError
   */
  static normalize(error: unknown): HuurlyError {
    if (error instanceof HuurlyError) {
      return error;
    }

    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes('JWT')) {
        return new AuthenticationError('Sessie verlopen. Log opnieuw in.');
      }

      if (error.message.includes('Network')) {
        return new HuurlyError(ErrorCode.NETWORK_ERROR, 'Netwerkfout. Controleer je internetverbinding.');
      }

      return new HuurlyError(ErrorCode.UNKNOWN_ERROR, error.message);
    }

    if (typeof error === 'string') {
      return new HuurlyError(ErrorCode.UNKNOWN_ERROR, error);
    }

    return new HuurlyError(ErrorCode.UNKNOWN_ERROR, 'Er is een onbekende fout opgetreden');
  }

  /**
   * Get user-friendly error message
   */
  static getUserMessage(error: unknown): string {
    const normalizedError = this.normalize(error);
    return ERROR_MESSAGES[normalizedError.code] || normalizedError.message;
  }

  /**
   * Log error for debugging
   */
  static log(error: unknown, context?: string): void {
    const normalizedError = this.normalize(error);
    
    console.error(`[${context || 'ERROR'}]`, {
      code: normalizedError.code,
      message: normalizedError.message,
      statusCode: normalizedError.statusCode,
      details: normalizedError.details,
      timestamp: normalizedError.timestamp,
      stack: normalizedError.stack
    });
  }

  /**
   * Handle Supabase/PostgreSQL errors
   */
  static handleDatabaseError(error: any): HuurlyError {
    if (!error) {
      return new HuurlyError(ErrorCode.DATABASE_ERROR, 'Onbekende database fout');
    }

    // Handle PostgreSQL error codes
    switch (error.code) {
      case '23505': // Unique constraint violation
        if (error.message?.includes('email')) {
          return new ConflictError('Dit e-mailadres is al in gebruik');
        }
        return new ConflictError('Deze waarde bestaat al in het systeem');

      case '23503': // Foreign key constraint violation
        return new HuurlyError(
          ErrorCode.FOREIGN_KEY_CONSTRAINT,
          'Gerelateerde gegevens ontbreken of zijn ongeldig',
          400
        );

      case '23514': // Check constraint violation
        return new ValidationError('De ingevoerde gegevens voldoen niet aan de vereisten');

      case '42P01': // Table does not exist
        return new HuurlyError(ErrorCode.DATABASE_ERROR, 'Database configuratiefout');

      case '42703': // Column does not exist
        return new HuurlyError(ErrorCode.DATABASE_ERROR, 'Database schema fout');

      default:
        // Handle Supabase specific errors
        if (error.message?.includes('JWT')) {
          return new AuthenticationError('Sessie verlopen. Log opnieuw in.');
        }

        if (error.message?.includes('Row not found')) {
          return new NotFoundError();
        }

        return new HuurlyError(
          ErrorCode.DATABASE_ERROR,
          error.message || 'Er is een database fout opgetreden'
        );
    }
  }

  /**
   * Create validation error with field details
   */
  static createValidationError(
    message: string,
    fieldErrors: Record<string, string[]>
  ): ValidationError {
    return new ValidationError(message, { fieldErrors });
  }

  /**
   * Create file upload error
   */
  static createFileUploadError(
    message: string,
    fileName?: string,
    maxSize?: number
  ): FileUploadError {
    const details: Record<string, any> = {};
    if (fileName) details.fileName = fileName;
    if (maxSize) details.maxSize = maxSize;

    return new FileUploadError(message, ErrorCode.UPLOAD_FAILED);
  }
}

// Export commonly used error creators
export const createError = {
  validation: (message: string, details?: Record<string, any>) => 
    new ValidationError(message, details),
  
  auth: (message?: string) => 
    new AuthenticationError(message),
  
  forbidden: (message?: string) => 
    new AuthorizationError(message),
  
  notFound: (resource?: string) => 
    new NotFoundError(resource),
  
  conflict: (message: string) => 
    new ConflictError(message),
  
  fileUpload: (message: string, code?: ErrorCode) => 
    new FileUploadError(message, code),
  
  database: (error: any) => 
    ErrorHandler.handleDatabaseError(error)
};
