
import { supabase } from '../../integrations/supabase/client.ts';
import { User, UserRole } from '../../types/index.ts';
import { AuthError, User as SupabaseUser } from '@supabase/supabase-js';
import { logger } from '../logger.ts';
import { AuthResponse, SignUpData, SignInData } from './types.ts';
import { roleMapper } from './roleMapper.ts';
import { userMapper } from './userMapper.ts';
import { paymentChecker } from './paymentChecker.ts';
import { emailSchema, passwordSchema, registerSchema, loginSchema } from '../validation.ts';
import { rateLimiter } from './rateLimiter.ts';

export class AuthService {
  /**
   * Sign up a new user with email and password
   */
  async signUp(data: SignUpData): Promise<AuthResponse> {
    try {
      // Check rate limiting
      if (rateLimiter.isRateLimited(data.email, 'signup')) {
        const timeLeft = rateLimiter.getTimeUntilReset(data.email, 'signup');
        const error = new Error(`Te veel registratiepogingen. Probeer over ${Math.ceil(timeLeft / 60)} minuten opnieuw.`) as AuthError;
        error.status = 429;
        return { user: null, error };
      }

      // Basic validation for signup - only validate fields actually collected
      if (!data.email || !data.password || !data.firstName || !data.lastName) {
        const error = new Error('Alle velden zijn verplicht') as AuthError;
        error.status = 400;
        return { user: null, error };
      }

      // Validate email format
      const emailValidation = emailSchema.safeParse(data.email);
      if (!emailValidation.success) {
        const error = new Error(emailValidation.error.errors[0]?.message || 'Ongeldig e-mailadres') as AuthError;
        error.status = 400;
        return { user: null, error };
      }

      // Validate password strength
      const passwordValidation = passwordSchema.safeParse(data.password);
      if (!passwordValidation.success) {
        const error = new Error(passwordValidation.error.errors[0]?.message || 'Wachtwoord voldoet niet aan de eisen') as AuthError;
        error.status = 400;
        return { user: null, error };
      }
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/?type=signup`,
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            role: data.role,
          },
        },
      });

      if (authError) {
        return { user: null, error: authError };
      }

      if (authData.user) {
        // Use backend function to create user profile
        const { error: profileError } = await supabase.functions.invoke('register-user', {
          body: {
            id: authData.user.id,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            role: roleMapper.mapRoleToDatabase(data.role),
          },
        });

        if (profileError) {
          logger.error('Profile creation error:', profileError);
          const error = new Error(profileError.message) as AuthError;
          error.status = 400;
          return { user: null, error };
        }

        const user = await userMapper.mapSupabaseUserToUser(authData.user);
        return { user, error: null };
      }

      return { user: null, error: null };
    } catch (error) {
      logger.error('Sign up error:', error);
      return { user: null, error: error as AuthError };
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(data: SignInData): Promise<AuthResponse> {
    try {
      // Check rate limiting
      if (rateLimiter.isRateLimited(data.email, 'login')) {
        const timeLeft = rateLimiter.getTimeUntilReset(data.email, 'login');
        const error = new Error(`Te veel inlogpogingen. Probeer over ${Math.ceil(timeLeft / 60)} minuten opnieuw.`) as AuthError;
        error.status = 429;
        return { user: null, error };
      }

      // Validate input data using Zod schema
      const validationResult = loginSchema.safeParse({
        email: data.email,
        password: data.password
      });

      if (!validationResult.success) {
        const errorMessage = validationResult.error.errors[0]?.message || 'Invalid credentials';
        const error = new Error(errorMessage) as AuthError;
        error.status = 400;
        return { user: null, error };
      }
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        return { user: null, error };
      }

      if (authData.user) {
        // Reset rate limit on successful login
        rateLimiter.reset(data.email, 'login');
        const user = await userMapper.mapSupabaseUserToUser(authData.user);
        return { user, error: null };
      }

      return { user: null, error: null };
    } catch (error) {
      return { user: null, error: error as AuthError };
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  }







  /**
   * Get current user session
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        return await userMapper.mapSupabaseUserToUser(user);
      }
      
      return null;
    } catch (error) {
      logger.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await userMapper.mapSupabaseUserToUser(session.user);
        callback(user);
      } else {
        callback(null);
      }
    });
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<User>): Promise<{ error: Error | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { error: new Error('No authenticated user') };
      }

      // Update auth metadata if needed
      const authUpdates: any = {};
      if (updates.name) {
        const [firstName, ...lastNameParts] = updates.name.split(' ');
        authUpdates.data = {
          first_name: firstName,
          last_name: lastNameParts.join(' '),
        };
      }

      if (Object.keys(authUpdates).length > 0) {
        const { error: authError } = await supabase.auth.updateUser(authUpdates);
        if (authError) {
          return { error: authError };
        }
      }

      // Update profile table using UPSERT
      const profileUpdates: any = {};
      if (updates.name) {
        profileUpdates.naam = updates.name;
      }

      if (Object.keys(profileUpdates).length > 0) {
        const { error: profileError } = await supabase
          .from('gebruikers')
          .upsert({
            id: user.id,
            ...profileUpdates
          }, {
            onConflict: 'id'
          });

        if (profileError) {
          return { error: profileError };
        }
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Reset password for email
   */
  async resetPassword(email: string): Promise<{ success: boolean; message?: string }> {
    try {
      // Check rate limiting
      if (rateLimiter.isRateLimited(email, 'passwordReset')) {
        const timeLeft = rateLimiter.getTimeUntilReset(email, 'passwordReset');
        return {
          success: false,
          message: `Te veel reset verzoeken. Probeer over ${Math.ceil(timeLeft / 60)} minuten opnieuw.`
        };
      }

      // Validate email format
      const emailValidation = emailSchema.safeParse(email);
      if (!emailValidation.success) {
        return {
          success: false,
          message: 'Ongeldig e-mailadres'
        };
      }

      // Record the attempt
      rateLimiter.recordAttempt(email, 'passwordReset');

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/wachtwoord-herstellen`
      });

