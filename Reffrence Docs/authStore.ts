
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { AuthState } from './auth/authTypes';
import { createAuthActions } from './auth/authActions';
import { createSessionManager } from './auth/sessionManager';
import { createAuthInitializer } from './auth/authInitializer';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      sessionValid: false,
      isRefreshing: false,
      lastSessionCheck: 0,
      isInPaymentFlow: false,
      paymentFlowStartTime: null,
      
      // Spread all the action methods from the separate modules
      ...createAuthActions(set, get),
      ...createSessionManager(set, get),
      ...createAuthInitializer(set, get),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        sessionValid: state.sessionValid,
        lastSessionCheck: state.lastSessionCheck,
        isInPaymentFlow: state.isInPaymentFlow,
        paymentFlowStartTime: state.paymentFlowStartTime
      }),
    }
  )
);

// Initialize auth when store is created
useAuthStore.getState().initializeAuth();
