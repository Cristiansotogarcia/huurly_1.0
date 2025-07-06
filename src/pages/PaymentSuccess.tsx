
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/hooks/use-toast";
import { paymentService } from "@/services/PaymentService";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUser } = useAuthStore();

  useEffect(() => {
    console.log("PaymentSuccess component loaded");
    console.log("Current location:", location.pathname);
    console.log("URL search params:", location.search);
    
    // Parse the session_id parameter from the URL
    const params = new URLSearchParams(location.search);
    const sessionId = params.get("session_id");
    
    console.log("Session ID:", sessionId);

    if (sessionId) {
      console.log("Processing payment success for session:", sessionId);
      paymentService.handlePaymentSuccess(sessionId).then((result) => {
        console.log("Payment success result:", result);
        if (!result.success || result.error) {
          toast({
            title: "Fout",
            description: result.error?.message ||
              "Er is een fout opgetreden bij het verwerken van de betaling.",
            variant: "destructive",
          });
        }
      }).catch((error) => {
        console.error("Error processing payment success:", error);
      });
    }

    // On visit, show toast and mark as paid in store
    toast({
      title: "Betaling ontvangen!",
      description:
        "Je account is nu geactiveerd en je hebt toegang tot alle functies.",
      variant: "default",
    });

    // Mark user as paid
    if (user && user.hasPayment !== true) {
      updateUser({ hasPayment: true });
    }

    // Redirect after a short delay to dashboard
    const timeout = setTimeout(() => {
      console.log("Redirecting to dashboard");
      navigate("/huurder-dashboard");
    }, 3000); // Increased delay to 3 seconds for debugging

    return () => clearTimeout(timeout);
    // eslint-disable-next-line
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex items-center space-x-3 mb-6 justify-center">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Betaling Succesvol!</h1>
          <p className="text-gray-600 mb-6">
            Je account is nu geactiveerd en je hebt toegang tot alle functies van Huurly.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-dutch-blue"></div>
            <span>Je wordt doorgestuurd naar je dashboard...</span>
          </div>
        </div>
      </div>
      
      {/* Debug info - remove in production */}
      <div className="mt-8 p-4 bg-gray-100 rounded text-xs text-gray-600 max-w-md">
        <p>Debug info:</p>
        <p>Path: {location.pathname}</p>
        <p>Search: {location.search}</p>
        <p>Session ID: {new URLSearchParams(location.search).get("session_id")}</p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
