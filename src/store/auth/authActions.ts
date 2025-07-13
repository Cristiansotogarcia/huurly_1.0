
import { supabase } from '@/integrations/supabase/client';
import { authService } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { User } from '@/types';
import { optimizedSubscriptionService } from '@/services/OptimizedSubscriptionService';

export const createAuthActions = (set: any, get: any) => ({
  login: (user: User) => {
    const state = get();
    
    // Check if password reset is active - if so, prevent login
    if (state.isPasswordResetActive && state.isPasswordResetActive()) {
      logger.warn('AuthStore: Login blocked due to active password reset flow', { userId: user.id });
      return;
    }
    
    logger.info('AuthStore: User logged in', { userId: user.id, hasPayment: user.hasPayment });
    
    // Clear all subscription cache to ensure fresh data for all users
    optimizedSubscriptionService.clearAllCache();
    
    set({ 
      user, 
      isAuthenticated: true, 
      sessionValid: true,
      lastSessionCheck: Date.now(),
      isLoadingSubscription: false
    });
  },
  
  logout: () => {
    logger.info('AuthStore: User logged out');
    set({ 
      user: null, 
      isAuthenticated: false, 
      sessionValid: false,
      isRefreshing: false,
      lastSessionCheck: 0,
      isInPaymentFlow: false,
      paymentFlowStartTime: null,
      isPasswordResetLocked: false,
      passwordResetLockTime: null
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

  setPaymentFlow: (inFlow: boolean) => {
    logger.info('AuthStore: Payment flow state changed', { inFlow });
    set({ 
      isInPaymentFlow: inFlow,
      paymentFlowStartTime: inFlow ? Date.now() : null
    });
  },

  setLoadingSubscription: (loading: boolean) => {
    set({ isLoadingSubscription: loading });
  },


});
