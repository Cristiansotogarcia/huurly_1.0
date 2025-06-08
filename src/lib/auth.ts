
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/types';
import { AuthError, User as SupabaseUser } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
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
  private mapRoleToDatabase(role: UserRole): 'Huurder' | 'Verhuurder' | 'Beheerder' | 'Beoordelaar' {
    switch (role) {
      case 'huurder':
        return 'Huurder';
      case 'verhuurder':
        return 'Verhuurder';
      case 'beoordelaar':
        return 'Beoordelaar';
      case 'beheerder':
        return 'Beheerder';
      default:
        return 'Huurder';
    }
  }

  /**
   * Map database role to frontend role
   */
  private mapRoleFromDatabase(dbRole: string, email?: string): UserRole {
     logger.info('Mapping database role:', dbRole, 'for email:', email);
    
    switch (dbRole) {
      case 'Huurder':
        return 'huurder';
      case 'Verhuurder':
        return 'verhuurder';
      case 'Beoordelaar':
        return 'beoordelaar';
      case 'Beheerder':
        return 'beheerder';
      default:
        // Fallback logic based on email if role is unclear
        if (email) {
          if (email.includes('@beoordelaar.') || email.includes('bert@')) {
            return 'beoordelaar';
          }
          if (email.includes('admin') || email.includes('beheerder') || email.includes('@huurly.nl')) {
            return 'beheerder';
          }
          if (email.includes('verhuurder') || email.includes('landlord')) {
            return 'verhuurder';
          }
        }
         logger.warn('Unknown database role:', dbRole, 'defaulting to huurder');
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
           logger.error('Profile creation error:', profileError || roleError);
          // Convert to AuthError format
          const errorMessage = (profileError || roleError)?.message || 'Profile creation failed';
          const authError: AuthError = {
            message: errorMessage,
            status: 400,
            __isAuthError: true as const
          };
          return { user: null, error: authError };
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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        return await this.mapSupabaseUserToUser(user);
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
        const user = await this.mapSupabaseUserToUser(session.user);
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
         logger.error('Error checking payment status:', error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
       logger.error('Error checking payment status:', error);
      return false;
    }
  }

  /**
   * Map Supabase user to our User type
   */
  private async mapSupabaseUserToUser(supabaseUser: SupabaseUser): Promise<User> {
    try {
      // Get user role with better error handling
       logger.info('Fetching role for user:', supabaseUser.email);
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role, subscription_status')
        .eq('user_id', supabaseUser.id)
        .single();

      if (roleError) {
         logger.error('Error fetching user role:', roleError);
        // If we can't get the role, create a default one
        await this.createDefaultRole(supabaseUser.id, supabaseUser.email);
      }

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

      // Map the role with fallback
      const dbRole = roleData?.role || this.determineRoleFromEmail(supabaseUser.email);
      const mappedRole = this.mapRoleFromDatabase(dbRole, supabaseUser.email);

       logger.info('Auth mapping - Email:', supabaseUser.email, 'DB Role:', dbRole, 'Mapped Role:', mappedRole);

      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        role: mappedRole,
        name,
        avatar: supabaseUser.user_metadata?.avatar_url,
        isActive: supabaseUser.email_confirmed_at !== null,
        createdAt: supabaseUser.created_at,
        hasPayment,
      };
    } catch (error) {
       logger.error('Error mapping user:', error);
      // Fallback mapping in case of any errors
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        role: this.determineRoleFromEmail(supabaseUser.email),
        name: supabaseUser.email?.split('@')[0] || 'User',
        avatar: supabaseUser.user_metadata?.avatar_url,
        isActive: supabaseUser.email_confirmed_at !== null,
        createdAt: supabaseUser.created_at,
        hasPayment: false,
      };
    }
  }

  /**
   * Determine role from email address
   */
  private determineRoleFromEmail(email?: string): UserRole {
    if (!email) return 'huurder';
    
    const lowerEmail = email.toLowerCase();
    
    if (lowerEmail.includes('@beoordelaar.') || lowerEmail.includes('bert@')) {
      return 'beoordelaar';
    }
    
    if (lowerEmail.includes('admin') || lowerEmail.includes('beheerder') || lowerEmail.includes('@huurly.nl')) {
      return 'beheerder';
    }
    
    if (lowerEmail.includes('verhuurder') || lowerEmail.includes('landlord')) {
      return 'verhuurder';
    }
    
    return 'huurder';
  }

  /**
   * Create default role for user if none exists
   */
  private async createDefaultRole(userId: string, email?: string): Promise<void> {
    try {
      const role = this.determineRoleFromEmail(email);
      const dbRole = this.mapRoleToDatabase(role);
      
       logger.info('Creating default role for user:', email, 'Role:', dbRole);
      
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: dbRole,
          subscription_status: 'inactive',
        });

      if (error) {
         logger.error('Error creating default role:', error);
      }
    } catch (error) {
       logger.error('Error in createDefaultRole:', error);
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
