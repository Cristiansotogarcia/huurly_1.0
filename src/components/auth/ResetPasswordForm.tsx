import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ResetPasswordFormProps {
  onBack: () => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Voer uw e-mailadres in.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Voer een geldig e-mailadres in.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/wachtwoord-herstellen`
      });

      if (error) {
        if (error.message.includes('rate limit')) {
          setError('Te veel verzoeken. Probeer het over een minuut opnieuw.');
        } else {
          setError('Er is een fout opgetreden bij het versturen van de reset e-mail.');
        }
      } else {
        setIsSuccess(true);
        toast.success('Reset e-mail verzonden! Controleer uw inbox.');
      }
    } catch (err) {
      setError('Er is een onverwachte fout opgetreden.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            E-mail Verzonden!
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            We hebben een wachtwoord reset link naar <strong>{email}</strong> gestuurd.
            Controleer uw inbox en klik op de link om uw wachtwoord te resetten.
          </p>
          <p className="text-xs text-gray-500">
            Geen e-mail ontvangen? Controleer uw spam folder.
          </p>
        </div>
        
        <Button 
          onClick={onBack} 
          variant="outline" 
          className="w-full"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Terug naar inloggen
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleResetPassword} className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Wachtwoord Vergeten?
        </h3>
        <p className="text-sm text-gray-600">
          Voer uw e-mailadres in en we sturen u een link om uw wachtwoord te resetten.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="reset-email">E-mailadres</Label>
        <Input
          id="reset-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voer.email@voorbeeld.nl"
          required
          disabled={isLoading}
        />
      </div>
      
      <div className="space-y-2">
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Reset e-mail wordt verzonden...
            </>
          ) : (
            'Reset E-mail Versturen'
          )}
        </Button>
        
        <Button 
          type="button"
          onClick={onBack} 
          variant="outline" 
          className="w-full"
          disabled={isLoading}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Terug naar inloggen
        </Button>
      </div>
    </form>
  );
};

export default ResetPasswordForm;