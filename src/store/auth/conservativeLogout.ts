
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export const setupConservativeLogout = (get: any) => {
  let isNavigatingWithinApp = false;
  let isUserInteracting = false;
  let logoutTimer: NodeJS.Timeout | null = null;

  // Check if user is in payment flow
  const isInPaymentFlow = () => {
    const state = get();
    if (!state.isInPaymentFlow) return false;
    
    // Auto-clear payment flow after 10 minutes (safety mechanism)
    const paymentFlowTimeout = 10 * 60 * 1000; // 10 minutes
    if (state.paymentFlowStartTime && (Date.now() - state.paymentFlowStartTime) > paymentFlowTimeout) {
      logger.info('Payment flow timeout reached, clearing payment flow state');
      state.setPaymentFlow(false);
      return false;
    }
    
    return true;
  };

  // Track internal navigation to prevent logout on app navigation
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function(...args) {
    isNavigatingWithinApp = true;
    setTimeout(() => { isNavigatingWithinApp = false; }, 2000); // Increased to 2 seconds
    return originalPushState.apply(this, args);
  };
  
  history.replaceState = function(...args) {
    isNavigatingWithinApp = true;
    setTimeout(() => { isNavigatingWithinApp = false; }, 2000); // Increased to 2 seconds
    return originalReplaceState.apply(this, args);
  };

  // Listen for popstate (back/forward navigation)
  window.addEventListener('popstate', () => {
    isNavigatingWithinApp = true;
    setTimeout(() => { isNavigatingWithinApp = false; }, 2000);
  });

  // Track user interactions to prevent logout during active use
  const trackUserInteraction = () => {
    isUserInteracting = true;
    setTimeout(() => { isUserInteracting = false; }, 5000); // 5 seconds after last interaction
  };

  // Add interaction listeners
  document.addEventListener('click', trackUserInteraction, true);
  document.addEventListener('keydown', trackUserInteraction, true);
  document.addEventListener('mousemove', trackUserInteraction, true);
  document.addEventListener('scroll', trackUserInteraction, true);

  // Only logout on actual browser close, not on navigation or refresh
  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    const currentState = get();
    
    // Don't logout if navigating within app or user is interacting
    if (isNavigatingWithinApp || isUserInteracting || !currentState.isAuthenticated) {
      return;
    }

    // Check if this is a refresh by looking at the event
    // Refreshes don't have a returnValue set by default
    if (event.returnValue === undefined || event.returnValue === '') {
      // This is likely a refresh, don't logout
      return;
    }

    // Only logout if user is actually closing browser/tab
    logger.info('Browser closing - logging out user automatically');
    try {
      // Use async approach since this is browser close
      setTimeout(async () => {
        await supabase.auth.signOut();
        currentState.logout();
      }, 0);
    } catch (error) {
      logger.error('Error during automatic logout:', error);
      currentState.logout();
    }
  };

  // Much more conservative visibility change handler
  const handleVisibilityChange = () => {
    const currentState = get();
    
    if (!currentState.isAuthenticated) return;

    if (document.visibilityState === 'hidden') {
      // NEVER logout if user is in payment flow
      if (isInPaymentFlow()) {
        logger.info('User in payment flow - skipping logout on visibility change');
        return;
      }

      // Don't logout if user is actively interacting or navigating
      if (isUserInteracting || isNavigatingWithinApp) {
        return;
      }

      // Clear any existing timer
      if (logoutTimer) {
        clearTimeout(logoutTimer);
      }
      
      // Only logout after a much longer period and if still hidden and not interacting
      logoutTimer = setTimeout(() => {
        // Double-check payment flow state before logout
        if (isInPaymentFlow()) {
          logger.info('Payment flow detected during logout timer - cancelling logout');
          return;
        }

        if (document.visibilityState === 'hidden' && !isNavigatingWithinApp && !isUserInteracting) {
          const stillHiddenState = get();
          if (stillHiddenState.isAuthenticated && !isInPaymentFlow()) {
            logger.info('Page hidden for extended period - logging out user');
            try {
              supabase.auth.signOut();
              stillHiddenState.logout();
            } catch (error) {
              logger.error('Error during visibility-based logout:', error);
              stillHiddenState.logout();
            }
          }
        }
      }, 120000); // Increased to 2 minutes instead of 30 seconds
    } else if (document.visibilityState === 'visible') {
      // Cancel logout if page becomes visible again
      if (logoutTimer) {
        clearTimeout(logoutTimer);
        logoutTimer = null;
      }
    }
  };

  // Add event listeners
  window.addEventListener('beforeunload', handleBeforeUnload);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Cleanup function (though it won't be called in this implementation)
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    document.removeEventListener('click', trackUserInteraction, true);
    document.removeEventListener('keydown', trackUserInteraction, true);
    document.removeEventListener('mousemove', trackUserInteraction, true);
    document.removeEventListener('scroll', trackUserInteraction, true);
    if (logoutTimer) {
      clearTimeout(logoutTimer);
    }
  };
};
