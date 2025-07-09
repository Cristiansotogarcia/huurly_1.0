
import { supabase } from '@/integrations/supabase/client';
import { authService } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { User } from '@/types';

export const createAuthActions = (set: any, get: any) => ({
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
      lastSessionCheck: 0,
      isInPaymentFlow: false,
      paymentFlowStartTime: null
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
});
