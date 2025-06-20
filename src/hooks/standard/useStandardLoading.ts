import { useState, useEffect, useCallback } from 'react';

interface UseStandardLoadingOptions {
  initialState?: boolean;
  minLoadingTime?: number;
  delayedStart?: number;
}

/**
 * A standardized hook for managing loading states with minimum display time and delayed start
 * 
 * @param options - Configuration options for loading behavior
 * @returns Object containing loading state and functions to control it
 */
export function useStandardLoading(options: UseStandardLoadingOptions = {}) {
  const {
    initialState = false,
    minLoadingTime = 0,
    delayedStart = 0,
  } = options;

  const [loading, setLoading] = useState<boolean>(initialState);
  const [visibleLoading, setVisibleLoading] = useState<boolean>(initialState && delayedStart === 0);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(initialState ? Date.now() : null);
  const [loadingTimer, setLoadingTimer] = useState<NodeJS.Timeout | null>(null);
  const [delayTimer, setDelayTimer] = useState<NodeJS.Timeout | null>(null);

  // Start loading with minimum display time
  const startLoading = useCallback(() => {
    // Clear any existing timers
    if (loadingTimer) clearTimeout(loadingTimer);
    if (delayTimer) clearTimeout(delayTimer);
    
    setLoading(true);
    setLoadingStartTime(Date.now());
    
    // If there's a delayed start, set up timer for visible loading
    if (delayedStart > 0) {
      setVisibleLoading(false);
      const timer = setTimeout(() => {
        setVisibleLoading(true);
      }, delayedStart);
      setDelayTimer(timer);
    } else {
      setVisibleLoading(true);
    }
  }, [delayedStart]);

  // Stop loading with respect to minimum display time
  const stopLoading = useCallback(() => {
    if (loadingTimer) clearTimeout(loadingTimer);
    if (delayTimer) clearTimeout(delayTimer);
    
    // If minimum loading time is set and we're currently loading
    if (minLoadingTime > 0 && loadingStartTime) {
      const elapsedTime = Date.now() - loadingStartTime;
      
      if (elapsedTime < minLoadingTime) {
        // Keep loading visible for the remaining time
        const remainingTime = minLoadingTime - elapsedTime;
        const timer = setTimeout(() => {
          setLoading(false);
          setVisibleLoading(false);
          setLoadingStartTime(null);
        }, remainingTime);
        setLoadingTimer(timer);
      } else {
        // Minimum time already elapsed, stop immediately
        setLoading(false);
        setVisibleLoading(false);
        setLoadingStartTime(null);
      }
    } else {
      // No minimum time, stop immediately
      setLoading(false);
      setVisibleLoading(false);
      setLoadingStartTime(null);
    }
  }, [minLoadingTime, loadingStartTime]);

  // Toggle loading state
  const toggleLoading = useCallback(() => {
    if (loading) {
      stopLoading();
    } else {
      startLoading();
    }
  }, [loading, startLoading, stopLoading]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (loadingTimer) clearTimeout(loadingTimer);
      if (delayTimer) clearTimeout(delayTimer);
    };
  }, [loadingTimer, delayTimer]);

  return {
    loading,            // Actual loading state (may not be visible yet)
    isLoading: loading, // Alias for loading
    visibleLoading,     // Whether loading indicator should be visible (respects delayed start)
    startLoading,
    stopLoading,
    toggleLoading,
  };
}

export default useStandardLoading;