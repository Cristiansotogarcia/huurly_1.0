
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export const setupConservativeLogout = (get: any) => {
  let isNavigatingWithinApp = false;
  let logoutTimer: NodeJS.Timeout | null = null;

  // Track internal navigation to prevent logout on app navigation
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function(...args) {
    isNavigatingWithinApp = true;
    setTimeout(() => { isNavigatingWithinApp = false; }, 1000);
    return originalPushState.apply(this, args);
  };
  
  history.replaceState = function(...args) {
    isNavigatingWithinApp = true;
    setTimeout(() => { isNavigatingWithinApp = false; }, 1000);
    return originalReplaceState.apply(this, args);
  };

  // Listen for popstate (back/forward navigation)
  window.addEventListener('popstate', () => {
    isNavigatingWithinApp = true;
    setTimeout(() => { isNavigatingWithinApp = false; }, 1000);
  });

  // Only logout on actual browser close, not on navigation or refresh
  const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    const currentState = get();
    
    // Don't logout if navigating within app
    if (isNavigatingWithinApp || !currentState.isAuthenticated) {
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
      // Clear any existing timer
      if (logoutTimer) {
        clearTimeout(logoutTimer);
      }
      
      // Only logout after a much longer period and if still hidden
      logoutTimer = setTimeout(() => {
        if (document.visibilityState === 'hidden' && !isNavigatingWithinApp) {
          const stillHiddenState = get();
          if (stillHiddenState.isAuthenticated) {
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
      }, 30000); // 30 seconds instead of 5 seconds
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
    if (logoutTimer) {
      clearTimeout(logoutTimer);
    }
  };
};
