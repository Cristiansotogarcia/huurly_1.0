import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PersistentDialogContent } from "@/components/ui/persistent-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/authStore";
import { paymentService } from "@/services/PaymentService";

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
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthStore();

  const handlePayment = async () => {
    if (!user) return;
    setIsLoading(true);

    const { error } = await paymentService.createCheckoutSession(user.id);

    if (error) {
      toast({
        title: "Betaling mislukt",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    }
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
              <span>Maandelijks abonnement</span>
              <span className="font-bold">€19,99/maand</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Onbeperkt profiel zichtbaarheid</li>
              <li>• Prioriteit bij matches</li>
              <li>• Geavanceerde zoekfilters</li>
              <li>• 24/7 klantenservice</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handlePayment}
              className="w-full bg-dutch-blue hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? "Bezig met verwerken..." : "Abonnement afsluiten"}
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
