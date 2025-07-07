
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/hooks/use-toast";
import { paymentService } from "@/services/PaymentService";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUser, initializeAuth, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Wait for auth to initialize first
  useEffect(() => {
    const waitForAuth = async () => {
      try {
        console.log("PaymentSuccess: Initializing auth...");
        await initializeAuth();
        setAuthInitialized(true);
      } catch (error) {
        console.error("PaymentSuccess: Auth initialization failed:", error);
        setAuthInitialized(true); // Continue anyway
      }
    };
    
    waitForAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!authInitialized) return;

    const processPayment = async () => {
      console.log("PaymentSuccess component loaded, auth initialized");
      const params = new URLSearchParams(location.search);
      const sessionId = params.get("session_id");
      console.log("Session ID:", sessionId);
      console.log("User authenticated:", isAuthenticated, "User ID:", user?.id);

      if (!sessionId) {
        setError("Sessie-ID ontbreekt. Kan de betaling niet verifiëren.");
        setIsLoading(false);
        return;
      }

      // Check if user is authenticated
      if (!isAuthenticated || !user?.id) {
        console.warn("PaymentSuccess: User not authenticated, redirecting to home page");
        // Store session ID in URL params for after login via toast message
        toast({
          title: "Authenticatie Vereist",
          description: "Log in om je betaling te verifiëren. Je betaling is mogelijk al verwerkt.",
          variant: "default",
        });
        navigate(`/?payment_session=${sessionId}`, { replace: true });
        return;
      }

      try {
        console.log("Checking subscription status for session:", sessionId);
        
        // Wait a moment for webhook to process, then check subscription status
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const subscriptionResult = await paymentService.checkSubscriptionStatus(user.id);
        console.log("Subscription check result:", subscriptionResult);

        if (subscriptionResult.success && subscriptionResult.data?.isActive) {
          toast({
            title: "Betaling ontvangen!",
            description: "Je account is nu geactiveerd en je hebt toegang tot alle functies.",
            variant: "default",
          });

          if (user && user.hasPayment !== true) {
            updateUser({ hasPayment: true });
          }

          // Redirect immediately
          console.log("Redirecting to dashboard");
          navigate("/huurder-dashboard?payment_success=true", { replace: true });
        } else {
          // If subscription not active yet, try a few more times
          let attempts = 0;
          const maxAttempts = 5;
          
          while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            attempts++;
            
            const retryResult = await paymentService.checkSubscriptionStatus(user.id);
            console.log(`Subscription check attempt ${attempts}:`, retryResult);
            
            if (retryResult.success && retryResult.data?.isActive) {
              toast({
                title: "Betaling ontvangen!",
                description: "Je account is nu geactiveerd en je hebt toegang tot alle functies.",
                variant: "default",
              });

              updateUser({ hasPayment: true });
              navigate("/huurder-dashboard?payment_success=true", { replace: true });
              return;
            }
          }
          
          // After all attempts, still not active
          setError("De betaling wordt nog verwerkt. Je wordt doorgestuurd naar het dashboard waar je de status kunt controleren.");
          setTimeout(() => {
            navigate("/huurder-dashboard", { replace: true });
          }, 3000);
        }
      } catch (err: any) {
        console.error("Error checking subscription status:", err);
        setError("Er was een probleem bij het controleren van je abonnement. Je wordt doorgestuurd naar het dashboard.");
        setTimeout(() => {
          navigate("/huurder-dashboard", { replace: true });
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };

    processPayment();
  }, [authInitialized, user, isAuthenticated, location.search, navigate, updateUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dutch-blue mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900">Betaling wordt verwerkt...</h1>
          <p className="text-gray-600">Een ogenblik geduld.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4 text-center">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Betaling Mislukt</h1>
          <p className="text-red-600 mb-6">{error}</p>
          <button onClick={() => navigate('/huurder-dashboard')} className="bg-dutch-blue text-white px-4 py-2 rounded">
            Terug naar Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4 text-center">
        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Betaling Succesvol!</h1>
        <p className="text-gray-600 mb-6">
          Je account is nu geactiveerd. Je wordt doorgestuurd naar je dashboard.
        </p>
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-dutch-blue"></div>
          <span>Een ogenblik geduld...</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
