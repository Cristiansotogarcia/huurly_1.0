import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId?: string;
}

const CheckoutForm = ({ onClose }: { onSuccess: () => void; onClose: () => void; }) => {
  const stripe = useStripe();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe) {
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId: import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID,
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
      }

    } catch (error: any) {
      toast({ title: 'Betaling Mislukt', description: error.message, variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
        <p className="mb-4">Klik op de knop hieronder om door te gaan naar de beveiligde betaalpagina van Stripe om je abonnement voor €65/jaar te starten.</p>
      <div className="flex justify-end space-x-2 mt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={isProcessing}>Annuleren</Button>
        <Button type="submit" disabled={!stripe || isProcessing}>
          {isProcessing ? 'Verwerken...' : 'Doorgaan naar Betaling'}
        </Button>
      </div>
    </form>
  );
};

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onSuccess }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neem een abonnement</DialogTitle>
        </DialogHeader>
        <Elements stripe={stripePromise}>
          <CheckoutForm onSuccess={onSuccess} onClose={onClose} />
        </Elements>
      </DialogContent>
    </Dialog>
  );
};