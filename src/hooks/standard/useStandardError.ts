import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface ErrorOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  logToService?: boolean;
}

interface ErrorMessages {
  generic: string;
  network: string;
  unauthorized: string;
  notFound: string;
  validation: string;
  server: string;
  timeout: string;
  [key: string]: string;
}

// Standard error messages in Dutch
const DEFAULT_ERROR_MESSAGES: ErrorMessages = {
  generic: 'Er is een fout opgetreden. Probeer het later opnieuw.',
  network: 'Netwerkfout. Controleer uw internetverbinding.',
  unauthorized: 'U bent niet geautoriseerd om deze actie uit te voeren.',
  notFound: 'De gevraagde informatie kon niet worden gevonden.',
  validation: 'Er zijn validatiefouten. Controleer de ingevoerde gegevens.',
  server: 'Er is een serverfout opgetreden. Probeer het later opnieuw.',
  timeout: 'Het verzoek heeft te lang geduurd. Probeer het later opnieuw.',
};

/**
 * A standardized hook for error handling with consistent error messages and reporting
 * 
 * @param customMessages - Optional custom error messages to override defaults
 * @returns Object containing error state and error handling functions
 */
export function useStandardError(customMessages: Partial<ErrorMessages> = {}) {
  const [error, setError] = useState<Error | null>(null);
  const [errorType, setErrorType] = useState<string>('generic');
  
  // Merge default and custom error messages
  const errorMessages = { ...DEFAULT_ERROR_MESSAGES, ...customMessages };

  // Determine error type based on error object or status code
  const determineErrorType = (error: any): string => {
    if (!error) return 'generic';
    
    // Check for network errors
    if (!navigator.onLine || error.message?.includes('network') || error.message?.includes('Network')) {
      return 'network';
    }
    
    // Check for status code based errors
    const statusCode = error.status || error.statusCode || (error.response && error.response.status);
    
    if (statusCode) {
      if (statusCode === 401 || statusCode === 403) return 'unauthorized';
      if (statusCode === 404) return 'notFound';
      if (statusCode === 422 || statusCode === 400) return 'validation';
      if (statusCode >= 500) return 'server';
    }
    
    // Check for timeout
    if (error.message?.includes('timeout') || error.code === 'ECONNABORTED') {
      return 'timeout';
    }
    
    return 'generic';
  };

  // Handle error with options
  const handleError = useCallback((error: any, options: ErrorOptions = {}) => {
    const { 
      showToast = true, 
      logToConsole = true, 
      logToService = false 
    } = options;
    
    const errorObj = error instanceof Error ? error : new Error(String(error));
    const type = determineErrorType(error);
    
    setError(errorObj);
    setErrorType(type);
    
    // Show toast notification
    if (showToast) {
      toast({
        title: 'Fout',
        description: errorMessages[type] || errorMessages.generic,
        variant: 'destructive',
      });
    }
    
    // Log to console
    if (logToConsole) {
      console.error(`[${type.toUpperCase()}]`, errorObj);
    }
    
    // Log to external service (implement as needed)
    if (logToService) {
      // Example: logErrorToService(errorObj, type);
    }
    
    return { error: errorObj, type };
  }, [errorMessages]);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
    setErrorType('generic');
  }, []);

  // Get appropriate error message
  const getErrorMessage = useCallback((type: string = errorType) => {
    return errorMessages[type] || errorMessages.generic;
  }, [errorMessages, errorType]);

  return {
    error,
    errorType,
    errorMessage: getErrorMessage(),
    handleError,
    clearError,
    getErrorMessage,
  };
}

export default useStandardError;