
import { User } from '@/types';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  sessionValid: boolean;
  isRefreshing: boolean;
  lastSessionCheck: number;
  isInPaymentFlow: boolean;
  paymentFlowStartTime: number | null;
  isLoadingSubscription: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  validateSession: () => Promise<boolean>;
  refreshSession: () => Promise<boolean>;
  initializeAuth: () => Promise<void>;
  setSessionValid: (valid: boolean) => void;
  setPaymentFlow: (inFlow: boolean) => void;
  setLoadingSubscription: (loading: boolean) => void;
  refresh?: () => void; // Optional method to refresh auth state
}
