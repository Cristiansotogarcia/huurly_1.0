
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/hooks/use-toast";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();

  useEffect(() => {
    // On visit, show toast and mark as paid in store
    toast({
      title: "Betaling ontvangen!",
      description: "Je account is nu geactiveerd en je hebt toegang tot alle functies.",
      variant: "default",
    });

    // Mark user as paid
    // If user is not yet updated, still set so modal closes immediately
    if (user && user.hasPayment !== true) {
      updateUser({ hasPayment: true });
    }

    // Redirect after a short delay to dashboard
    const timeout = setTimeout(() => {
      navigate("/huurder-dashboard", { replace: true });
    }, 1400);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="flex items-center space-x-3 mb-4">
        <span className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
        <span className="font-semibold text-lg text-dutch-blue">Betaling succesvol!</span>
      </div>
      <div className="text-gray-600 mb-5">
        Je wordt zo doorgestuurd naar je dashboard.
      </div>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
    </div>
  );
};

export default PaymentSuccess;
