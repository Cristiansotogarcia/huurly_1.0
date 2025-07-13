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
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  updatePassword: (password: string) => Promise<{ success: boolean; message?: string }>;
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
        
        // Check if this is an email verification
        const currentPath = window.location.pathname;
        const urlHash = window.location.hash;
        const searchParams = new URLSearchParams(window.location.search);
        const isEmailVerification = urlHash.includes('type=signup') || searchParams.get('type') === 'signup';
        
        // Don't auto-redirect if:
        // 1. User just logged out (prevent redirect loops)
        // 2. User is on specific auth pages
        // 3. This is an email verification (let the modal handle it)
        // 4. User is on payment page or payment success page
        const isOnAuthPage = ['/login', '/register'].includes(currentPath);
        const isOnPaymentPage = currentPath.includes('/payment') || searchParams.has('session_id');
        const isOnHomePage = currentPath === '/';
        
        // Check if user is already on their correct dashboard
        const expectedDashboard = `/${user.role}-dashboard`;
        const isOnCorrectDashboard = currentPath === expectedDashboard;
        
        const shouldRedirect = !isOnAuthPage && 
                              !isOnPaymentPage && 
                              !isEmailVerification && 
                              !isOnCorrectDashboard &&
                              (isOnHomePage || currentPath === '/login');
        
        if (shouldRedirect) {
          // Add a small delay to prevent rapid redirects
          setTimeout(() => {
            const targetPath = expectedDashboard;
            // Only redirect if we're not already navigating to the target
            if (window.location.pathname !== targetPath) {
              navigate(targetPath, { replace: true });
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

  const resetPassword = async (email: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const result = await authService.resetPassword(email);
      return result;
    } catch (error) {
      logger.error('Reset password error:', error);
      return {
        success: false,
        message: 'Er is een onverwachte fout opgetreden bij het versturen van de reset e-mail.'
      };
    }
  };

  const updatePassword = async (password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const result = await authService.updatePassword(password);
      return result;
    } catch (error) {
      logger.error('Update password error:', error);
      return {
        success: false,
        message: 'Er is een onverwachte fout opgetreden bij het bijwerken van het wachtwoord.'
      };
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword,
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