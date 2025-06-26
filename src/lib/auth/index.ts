
import { AuthService } from './authService.ts';

// Export types
export type { SignUpData, SignInData, AuthResponse } from './types.ts';

// Export singleton instance
export const authService = new AuthService();

