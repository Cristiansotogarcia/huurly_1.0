
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/hooks/use-toast";
import { paymentService } from "@/services/PaymentService";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processPayment = async () => {
      console.log("PaymentSuccess component loaded");
      const params = new URLSearchParams(location.search);
      const sessionId = params.get("session_id");
      console.log("Session ID:", sessionId);

      if (!sessionId) {
        setError("Sessie-ID ontbreekt. Kan de betaling niet verifiëren.");
        setIsLoading(false);
        return;
      }

      try {
        console.log("Processing payment success for session:", sessionId);
        const result = await paymentService.handlePaymentSuccess(sessionId);
        console.log("Payment success result:", result);

        if (result.success) {
          toast({
            title: "Betaling ontvangen!",
            description: "Je account is nu geactiveerd en je hebt toegang tot alle functies.",
            variant: "default",
          });

          if (user && user.hasPayment !== true) {
            updateUser({ hasPayment: true });
          }

          const timeout = setTimeout(() => {
            console.log("Redirecting to dashboard");
            navigate("/huurder-dashboard?payment_success=true");
          }, 3000);

          return () => clearTimeout(timeout);
        } else {
          const errorMessage = result.error?.message || "Er is een onbekende fout opgetreden bij het verwerken van de betaling.";
          setError(errorMessage);
          toast({
            title: "Fout bij betalingsverwerking",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } catch (err: any) {
        console.error("Error processing payment success:", err);
        const errorMessage = err.message || "Er is een kritieke fout opgetreden.";
        setError(errorMessage);
        toast({
          title: "Fout",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    processPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          <button onClick={() => navigate('/huurder-dashboard?payment_success=true')} className="bg-dutch-blue text-white px-4 py-2 rounded">
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
