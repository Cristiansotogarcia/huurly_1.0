import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { logger } from '@/lib/logger';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    // Get the session ID from the URL
    const sessionId = searchParams.get('session_id');
    
    // Log the payment success
    if (sessionId) {
      logger.info('Payment success redirect with session ID:', sessionId);
      
      // Set the localStorage flag for the success popup
      localStorage.setItem('hasShownPaymentSuccessPopup', 'true');
      
      // Show a brief toast message
      toast({
        title: 'Betaling ontvangen',
        description: 'Je wordt doorgestuurd naar je dashboard...',
      });
    }
    
    // Immediately redirect to the dashboard with the payment success flag
    // The dashboard will handle the verification logic
    navigate('/huurder-dashboard?payment=success', { replace: true });
    
  }, [navigate, searchParams, toast]);

  // Simple loading screen while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <Loader2 className="w-16 h-16 mx-auto mb-4 text-dutch-blue animate-spin" />
            <h2 className="text-xl font-semibold mb-2">Betaling verwerken...</h2>
            <p className="text-gray-600">
              Je wordt doorgestuurd naar je dashboard...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
