
import { AuthService } from './authService.ts';

// Export types
export type { SignUpData, SignInData, AuthResponse } from './types.ts';

// Export both the class and the singleton instance
export { AuthService };
export const authService = new AuthService();
