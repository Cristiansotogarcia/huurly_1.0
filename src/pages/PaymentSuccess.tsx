
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user, login } = useAuthStore();
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      logger.error('No session_id found in payment success URL');
      setVerificationStatus('failed');
      return;
    }

    if (!user) {
      logger.error('No user found during payment verification');
      setVerificationStatus('failed');
      return;
    }

    logger.info('Starting payment verification for session:', sessionId);

    const verifyPayment = async () => {
      const maxAttempts = 15; // 15 attempts over ~30 seconds
      const baseDelay = 1000; // Start with 1 second
      let currentAttempt = 0;

      const attemptVerification = async (): Promise<boolean> => {
        currentAttempt++;
        setAttempts(currentAttempt);
        
        try {
          logger.info(`Payment verification attempt ${currentAttempt}/${maxAttempts}`);
          
          // Re-fetch user data from the backend
          const refreshedUser = await authService.getCurrentUser();
          
          if (refreshedUser && refreshedUser.hasPayment) {
            logger.info('Payment verification successful');
            
            // Update the auth store with the refreshed user data
            login(refreshedUser);
            
            // Set success status and show toast
            setVerificationStatus('success');
            toast({
              title: 'Betaling succesvol!',
              description: 'Je account is nu actief. Welkom bij Huurly!',
            });
            
            // Wait a moment to show the success state, then redirect
            setTimeout(() => {
              navigate('/huurder-dashboard', { replace: true });
            }, 2000);
            
            return true;
          }
          
          // If we haven't reached max attempts, try again
          if (currentAttempt < maxAttempts) {
            // Exponential backoff with jitter
            const delay = Math.min(baseDelay * Math.pow(1.3, currentAttempt), 3000);
            const jitter = Math.random() * 500;
            
            setTimeout(attemptVerification, delay + jitter);
            return false;
          } else {
            // Max attempts reached
            logger.error('Payment verification failed after maximum attempts');
            setVerificationStatus('failed');
            toast({
              title: 'Verificatie mislukt',
              description: 'We konden je betaling niet verifiëren. Probeer opnieuw in te loggen of neem contact op met support.',
              variant: 'destructive',
            });
            return false;
          }
        } catch (error) {
          logger.error('Error during payment verification:', error);
          
          if (currentAttempt < maxAttempts) {
            const delay = baseDelay * Math.pow(1.5, currentAttempt);
            setTimeout(attemptVerification, delay);
            return false;
          } else {
            setVerificationStatus('failed');
            toast({
              title: 'Verificatie fout',
              description: 'Er is een fout opgetreden tijdens verificatie. Probeer het later opnieuw.',
              variant: 'destructive',
            });
            return false;
          }
        }
      };

      // Start the verification process
      attemptVerification();
    };

    verifyPayment();
  }, [searchParams, user, login, toast, navigate]);

  const handleRetryVerification = () => {
    setVerificationStatus('verifying');
    setAttempts(0);
    window.location.reload();
  };

  const handleGoToDashboard = () => {
    navigate('/huurder-dashboard', { replace: true });
  };

  const handleContactSupport = () => {
    toast({
      title: 'Contact Support',
      description: 'Neem contact op via info@huurly.nl voor ondersteuning.',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            {verificationStatus === 'verifying' && (
              <>
                <Loader2 className="w-16 h-16 mx-auto mb-4 text-dutch-blue animate-spin" />
                <h2 className="text-xl font-semibold mb-2">Betaling verifiëren...</h2>
                <p className="text-gray-600 mb-4">
                  Even geduld, we controleren je betalingsstatus.
                </p>
                <p className="text-sm text-gray-500">
                  Poging {attempts} van 15
                </p>
              </>
            )}

            {verificationStatus === 'success' && (
              <>
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <h2 className="text-xl font-semibold mb-2 text-green-700">Betaling succesvol!</h2>
                <p className="text-gray-600 mb-4">
                  Je account is nu actief. Je wordt doorgestuurd naar je dashboard...
                </p>
              </>
            )}

            {verificationStatus === 'failed' && (
              <>
                <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                <h2 className="text-xl font-semibold mb-2 text-red-700">Verificatie mislukt</h2>
                <p className="text-gray-600 mb-6">
                  We konden je betaling niet verifiëren. Dit kan enkele minuten duren.
                </p>
                <div className="space-y-3">
                  <Button 
                    onClick={handleRetryVerification}
                    className="w-full bg-dutch-blue hover:bg-blue-700"
                  >
                    Opnieuw proberen
                  </Button>
                  <Button 
                    onClick={handleGoToDashboard}
                    variant="outline"
                    className="w-full"
                  >
                    Ga naar dashboard
                  </Button>
                  <Button 
                    onClick={handleContactSupport}
                    variant="ghost"
                    className="w-full text-sm"
                  >
                    Contact support
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
