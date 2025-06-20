import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface UseStandardQueryOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  errorMessage?: string;
  loadingDelay?: number;
  retryCount?: number;
  retryDelay?: number;
  enabled?: boolean;
}

/**
 * A standardized hook for data fetching with built-in loading, error handling, and retry logic
 * 
 * @param queryFn - The async function that fetches data
 * @param options - Configuration options for the query
 * @returns Object containing data, loading state, error, and refetch function
 */
export function useStandardQuery<T>(
  queryFn: () => Promise<T>,
  options: UseStandardQueryOptions<T> = {}
) {
  const {
    onSuccess,
    onError,
    errorMessage = 'Er is een fout opgetreden bij het ophalen van gegevens.',
    loadingDelay = 0,
    retryCount = 0,
    retryDelay = 1000,
    enabled = true,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [retries, setRetries] = useState<number>(0);
  const [shouldShowLoading, setShouldShowLoading] = useState<boolean>(false);

  const fetchData = async (isRetry = false) => {
    if (!enabled) return;
    
    if (!isRetry) {
      setLoading(true);
      setError(null);
      
      // Only show loading indicator after specified delay
      if (loadingDelay > 0) {
        setShouldShowLoading(false);
        const timer = setTimeout(() => {
          setShouldShowLoading(true);
        }, loadingDelay);
        
        return () => clearTimeout(timer);
      } else {
        setShouldShowLoading(true);
      }
    }

    try {
      const result = await queryFn();
      setData(result);
      setLoading(false);
      setShouldShowLoading(false);
      setRetries(0);
      if (onSuccess) onSuccess(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      
      if (retries < retryCount) {
        // Retry the query after delay
        setRetries((prev) => prev + 1);
        setTimeout(() => {
          fetchData(true);
        }, retryDelay);
      } else {
        setError(error);
        setLoading(false);
        setShouldShowLoading(false);
        
        // Show error toast
        toast({
          title: 'Fout',
          description: errorMessage,
          variant: 'destructive',
        });
        
        if (onError) onError(error);
      }
    }
  };

  useEffect(() => {
    if (enabled) {
      fetchData();
    }
    
    return () => {
      // Cleanup if needed
    };
  }, [enabled]);

  const refetch = () => {
    setRetries(0);
    fetchData();
  };

  return {
    data,
    loading: loading && shouldShowLoading,
    isLoading: loading,
    error,
    refetch,
  };
}

export default useStandardQuery;