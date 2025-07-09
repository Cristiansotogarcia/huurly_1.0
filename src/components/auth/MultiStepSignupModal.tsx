import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Check } from 'lucide-react';
import { validatePassword, type PasswordValidation } from '@/utils/password';

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

  // Password validation state
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  // keep validation in sync with the password field
  useEffect(() => {
    setPasswordValidation(validatePassword(formData.password));
  }, [formData.password]);


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

    // Check if all password requirements are met
    const validation = validatePassword(formData.password);
    const allRequirementsMet = Object.values(validation).every(Boolean);
    
    if (!allRequirementsMet) {
      toast({
        title: "Wachtwoord voldoet niet aan de eisen",
        description: "Zorg ervoor dat je wachtwoord aan alle eisen voldoet.",
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
          description: "Er is een e-mail verzonden om je account te bevestigen.",
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
    
    // Update password validation in real-time
    if (field === 'password') {
      setPasswordValidation(validatePassword(value));
    }
  };

  // Component for password requirement item
  const PasswordRequirement = ({ met, children }: { met: boolean; children: React.ReactNode }) => (
    <li className={`flex items-center space-x-2 ${met ? 'text-green-600' : 'text-gray-600'}`}>
      {met ? (
        <Check className="w-3 h-3 text-green-600" />
      ) : (
        <span className="w-3 h-3 rounded-full border border-gray-400"></span>
      )}
      <span>{children}</span>
    </li>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" aria-describedby="signup-description">
        <DialogHeader>
          <DialogTitle>Registreren - Stap {step} van 2</DialogTitle>
          <DialogDescription id="signup-description">
            Vul de vereiste gegevens in om een nieuw account aan te maken.
          </DialogDescription>
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
                  placeholder="••••••••"
                  required
                />
                <div className="mt-2 text-xs space-y-1">
                  <p className="text-gray-700 font-medium">Wachtwoord moet bevatten:</p>
                  <ul className="space-y-1 ml-2">
                    <PasswordRequirement met={passwordValidation.minLength}>
                      Minimaal 8 karakters
                    </PasswordRequirement>
                    <PasswordRequirement met={passwordValidation.hasUppercase}>
                      Minimaal 1 hoofdletter (A-Z)
                    </PasswordRequirement>
                    <PasswordRequirement met={passwordValidation.hasLowercase}>
                      Minimaal 1 kleine letter (a-z)
                    </PasswordRequirement>
                    <PasswordRequirement met={passwordValidation.hasNumber}>
                      Minimaal 1 cijfer (0-9)
                    </PasswordRequirement>
                    <PasswordRequirement met={passwordValidation.hasSpecialChar}>
                      Minimaal 1 speciale teken
                    </PasswordRequirement>
                  </ul>
                </div>
              </div>
              <div>
                <Label htmlFor="confirmPassword">Bevestig wachtwoord</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                  autoComplete="new-password"
                  placeholder="••••••••"
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