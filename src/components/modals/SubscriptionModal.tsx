
import UnifiedModal from '@/components/modals/UnifiedModal';
import { Button } from '@/components/ui/button';
import { getStripe, SUBSCRIPTION_PLANS } from '@/lib/stripe-config';
import { Elements, useStripe } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Load Stripe using the centralized configuration
const stripePromise = getStripe();

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId?: string;
}

const CheckoutForm = ({ onClose, onSuccess }: { onSuccess: () => void; onClose: () => void; }) => {
  const stripe = useStripe();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe) {
      toast({
        title: 'Fout',
        description: 'Stripe is niet beschikbaar. Controleer de configuratie.',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);

    try {
      const plan = SUBSCRIPTION_PLANS.huurder.halfyearly;
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId: plan.priceId,
          successUrl: `${window.location.origin}/dashboard?payment_success=true`,
          cancelUrl: `${window.location.origin}/dashboard?payment_canceled=true`,
        },
      });

      if (error) {
        throw new Error(`Function invoke error: ${error.message}`);
      }

      const { sessionId } = data;
      if (!sessionId) {
        throw new Error('Failed to create a checkout session.');
      }

      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });

      if (stripeError) {
        toast({ title: 'Fout bij omleiden', description: stripeError.message, variant: 'destructive' });
      } else {
        onSuccess();
      }

    } catch (error: any) {
      toast({ title: 'Betaling Mislukt', description: error.message, variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <p className="mb-4">Klik op de knop hieronder om door te gaan naar de beveiligde betaalpagina van Stripe om je abonnement voor €65 te starten.</p>
      <div className="flex justify-end space-x-2 mt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={isProcessing}>Annuleren</Button>
        <Button type="submit" disabled={!stripe || isProcessing}>
          {isProcessing ? 'Verwerken...' : 'Doorgaan naar Betaling'}
        </Button>
      </div>
    </form>
  );
};

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onSuccess }) => {
  return (
    <UnifiedModal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Neem een abonnement"
      size="md"
      footer={
        <div className="flex justify-end space-x-2">
          <Button onClick={onClose} variant="outline">
            Annuleren
          </Button>
          <Button type="submit" form="subscription-form" variant="default">
            Doorgaan naar Betaling
          </Button>
        </div>
      }
    >
      <Elements stripe={stripePromise}>
        <CheckoutForm onSuccess={onSuccess} onClose={onClose} />
      </Elements>
    </UnifiedModal>
  );
};

export default SubscriptionModal;
