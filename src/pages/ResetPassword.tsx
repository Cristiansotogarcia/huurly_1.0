import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { Loader2, ArrowLeft, Check, X, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { StandardModal } from '@/components/standard/StandardModal';
import { logger } from '@/lib/logger';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
    match: false,
  });
  const { updatePassword, signOut } = useAuth();
  const { setPasswordResetLock, logout } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // SECURITY FIX: Immediately set password reset lock and clear any existing sessions
    // This prevents race conditions where user gets logged in during password reset flow
    logger.info('ResetPassword: Setting password reset lock and clearing sessions');
    
    // Set the password reset lock to prevent any auth operations
    setPasswordResetLock(true);
    
    // Clear any existing authentication state to prevent conflicts
    logout();
    
    // Check if we have recovery tokens but aren't on the password reset page
    const urlHash = window.location.hash;
    const searchParams = new URLSearchParams(window.location.search);
    const hasRecoveryToken = 
      urlHash.includes('type=recovery') || 
      (urlHash.includes('access_token') && urlHash.includes('refresh_token')) ||
      searchParams.get('type') === 'recovery';
    
    // Cleanup function to clear the lock when component unmounts
    return () => {
      logger.info('ResetPassword: Clearing password reset lock on unmount');
      setPasswordResetLock(false);
    };
  }, [setPasswordResetLock, logout]);
  
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

    if (!validatePasswords()) {
      return;
    }

    setIsLoading(true);

    try {
      const success = await updatePassword(newPassword);

      if (success) {
        logger.info('ResetPassword: Password updated successfully, clearing lock and signing out');
        
        // Clear the password reset lock since the operation completed successfully
        setPasswordResetLock(false);
        
        if (
          window.location.hash.includes('access_token') ||
          window.location.hash.includes('type=recovery')
        ) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        setShowSuccessModal(true);
        await signOut();
      } else {
        toast({
          title: "Onverwacht resultaat",
          description: "Er is een onverwachte fout opgetreden. Probeer het opnieuw.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      logger.error('ResetPassword: Password update failed, clearing lock', error);
      
      // Clear the password reset lock since the operation failed
      setPasswordResetLock(false);
      
      // Enhanced error handling with user-friendly Dutch messages
      let errorTitle = "Wachtwoord wijzigen mislukt";
      let errorDescription = "Er is een fout opgetreden bij het wijzigen van je wachtwoord.";
      
      if (error?.message) {
        // Use the user-friendly error messages from authService
        if (error.message.includes('verlopen') || error.message.includes('gebruikt')) {
          errorTitle = "Herstellink verlopen";
          errorDescription = error.message + " Ga terug naar de inlogpagina en vraag een nieuwe herstellink aan.";
        } else if (error.message.includes('ongeldig') || error.message.includes('beschadigd')) {
          errorTitle = "Ongeldige herstellink";
          errorDescription = error.message + " Controleer of je de volledige link uit je e-mail hebt gebruikt.";
        } else if (error.message.includes('wachtwoord')) {
          errorTitle = "Wachtwoord probleem";
          errorDescription = error.message;
        } else {
          errorDescription = error.message;
        }
      } else {
        errorDescription += " Probeer het opnieuw of vraag een nieuwe herstellink aan.";
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
