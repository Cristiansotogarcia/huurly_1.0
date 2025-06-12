import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PersistentDialogContent } from "@/components/ui/persistent-dialog";
import { Button } from "@/components/ui/button";
import { SUBSCRIPTION_PLANS, formatPrice } from "@/lib/stripe";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
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

  const handlePayment = () => {
    window.location.href =
      "https://buy.stripe.com/test_14A4gz3NMaRW2vRfHm9MY00?locale=nl";
  };

  const Content = persistent ? PersistentDialogContent : DialogContent;

  return (
    <Dialog open={isOpen} {...(persistent ? {} : { onOpenChange: onClose })}>
      <Content className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-dutch-blue">
            Account activeren
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-dutch-orange rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">€</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Premium Toegang Vereist
            </h3>
            <p className="text-gray-600">
              Om gebruik te maken van alle functies van Huurly, heb je een
              actief abonnement nodig.
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
            >
              Abonnement afsluiten
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Door je abonnement af te sluiten ga je akkoord met onze voorwaarden.
          </p>
        </div>
      </Content>
    </Dialog>
  );
};
