
import { supabase } from '@/integrations/supabase/client';
import { authService } from '@/lib/auth';
import { logger } from '@/lib/logger';

export const createAuthInitializer = (set: any, get: any) => ({
  initializeAuth: async () => {
    try {
      logger.info('Initializing authentication...');
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        logger.error('Auth initialization error:', error);
        set({ 
          user: null, 
          isAuthenticated: false, 
          sessionValid: false,
          lastSessionCheck: Date.now()
        });
        return;
      }

      if (session?.user) {
        const user = await authService.mapSupabaseUserToUser(session.user);
        set({ 
          user, 
          isAuthenticated: true, 
          sessionValid: true,
          lastSessionCheck: Date.now()
        });
        logger.info('Authentication initialized with existing session');
      } else {
        set({ 
          user: null, 
          isAuthenticated: false, 
          sessionValid: false,
          lastSessionCheck: Date.now()
        });
        logger.info('No existing session found');
      }

      // Set up auth state listener without async operations inside
      supabase.auth.onAuthStateChange((event, session) => {
        logger.info('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Use setTimeout to defer the async operation
          setTimeout(async () => {
            const user = await authService.mapSupabaseUserToUser(session.user);
            set({ 
              user, 
              isAuthenticated: true, 
              sessionValid: true,
              lastSessionCheck: Date.now()
            });
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          set({ 
            user: null, 
            isAuthenticated: false, 
            sessionValid: false,
            isRefreshing: false,
            lastSessionCheck: 0
          });
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Use setTimeout to defer the async operation
          setTimeout(async () => {
            const user = await authService.mapSupabaseUserToUser(session.user);
            set({ 
              user, 
              isAuthenticated: true, 
              sessionValid: true,
              lastSessionCheck: Date.now()
            });
          }, 0);
        }
      });

      // Set up automatic logout event listeners
      setupAutomaticLogout(get);

    } catch (error) {
      logger.error('Auth initialization failed:', error);
      set({ 
        user: null, 
        isAuthenticated: false, 
        sessionValid: false,
        lastSessionCheck: Date.now()
      });
    }
  },
});

const setupAutomaticLogout = (get: any) => {
  // Set up automatic logout on browser close
  const handleBeforeUnload = async () => {
    const currentState = get();
    if (currentState.isAuthenticated) {
      logger.info('Browser closing - logging out user automatically');
      try {
        await supabase.auth.signOut();
        currentState.logout();
      } catch (error) {
        logger.error('Error during automatic logout:', error);
        // Force logout even if Supabase call fails
        currentState.logout();
      }
    }
  };

  // Add event listener for browser close
  window.addEventListener('beforeunload', handleBeforeUnload);
  
  // Also handle page visibility change for better coverage
  const handleVisibilityChange = async () => {
    if (document.visibilityState === 'hidden') {
      const currentState = get();
      if (currentState.isAuthenticated) {
        logger.info('Page hidden - preparing for potential logout');
        // Don't logout immediately on hidden, but prepare for it
        setTimeout(async () => {
          if (document.visibilityState === 'hidden') {
            logger.info('Page remained hidden - logging out user');
            try {
              await supabase.auth.signOut();
              currentState.logout();
            } catch (error) {
              logger.error('Error during visibility-based logout:', error);
              currentState.logout();
            }
          }
        }, 5000); // Wait 5 seconds before logging out
      }
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
};
