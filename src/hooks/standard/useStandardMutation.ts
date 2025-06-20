import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface UseStandardMutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  onSettled?: (data: TData | null, error: Error | null, variables: TVariables) => void;
  successMessage?: string;
  errorMessage?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

/**
 * A standardized hook for data mutations with built-in loading and error handling
 * 
 * @param mutationFn - The async function that performs the mutation
 * @param options - Configuration options for the mutation
 * @returns Object containing mutate function, loading state, and error
 */
export function useStandardMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseStandardMutationOptions<TData, TVariables> = {}
) {
  const {
    onSuccess,
    onError,
    onSettled,
    successMessage = 'Wijzigingen zijn succesvol opgeslagen.',
    errorMessage = 'Er is een fout opgetreden bij het verwerken van uw verzoek.',
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (variables: TVariables): Promise<TData | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await mutationFn(variables);
      setData(result);
      setLoading(false);
      
      if (showSuccessToast) {
        toast({
          title: 'Succes',
          description: successMessage,
          variant: 'default',
        });
      }
      
      if (onSuccess) onSuccess(result, variables);
      if (onSettled) onSettled(result, null, variables);
      
      return result;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      setLoading(false);
      
      if (showErrorToast) {
        toast({
          title: 'Fout',
          description: errorMessage,
          variant: 'destructive',
        });
      }
      
      if (onError) onError(errorObj, variables);
      if (onSettled) onSettled(null, errorObj, variables);
      
      return null;
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
  };

  return {
    mutate,
    loading,
    error,
    data,
    reset,
  };
}

export default useStandardMutation;