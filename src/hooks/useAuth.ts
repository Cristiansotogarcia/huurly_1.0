import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/types';
import { authService, SignUpData, SignInData } from '@/lib/auth';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

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
  // Modal states
  showEmailConfirmationModal: boolean;
  showEmailVerificationSuccessModal: boolean;
  showPaymentSuccessModal: boolean;
  signupEmail: string;
  setShowEmailConfirmationModal: (show: boolean) => void;
  setShowEmailVerificationSuccessModal: (show: boolean) => void;
  setShowPaymentSuccessModal: (show: boolean) => void;
  handleEmailVerificationSuccess: () => void;
  handlePaymentSuccess: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [isLoading, setIsLoading] = useState(true);
  const [showEmailConfirmationModal, setShowEmailConfirmationModal] = useState(false);
  const [showEmailVerificationSuccessModal, setShowEmailVerificationSuccessModal] = useState(false);
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const { user, isAuthenticated, login, logout, updateUser } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isSigningOut = useRef(false);

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          login(currentUser);
        }
      } catch (error) {
         logger.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen to auth state changes
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      if (user) {
        // Don't process auth changes if we're in the middle of signing out
        if (isSigningOut.current) {
          return;
        }
        
        login(user);
        
        // Check if this is a password recovery session
        const currentPath = window.location.pathname;
        const urlHash = window.location.hash;
        const searchParams = new URLSearchParams(window.location.search);
        
        // More comprehensive recovery token detection
        const hasRecoveryToken = 
          urlHash.includes('type=recovery') || 
          urlHash.includes('access_token') && urlHash.includes('refresh_token') ||
          searchParams.get('type') === 'recovery' ||
          currentPath === '/wachtwoord-herstellen';
        
        // Check if this is an email verification
        const isEmailVerification = urlHash.includes('type=signup') || searchParams.get('type') === 'signup';
        
        // Don't auto-redirect if:
        // 1. User is on password reset page
        // 2. URL contains recovery tokens
        // 3. User just logged out (prevent redirect loops)
        // 4. User is on specific auth pages
        // 5. This is an email verification (let the modal handle it)
        // 6. User is on payment page or payment success page
        const isOnAuthPage = ['/wachtwoord-herstellen', '/login', '/register'].includes(currentPath);
        const isOnPaymentPage = currentPath.includes('/payment') || searchParams.has('session_id');
        const isOnHomePage = currentPath === '/';
        
        const shouldRedirect = !hasRecoveryToken && !isOnAuthPage && !isOnPaymentPage && isOnHomePage && !isEmailVerification;
        
        if (shouldRedirect) {
          setTimeout(() => {
            switch (user.role) {
              case 'huurder':
                navigate('/huurder-dashboard');
                break;
              case 'verhuurder':
                navigate('/verhuurder-dashboard');
                break;
              case 'beoordelaar':
                navigate('/beoordelaar-dashboard');
                break;
              case 'beheerder':
                navigate('/beheerder-dashboard');
                break;
            }
          }, 100);
        }
      } else {
        logout();
      }
      setIsLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [login, logout, navigate]);

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
        // Store the signup email and show confirmation modal
        setSignupEmail(data.email);
        setShowEmailConfirmationModal(true);
        return { success: true, user: newUser };
      }

      return { success: false };
    } catch (error) {
       logger.error('Sign up error:', error);
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
       logger.error('Sign in error:', error);
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
    isSigningOut.current = true;
    
    try {
      // Clear local state first to prevent redirect loops
      logout();
      
      const { error } = await authService.signOut();
      
      if (error) {
        toast({
          title: "Uitloggen mislukt",
          description: error.message,
          variant: "destructive"
        });
      } else {
        // Clear any recovery tokens from URL
        if (window.location.hash.includes('access_token') || window.location.hash.includes('type=recovery')) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        
        // Navigate to home page after successful logout
        navigate('/', { replace: true });
        toast({
          title: "Succesvol uitgelogd",
          description: "Tot ziens!"
        });
      }
    } catch (error) {
       logger.error('Sign out error:', error);
      toast({
        title: "Uitloggen mislukt",
        description: "Er is een onverwachte fout opgetreden.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      // Reset the signing out flag after a delay to ensure auth state changes have processed
      setTimeout(() => {
        isSigningOut.current = false;
      }, 1000);
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
       logger.error('Reset password error:', error);
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
    console.log('useAuth.updatePassword called with:', newPassword.length, 'chars');
    console.log('useAuth.updatePassword - Setting loading state...');
    setIsLoading(true);
    try {
      console.log('useAuth.updatePassword - Calling authService.updatePassword...');
      const { error } = await authService.updatePassword(newPassword);
      console.log('useAuth.updatePassword - authService.updatePassword result:', { error });
      
      if (error) {
        console.error('useAuth.updatePassword - Password update error:', error);
        let errorMessage = error.message;
        
        // Handle specific Supabase error messages
        if (error.message.includes('New password should be different from the old password')) {
          errorMessage = 'Het nieuwe wachtwoord moet anders zijn dan je huidige wachtwoord.';
        }
        
        console.log('useAuth.updatePassword - Showing error toast...');
        toast({
          title: "Wachtwoord wijzigen mislukt",
          description: errorMessage,
          variant: "destructive"
        });
        console.log('useAuth.updatePassword - Returning false due to error');
        return false;
      }

      console.log('useAuth.updatePassword - Password updated successfully, showing success toast...');
      toast({
        title: "Wachtwoord gewijzigd",
        description: "Je wachtwoord is succesvol gewijzigd."
      });
      console.log('useAuth.updatePassword - Returning true for success');
      return true;
    } catch (error) {
       console.error('useAuth.updatePassword - Catch error:', error);
       logger.error('Update password error:', error);
      console.log('useAuth.updatePassword - Showing catch error toast...');
      toast({
        title: "Wachtwoord wijzigen mislukt",
        description: "Er is een onverwachte fout opgetreden.",
        variant: "destructive"
      });
      console.log('useAuth.updatePassword - Returning false due to catch error');
      return false;
    } finally {
      console.log('useAuth.updatePassword - In finally block, setting loading to false');
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
       logger.error('Update profile error:', error);
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

  const handleEmailVerificationSuccess = () => {
    setShowEmailVerificationSuccessModal(true);
  };

  const handlePaymentSuccess = () => {
    // Add a small delay to ensure the modal shows properly
    setTimeout(() => {
      setShowPaymentSuccessModal(true);
    }, 100);
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
    showEmailConfirmationModal,
    showEmailVerificationSuccessModal,
    showPaymentSuccessModal,
    signupEmail,
    setShowEmailConfirmationModal,
    setShowEmailVerificationSuccessModal,
    setShowPaymentSuccessModal,
    handleEmailVerificationSuccess,
    handlePaymentSuccess
  };
};
