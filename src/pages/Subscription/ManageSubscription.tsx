import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscriptionService, SubscriptionStatus } from '@/services/payment/SubscriptionService';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const ManageSubscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      setLoading(true);
      const result = await subscriptionService.checkSubscriptionStatus(user.id);
      if (result.success && result.data) {
        setStatus(result.data);
      } else {
        toast({ title: 'Fout', description: result.error?.message || 'Kon abonnement niet laden', variant: 'destructive' });
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const cancel = async () => {
    if (!status?.stripeSubscriptionId) return;
    setProcessing(true);
    const result = await subscriptionService.cancelSubscription(status.stripeSubscriptionId);
    if (result.success) {
      toast({ title: 'Abonnement wordt geannuleerd', description: 'Je behoudt toegang tot het einde van de huidige periode.' });
    } else {
      toast({ title: 'Fout', description: result.error?.message || 'Annuleren mislukt', variant: 'destructive' });
    }
    setProcessing(false);
  };

  const renew = async () => {
    if (!status?.stripeSubscriptionId) return;
    setProcessing(true);
    const result = await subscriptionService.renewSubscription(status.stripeSubscriptionId);
    if (result.success) {
      toast({ title: 'Abonnement hervat', description: 'Je abonnement is opnieuw geactiveerd.' });
    } else {
      toast({ title: 'Fout', description: result.error?.message || 'Herstart mislukt', variant: 'destructive' });
    }
    setProcessing(false);
  };

  if (loading) {
    return <div className="p-4">Laden...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <Button variant="outline" onClick={() => navigate(-1)}>Terug</Button>
      <h1 className="text-2xl font-bold">Mijn Abonnement</h1>
      {status?.hasActiveSubscription ? (
        <div className="space-y-2">
          <p>Je abonnement verloopt op {status.expiresAt}</p>
          <Button onClick={cancel} disabled={processing}>Abonnement opzeggen</Button>
        </div>
      ) : (
        <div className="space-y-2">
          <p>Je hebt momenteel geen actief abonnement.</p>
          {status?.stripeSubscriptionId && (
            <Button onClick={renew} disabled={processing}>Abonnement hervatten</Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageSubscription;
