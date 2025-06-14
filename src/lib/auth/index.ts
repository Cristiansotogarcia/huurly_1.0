
import { AuthService } from './authService';

// Export types
export type { SignUpData, SignInData, AuthResponse } from './types';

// Export singleton instance
export const authService = new AuthService();

// Export the AuthService class for testing
export { AuthService };
