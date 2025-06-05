import { useState, useEffect } from 'react';
import { User } from '@/types';
import { authService, SignUpData, SignInData } from '@/lib/auth';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { demoAuthService } from '@/lib/demoAuth';

export interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (data: SignUpData) => Promise<{ success: boolean; user?: User }>;
  signIn: (data: SignInData) => Promise<{ success: boolean; user?: User }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
}

export const useAuth = (): UseAuthReturn => {
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated, login, logout, updateUser } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          login(currentUser);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen to auth state changes (both Supabase and demo)
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      if (user) {
        login(user);
      } else {
        logout();
      }
      setIsLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [login, logout]);

  const signUp = async (data: SignUpData): Promise<{ success: boolean; user?: User }> => {
    setIsLoading(true);
    try {
      const { user: newUser, error } = await authService.signUp(data);
      
      if (error) {
        toast({
          title: "Registratie mislukt",
          description: error.message,
          variant: "destructive"
        });
        return { success: false };
      }

      if (newUser) {
        login(newUser);
        toast({
          title: "Registratie succesvol",
          description: "Controleer je e-mail voor verificatie."
        });
        return { success: true, user: newUser };
      }

      return { success: false };
    } catch (error) {
      console.error('Sign up error:', error);
      toast({
        title: "Registratie mislukt",
        description: "Er is een onverwachte fout opgetreden.",
        variant: "destructive"
      });
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (data: SignInData): Promise<{ success: boolean; user?: User }> => {
    setIsLoading(true);
    try {
      const { user: signedInUser, error } = await authService.signIn(data);
      
      if (error) {
        toast({
          title: "Inloggen mislukt",
          description: error.message,
          variant: "destructive"
        });
        return { success: false };
      }

      if (signedInUser) {
        login(signedInUser);
        toast({
          title: "Succesvol ingelogd",
          description: `Welkom terug, ${signedInUser.name}!`
        });
        return { success: true, user: signedInUser };
      }

      return { success: false };
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: "Inloggen mislukt",
        description: "Er is een onverwachte fout opgetreden.",
        variant: "destructive"
      });
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const { error } = await authService.signOut();
      
      if (error) {
        toast({
          title: "Uitloggen mislukt",
          description: error.message,
          variant: "destructive"
        });
      } else {
        logout();
        toast({
          title: "Succesvol uitgelogd",
          description: "Tot ziens!"
        });
      }
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Uitloggen mislukt",
        description: "Er is een onverwachte fout opgetreden.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await authService.resetPassword(email);
      
      if (error) {
        toast({
          title: "Wachtwoord reset mislukt",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Wachtwoord reset verzonden",
        description: "Controleer je e-mail voor instructies."
      });
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      toast({
        title: "Wachtwoord reset mislukt",
        description: "Er is een onverwachte fout opgetreden.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await authService.updatePassword(newPassword);
      
      if (error) {
        toast({
          title: "Wachtwoord wijzigen mislukt",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Wachtwoord gewijzigd",
        description: "Je wachtwoord is succesvol gewijzigd."
      });
      return true;
    } catch (error) {
      console.error('Update password error:', error);
      toast({
        title: "Wachtwoord wijzigen mislukt",
        description: "Er is een onverwachte fout opgetreden.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await authService.updateProfile(updates);
      
      if (error) {
        toast({
          title: "Profiel wijzigen mislukt",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }

      // Update local state
      updateUser(updates);
      
      toast({
        title: "Profiel gewijzigd",
        description: "Je profiel is succesvol gewijzigd."
      });
      return true;
    } catch (error) {
      console.error('Update profile error:', error);
      toast({
        title: "Profiel wijzigen mislukt",
        description: "Er is een onverwachte fout opgetreden.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
  };
};
