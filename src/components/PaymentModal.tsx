
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PersistentDialogContent } from "@/components/ui/persistent-dialog";
import { Button } from "@/components/ui/button";
import { SUBSCRIPTION_PLANS, formatPrice } from "@/lib/stripe-config";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/authStore";
import { stripeCheckoutService } from "@/services/payment/StripeCheckoutService";
import { Loader2, X } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: (show: boolean) => void;
  /** Display the modal without a close button and ignore outside clicks */
  persistent?: boolean;
}

export const PaymentModal = ({
  isOpen,
  onClose,
  persistent = false,
}: PaymentModalProps) => {
  // Pricing information for huurders
  const plan = SUBSCRIPTION_PLANS.huurder.yearly;
  const pricingInfo = {
    displayPrice: formatPrice(plan.price),
    actualPrice: formatPrice(plan.priceWithTax),
    taxAmount: formatPrice(plan.priceWithTax - plan.price),
    taxRate: `${(plan.taxRate * 100).toFixed(0)}%`,
    interval: plan.interval,
    features: plan.features,
  };

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthStore();

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Fout",
        description: "Je moet ingelogd zijn om een abonnement af te sluiten.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await stripeCheckoutService.createCheckoutSession(user.id);
      if (result.error) {
        toast({
          title: "Fout",
          description: result.error.message || "Er is een fout opgetreden bij het starten van de betaling.",
          variant: "destructive",
        });
      }
      // The redirect is handled by the service
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Fout",
        description: "Er is een onverwachte fout opgetreden. Probeer het later opnieuw.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Always use PersistentDialogContent for payment modal to prevent closing
  const Content = PersistentDialogContent;

  return (
    <Dialog open={isOpen} onOpenChange={persistent ? undefined : (open) => onClose(open)}>
      <Content className="sm:max-w-md" aria-describedby="payment-modal-description">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-center text-dutch-blue flex-1">
              Account activeren
            </DialogTitle>
            {/* Only show close button if not persistent */}
            {!persistent && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onClose(false)}
                className="h-6 w-6 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-dutch-orange rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">€</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {persistent ? "Betaling Vereist" : "Premium Toegang Vereist"}
            </h3>
            <p id="payment-modal-description" className="text-gray-600">
              {persistent 
                ? "Je account moet geactiveerd worden met een geldige betaling om toegang te krijgen tot alle functies."
                : "Om gebruik te maken van alle functies van Huurly, heb je een actief abonnement nodig."
              }
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span>Jaarlijks abonnement</span>
              <span className="font-bold">{pricingInfo.actualPrice}/{pricingInfo.interval}</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              {pricingInfo.features.map((feature, index) => (
                <li key={index}>• {feature}</li>
              ))}
            </ul>
            <div className="mt-3 text-xs text-gray-500">
              <div>Excl. BTW: {pricingInfo.displayPrice}</div>
              <div>BTW ({pricingInfo.taxRate}): {pricingInfo.taxAmount}</div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handlePayment}
              className="w-full bg-dutch-blue hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Bezig met verwerken...
                </>
              ) : (
                "Abonnement afsluiten"
              )}
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Door je abonnement af te sluiten ga je akkoord met onze voorwaarden.
            {persistent && " Deze melding verdwijnt automatisch na succesvolle betaling."}
          </p>
        </div>
      </Content>
    </Dialog>
  );
};
