
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { authService } from '@/lib/auth';
import { logger } from '@/lib/logger';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  sessionValid: boolean;
  isRefreshing: boolean;
  lastSessionCheck: number;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  validateSession: () => Promise<boolean>;
  refreshSession: () => Promise<boolean>;
  initializeAuth: () => Promise<void>;
  setSessionValid: (valid: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      sessionValid: false,
      isRefreshing: false,
      lastSessionCheck: 0,
      
      login: (user: User) => {
        logger.info('AuthStore: User logged in', { userId: user.id, hasPayment: user.hasPayment });
        set({ 
          user, 
          isAuthenticated: true, 
          sessionValid: true,
          lastSessionCheck: Date.now()
        });
      },
      
      logout: () => {
        logger.info('AuthStore: User logged out');
        set({ 
          user: null, 
          isAuthenticated: false, 
          sessionValid: false,
          isRefreshing: false,
          lastSessionCheck: 0
        });
        localStorage.removeItem('auth-storage');
      },
      
      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...updates };
          logger.info('AuthStore: User updated', { updates, newHasPayment: updatedUser.hasPayment });
          set({ user: updatedUser });
        }
      },

      setSessionValid: (valid: boolean) => {
        set({ sessionValid: valid, lastSessionCheck: Date.now() });
      },

      validateSession: async () => {
        const state = get();
        
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        if (state.sessionValid && state.lastSessionCheck > fiveMinutesAgo) {
          return true;
        }

        try {
          logger.info('Validating user session...');
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            logger.error('Session validation error:', error);
            set({ sessionValid: false, lastSessionCheck: Date.now() });
            return false;
          }

          if (!session) {
            logger.warn('No active session found');
            set({ sessionValid: false, lastSessionCheck: Date.now() });
            return false;
          }

          const now = Math.floor(Date.now() / 1000);
          if (session.expires_at && session.expires_at < now) {
            logger.warn('Session has expired');
            set({ sessionValid: false, lastSessionCheck: Date.now() });
            return false;
          }

          set({ sessionValid: true, lastSessionCheck: Date.now() });
          
          if (session.user && (!state.user || state.user.id !== session.user.id)) {
            const user = await authService.mapSupabaseUserToUser(session.user);
            set({ user, isAuthenticated: true });
          }

          return true;
        } catch (error) {
          logger.error('Session validation failed:', error);
          set({ sessionValid: false, lastSessionCheck: Date.now() });
          return false;
        }
      },

      refreshSession: async () => {
        const state = get();
        
        if (state.isRefreshing) {
          return new Promise((resolve) => {
            const checkRefresh = () => {
              const currentState = get();
              if (!currentState.isRefreshing) {
                resolve(currentState.sessionValid);
              } else {
                setTimeout(checkRefresh, 100);
              }
            };
            checkRefresh();
          });
        }

        set({ isRefreshing: true });

        try {
          logger.info('Refreshing user session...');
          const { data, error } = await supabase.auth.refreshSession();
          
          if (error) {
            logger.error('Session refresh error:', error);
            set({ 
              sessionValid: false, 
              isRefreshing: false,
              lastSessionCheck: Date.now()
            });
            return false;
          }

          if (!data.session) {
            logger.warn('No session returned from refresh');
            set({ 
              sessionValid: false, 
              isRefreshing: false,
              lastSessionCheck: Date.now()
            });
            return false;
          }

          const user = await authService.mapSupabaseUserToUser(data.session.user);
          set({ 
            user,
            isAuthenticated: true,
            sessionValid: true, 
            isRefreshing: false,
            lastSessionCheck: Date.now()
          });

          logger.info('Session refreshed successfully');
          return true;
        } catch (error) {
          logger.error('Session refresh failed:', error);
          set({ 
            sessionValid: false, 
            isRefreshing: false,
            lastSessionCheck: Date.now()
          });
          return false;
        }
      },

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
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        sessionValid: state.sessionValid,
        lastSessionCheck: state.lastSessionCheck
      }),
    }
  )
);

// Initialize auth when store is created
useAuthStore.getState().initializeAuth();
