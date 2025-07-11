import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, ArrowLeft, Check, X, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { StandardModal } from '@/components/standard/StandardModal';
import { supabase } from '@/integrations/supabase/client';

const ResetPassword = () => {
  console.log('ResetPassword component is loading...');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [passwordError, setPasswordError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [recoveryTokens, setRecoveryTokens] = useState<{accessToken: string, refreshToken: string} | null>(null);
  
  // Debug state changes
  console.log('ResetPassword - Current state:', {
    isLoading,
    showSuccessModal,
    passwordError,
    newPasswordLength: newPassword.length,
    confirmPasswordLength: confirmPassword.length
  });
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
    match: false
  });
  const { updatePassword, updatePasswordWithRecoveryToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();


  // Check if we have a valid recovery token in the URL and handle security properly
  useEffect(() => {
    const checkAccess = async () => {
      console.log('ResetPassword - Checking access...');
      console.log('ResetPassword - Full URL:', window.location.href);
      console.log('ResetPassword - Hash:', location.hash);
      console.log('ResetPassword - Search:', location.search);
      
      // Check if we have recovery parameters in the URL and extract tokens
      const hash = window.location.hash;
      const searchParams = new URLSearchParams(window.location.search);
      
      // Extract tokens from URL hash
      let accessToken = '';
      let refreshToken = '';
      
      if (hash) {
        const hashParams = new URLSearchParams(hash.substring(1));
        accessToken = hashParams.get('access_token') || '';
        refreshToken = hashParams.get('refresh_token') || '';
      }
      
      // Also check search params as fallback
      if (!accessToken) {
        accessToken = searchParams.get('access_token') || '';
        refreshToken = searchParams.get('refresh_token') || '';
      }
      
      // Check if we have valid recovery tokens
      const hasRecoveryToken = 
        (hash && hash.includes('type=recovery')) ||
        (accessToken && refreshToken) ||
        searchParams.get('type') === 'recovery';
      
      if (hasRecoveryToken && accessToken && refreshToken) {
        console.log('ResetPassword - Recovery tokens found in URL');
        
        // Store the tokens for later use
        setRecoveryTokens({ accessToken, refreshToken });
        
        // SECURITY FIX: Immediately sign out any authenticated user
        // This prevents the security vulnerability where users are auto-logged in
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            console.log('ResetPassword - Found active session, signing out for security');
            await supabase.auth.signOut();
            console.log('ResetPassword - User signed out successfully');
          }
        } catch (error) {
          console.error('ResetPassword - Error checking/clearing session:', error);
        }
        
        console.log('ResetPassword - Access granted for password reset');
        setIsCheckingToken(false);
        return;
      }
      
      // If no URL token, deny access for security
      console.log('ResetPassword - No recovery token found, denying access');
      toast({
        title: "Ongeldige toegang",
        description: "Deze pagina kan alleen worden geopend via een wachtwoord reset link uit uw e-mail.",
        variant: "destructive"
      });
      navigate('/');
    };

    checkAccess();
  }, [location, navigate, toast]);
  
  // Update password strength indicators as user types
  useEffect(() => {
    setPasswordStrength({
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      special: /[^A-Za-z0-9]/.test(newPassword),
      match: newPassword === confirmPassword && newPassword !== ''
    });
  }, [newPassword, confirmPassword]);

  const validatePasswords = () => {
    if (newPassword.length < 8) {
      setPasswordError('Wachtwoord moet minimaal 8 tekens bevatten');
      return false;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setPasswordError('Wachtwoord moet minimaal 1 hoofdletter bevatten');
      return false;
    }
    if (!/[a-z]/.test(newPassword)) {
      setPasswordError('Wachtwoord moet minimaal 1 kleine letter bevatten');
      return false;
    }
    if (!/[0-9]/.test(newPassword)) {
      setPasswordError('Wachtwoord moet minimaal 1 cijfer bevatten');
      return false;
    }
    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      setPasswordError('Wachtwoord moet minimaal 1 speciaal teken bevatten');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Wachtwoorden komen niet overeen');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('ResetPassword - Form submitted');
    
    if (!validatePasswords()) {
      console.log('ResetPassword - Password validation failed');
      return;
    }
    
    console.log('ResetPassword - Password validation passed');
    console.log('ResetPassword - Setting loading to true...');
    setIsLoading(true);

    try {
      console.log('ResetPassword - Starting password update...');
      console.log('ResetPassword - Recovery tokens available:', !!recoveryTokens);
      
      let success;
      
      if (recoveryTokens) {
        console.log('ResetPassword - Using recovery token method');
        success = await updatePasswordWithRecoveryToken(
          newPassword,
          recoveryTokens.accessToken,
          recoveryTokens.refreshToken
        );
      } else {
        console.log('ResetPassword - Using regular update method');
        success = await updatePassword(newPassword);
      }
      
      console.log('ResetPassword - Password update completed');
      console.log('ResetPassword - Password update result:', success);
      console.log('ResetPassword - Type of success:', typeof success);
      
      if (success === true) {
        console.log('ResetPassword - SUCCESS = TRUE, password updated successfully');
        
        // Clear recovery tokens from URL
        if (window.location.hash.includes('access_token') || window.location.hash.includes('type=recovery')) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        
        // Clear stored recovery tokens
        setRecoveryTokens(null);
        
        console.log('ResetPassword - Showing success modal');
        setShowSuccessModal(true);
        
      } else {
        console.log('ResetPassword - SUCCESS WAS NOT TRUE:', success);
        toast({
          title: "Unexpected result",
          description: `Password update returned: ${success}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('ResetPassword - Caught error in handleSubmit:', error);
      console.error('ResetPassword - Error type:', typeof error);
      console.error('ResetPassword - Error stringified:', JSON.stringify(error));
      
      toast({
        title: "Wachtwoord wijzigen mislukt",
        description: "Er is een fout opgetreden bij het wijzigen van je wachtwoord. Probeer het opnieuw.",
        variant: "destructive"
      });
    } finally {
      console.log('ResetPassword - In finally block, setting loading to false...');
      setIsLoading(false);
      console.log('ResetPassword - Loading set to false');
    }
  };

  // Helper component for password requirements
  const PasswordRequirement = ({ met, label }: { met: boolean; label: string }) => (
    <div className="flex items-center space-x-2">
      {met ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-gray-300" />
      )}
      <span className={`text-sm ${met ? 'text-green-500' : 'text-gray-500'}`}>{label}</span>
    </div>
  );

  if (isCheckingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-gray-600">Valideren van reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Nieuw wachtwoord instellen</h1>
          <p className="text-gray-600 mt-2">Voer je nieuwe wachtwoord in</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-password">Nieuw wachtwoord</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="••••••••"
                aria-describedby="password-requirements"
                aria-invalid={passwordError ? 'true' : 'false'}
              />
              
              <div id="password-requirements" className="mt-2 space-y-1">
                <PasswordRequirement met={passwordStrength.length} label="Minimaal 8 tekens" />
                <PasswordRequirement met={passwordStrength.uppercase} label="Minimaal 1 hoofdletter" />
                <PasswordRequirement met={passwordStrength.lowercase} label="Minimaal 1 kleine letter" />
                <PasswordRequirement met={passwordStrength.number} label="Minimaal 1 cijfer" />
                <PasswordRequirement met={passwordStrength.special} label="Minimaal 1 speciaal teken" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="confirm-password">Bevestig wachtwoord</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                aria-invalid={passwordError ? 'true' : 'false'}
              />
              {confirmPassword && (
                <div className="mt-1">
                  <PasswordRequirement met={passwordStrength.match} label="Wachtwoorden komen overeen" />
                </div>
              )}
            </div>

            {passwordError && (
              <p className="text-sm text-red-500" role="alert">{passwordError}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Wachtwoord wijzigen...
              </>
            ) : (
            'Wachtwoord wijzigen'
          )}
        </Button>
        
          
          <div className="text-center mt-4">
            <Link to="/" className="text-sm text-primary flex items-center justify-center">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Terug naar inloggen
            </Link>
          </div>
        </form>
      </div>
      
      <StandardModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Wachtwoord succesvol gewijzigd"
        description="Je wachtwoord is succesvol gewijzigd. Log nu in met je nieuwe wachtwoord."
        primaryAction={{
          label: "Ga naar Inloggen",
          onClick: () => navigate('/login')
        }}
        size="md"
        closeOnClickOutside={false}
      >
        <div className="flex items-center justify-center py-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
      </StandardModal>
    </div>
  );
};

export default ResetPassword;
