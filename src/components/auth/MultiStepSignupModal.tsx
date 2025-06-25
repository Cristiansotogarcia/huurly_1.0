
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface MultiStepSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MultiStepSignupModal = ({ isOpen, onClose }: MultiStepSignupModalProps) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step < 2) {
      setStep(step + 1);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Wachtwoorden komen niet overeen",
        description: "Controleer of de ingevoerde wachtwoorden hetzelfde zijn.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { success, user } = await signUp({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: 'huurder'
      });

      if (success && user) {
        toast({
          title: "Registratie succesvol!",
          description: "Je wordt doorgestuurd naar je dashboard.",
        });
        onClose();

        // Route based on user role
        switch (user.role) {
          case 'huurder':
            navigate('/huurder-dashboard');
            break;
          case 'verhuurder':
            navigate('/verhuurder-dashboard');
            break;
          case 'beoordelaar':
            navigate('/beoordelaar-dashboard');
            break;
          case 'beheerder':
            navigate('/beheerder-dashboard');
            break;
          default:
            navigate('/');
        }
      } else {
        // The signUp function in useAuth throws an error on failure, which is caught by the catch block.
        // So if success is false, we can assume an error was thrown and will be handled there.
        // We can add a generic error here in case the promise resolves with success: false but doesn't throw.
        throw new Error("Er is een onbekende fout opgetreden bij het registreren.");
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Registratie mislukt",
        description: error.message || "Er is iets misgegaan. Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registreren - Stap {step} van 2</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <>
              <div>
                <Label htmlFor="firstName">Voornaam</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => updateFormData('firstName', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Achternaam</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateFormData('lastName', e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <Label htmlFor="email">E-mailadres</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Wachtwoord</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateFormData('password', e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Bevestig wachtwoord</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
            </>
          )}

          <div className="flex justify-between">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                Vorige
              </Button>
            )}
            <Button type="submit" disabled={isLoading} className="ml-auto">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registreren...
                </>
              ) : step === 2 ? (
                'Registreren'
              ) : (
                'Volgende'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
