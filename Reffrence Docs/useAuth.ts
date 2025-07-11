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