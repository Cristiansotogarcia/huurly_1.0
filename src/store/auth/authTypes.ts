
import { User } from '@/types';

export interface AuthState {
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
  refresh?: () => void; // Optional method to refresh auth state
}