      if (error) {
        logger.error('Reset password error:', error);
        return {
          success: false,
          message: 'Er is een fout opgetreden bij het versturen van de reset e-mail.'
        };
      }

      return {
        success: true,
        message: 'Reset e-mail verzonden! Controleer uw inbox.'
      };
    } catch (error) {
      logger.error('Reset password error:', error);
      return {
        success: false,
        message: 'Er is een onverwachte fout opgetreden.'
      };
    }
  }

  /**
   * Update user password
   */
  async updatePassword(password: string): Promise<{ success: boolean; message?: string }> {
    try {
      // Validate password strength
      const passwordValidation = passwordSchema.safeParse(password);
      if (!passwordValidation.success) {
        return {
          success: false,
          message: passwordValidation.error.errors[0]?.message || 'Wachtwoord voldoet niet aan de eisen'
        };
      }

      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        logger.error('Update password error:', error);
        return {
          success: false,
          message: 'Er is een fout opgetreden bij het bijwerken van het wachtwoord.'
        };
      }

      return {
        success: true,
        message: 'Wachtwoord succesvol bijgewerkt!'
      };
    } catch (error) {
      logger.error('Update password error:', error);
      return {
        success: false,
        message: 'Er is een onverwachte fout opgetreden.'
      };
    }
  }

  /**
   * Check if user has valid payment/subscription
   */
  async checkPaymentStatus(userId: string): Promise<boolean> {
    return paymentChecker.checkPaymentStatus(userId);
  }

  /**
   * Map Supabase user to our User type
   */
  async mapSupabaseUserToUser(supabaseUser: SupabaseUser): Promise<User> {
    return userMapper.mapSupabaseUserToUser(supabaseUser);
  }
}
