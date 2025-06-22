import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface ResetPasswordFormProps {
  onResetPassword: (email: string) => Promise<boolean>;
  onCancel: () => void;
}

const ResetPasswordForm = ({ onResetPassword, onCancel }: ResetPasswordFormProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await onResetPassword(email);
      if (success) {
        setResetSent(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (resetSent) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Controleer je e-mail</h2>
          <p className="text-gray-600 mt-2">
            We hebben een link gestuurd naar <span className="font-medium">{email}</span> om je wachtwoord te resetten.
          </p>
        </div>
        <Button 
          type="button" 
          variant="outline" 
          className="w-full" 
          onClick={onCancel}
        >
          Terug naar inloggen
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Wachtwoord vergeten?</h2>
        <p className="text-gray-600 mt-2">
          Voer je e-mailadres in en we sturen je een link om je wachtwoord te resetten.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="reset-email">E-mailadres</Label>
          <Input
            id="reset-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="naam@voorbeeld.nl"
            className="mt-1"
          />
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Versturen...
            </>
          ) : (
            'Verstuur reset link'
          )}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          className="w-full" 
          onClick={onCancel}
          disabled={isLoading}
        >
          Terug naar inloggen
        </Button>
      </div>
    </form>
  );
};

export default ResetPasswordForm;