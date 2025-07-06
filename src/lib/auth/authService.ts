
import { supabase } from '../../integrations/supabase/client.ts';
import { User, UserRole } from '../../types/index.ts';
import { AuthError, User as SupabaseUser } from '@supabase/supabase-js';
import { logger } from '../logger.ts';
import { AuthResponse, SignUpData, SignInData } from './types.ts';
import { roleMapper } from './roleMapper.ts';
import { userMapper } from './userMapper.ts';
import { paymentChecker } from './paymentChecker.ts';

export class AuthService {
  /**
   * Sign up a new user with email and password
   */
  async signUp(data: SignUpData): Promise<AuthResponse> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
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
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        return { user: null, error };
      }

      if (authData.user) {
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
   * Reset password for a user
   */
  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/wachtwoord-herstellen`,
      });
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  }

  /**
   * Update user password
   */
  async updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
    try {
      console.log('AuthService.updatePassword - Starting password update...');
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      console.log('AuthService.updatePassword - Update completed, error:', error);
      
      if (error) {
        console.error('AuthService.updatePassword - Error from Supabase:', error);
        return { error };
      }
      
      console.log('AuthService.updatePassword - Password updated successfully');
      return { error: null };
    } catch (error) {
      console.error('AuthService.updatePassword - Catch error:', error);
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
