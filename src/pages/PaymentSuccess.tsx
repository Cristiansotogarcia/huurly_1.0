
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuthStore();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Check if this is a payment success callback
        const sessionId = searchParams.get('session_id');
        
        if (sessionId) {
          console.log('Processing payment success for session:', sessionId);
          
          // Show success message
          toast({
            title: 'Betaling succesvol!',
            description: 'Je account is nu actief. Welkom bij Huurly!',
          });
        }

        // Refresh user data to get updated payment status
        const refreshedUser = await authService.getCurrentUser();
        if (refreshedUser) {
          login(refreshedUser);
        }

        // Mark that payment success popup has been shown
        localStorage.setItem('hasShownPaymentSuccessPopup', 'true');

        // Wait a moment for the user to see the success message
        setTimeout(() => {
          setIsProcessing(false);
          // Redirect to dashboard with clean URL
          navigate('/huurder-dashboard', { replace: true });
        }, 2000);

      } catch (error) {
        console.error('Error processing payment:', error);
        toast({
          title: 'Er ging iets mis',
          description: 'Er was een probleem bij het verwerken van je betaling.',
          variant: 'destructive',
        });
        
        setTimeout(() => {
          navigate('/huurder-dashboard', { replace: true });
        }, 3000);
      }
    };

    processPayment();
  }, [searchParams, login, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            {isProcessing ? (
              <>
                <Loader2 className="w-16 h-16 mx-auto mb-4 text-dutch-blue animate-spin" />
                <h2 className="text-xl font-semibold mb-2">Betaling verwerken...</h2>
                <p className="text-gray-600">
                  Even geduld terwijl we je account activeren.
                </p>
              </>
            ) : (
              <>
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <h2 className="text-xl font-semibold mb-2">Betaling succesvol!</h2>
                <p className="text-gray-600">
                  Je wordt doorgestuurd naar je dashboard...
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
