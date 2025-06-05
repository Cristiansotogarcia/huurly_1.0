import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/types';
import { AuthError, User as SupabaseUser } from '@supabase/supabase-js';
import { demoAuthService, DEMO_CREDENTIALS } from '@/lib/demoAuth';

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User | null;
  error: AuthError | null;
}

export class AuthService {
  /**
   * Map frontend role to database role
   */
  private mapRoleToDatabase(role: UserRole): 'Huurder' | 'Verhuurder' | 'Manager' {
    switch (role) {
      case 'huurder':
        return 'Huurder';
      case 'verhuurder':
        return 'Verhuurder';
      case 'beoordelaar':
      case 'beheerder':
        return 'Manager';
      default:
        return 'Huurder';
    }
  }

  /**
   * Map database role to frontend role
   */
  private mapRoleFromDatabase(dbRole: 'Huurder' | 'Verhuurder' | 'Manager'): UserRole {
    switch (dbRole) {
      case 'Huurder':
        return 'huurder';
      case 'Verhuurder':
        return 'verhuurder';
      case 'Manager':
        return 'beheerder'; // Default manager role
      default:
        return 'huurder';
    }
  }

  /**
   * Sign up a new user with email and password
   */
  async signUp(data: SignUpData): Promise<AuthResponse> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
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
        // Create user profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            first_name: data.firstName,
            last_name: data.lastName,
          });

        // Create user role with mapped database role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: this.mapRoleToDatabase(data.role),
            subscription_status: 'inactive',
          });

        if (profileError || roleError) {
          console.error('Profile creation error:', profileError || roleError);
        }

        const user = await this.mapSupabaseUserToUser(authData.user);
        return { user, error: null };
      }

      return { user: null, error: null };
    } catch (error) {
      return { user: null, error: error as AuthError };
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(data: SignInData): Promise<AuthResponse> {
    try {
      // First check if this is a demo credential
      const isDemoCredential = Object.values(DEMO_CREDENTIALS).some(
        cred => cred.email.toLowerCase() === data.email.toLowerCase()
      );

      if (isDemoCredential) {
        const result = await demoAuthService.login(data.email, data.password);
        if (result.success && result.user) {
          return { user: result.user, error: null };
        } else {
          return { 
            user: null, 
            error: { 
              message: result.error || 'Demo login failed',
              name: 'AuthError',
              status: 400
            } as AuthError 
          };
        }
      }

      // If not demo credential, try Supabase
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        return { user: null, error };
      }

      if (authData.user) {
        const user = await this.mapSupabaseUserToUser(authData.user);
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
      // Check if demo user is logged in
      const demoUser = demoAuthService.getCurrentUser();
      if (demoUser) {
        await demoAuthService.logout();
        return { error: null };
      }

      // Otherwise sign out from Supabase
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
        redirectTo: `${window.location.origin}/reset-password`,
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
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
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
      // First check for demo user
      const demoUser = demoAuthService.getCurrentUser();
      if (demoUser) {
        return demoUser;
      }

      // Then check Supabase
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        return await this.mapSupabaseUserToUser(user);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    // Listen to Supabase auth changes
    const supabaseSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await this.mapSupabaseUserToUser(session.user);
        callback(user);
      } else {
        // Only call callback with null if no demo user is logged in
        const demoUser = demoAuthService.getCurrentUser();
        if (!demoUser) {
          callback(null);
        }
      }
    });

    // Listen to demo auth changes
    const demoUnsubscribe = demoAuthService.addListener((user) => {
      callback(user);
    });

    // Return a combined unsubscribe function
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            supabaseSubscription.data.subscription.unsubscribe();
            demoUnsubscribe();
          }
        }
      }
    };
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

      // Update profile table
      const profileUpdates: any = {};
      if (updates.name) {
        const [firstName, ...lastNameParts] = updates.name.split(' ');
        profileUpdates.first_name = firstName;
        profileUpdates.last_name = lastNameParts.join(' ');
      }

      if (Object.keys(profileUpdates).length > 0) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('id', user.id);

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
    try {
      const { data, error } = await supabase
        .from('payment_records')
        .select('status')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error checking payment status:', error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking payment status:', error);
      return false;
    }
  }

  /**
   * Map Supabase user to our User type
   */
  private async mapSupabaseUserToUser(supabaseUser: SupabaseUser): Promise<User> {
    // Get user role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role, subscription_status')
      .eq('user_id', supabaseUser.id)
      .single();

    // Get profile data
    const { data: profileData } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', supabaseUser.id)
      .single();

    // Check payment status
    const hasPayment = await this.checkPaymentStatus(supabaseUser.id);

    const firstName = profileData?.first_name || supabaseUser.user_metadata?.first_name || '';
    const lastName = profileData?.last_name || supabaseUser.user_metadata?.last_name || '';
    const name = `${firstName} ${lastName}`.trim() || supabaseUser.email?.split('@')[0] || 'User';

    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      role: roleData?.role ? this.mapRoleFromDatabase(roleData.role) : 'huurder',
      name,
      avatar: supabaseUser.user_metadata?.avatar_url,
      isActive: supabaseUser.email_confirmed_at !== null,
      createdAt: supabaseUser.created_at,
      hasPayment,
    };
  }
}

// Export singleton instance
export const authService = new AuthService();
