
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
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
    lastName: '',
    role: '' as UserRole,
  });
  
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    setIsLoading(true);

    try {
      const { success, user } = await signUp({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
      });

      if (success && user) {
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
      }
    } catch (error) {
      console.error('Signup error:', error);
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
          <DialogTitle>Registreren - Stap {step} van 3</DialogTitle>
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
                  required
                />
              </div>
            </>
          )}

          {step === 3 && (
            <div>
              <Label htmlFor="role">Ik ben een...</Label>
              <Select onValueChange={(value: UserRole) => updateFormData('role', value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer je rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="huurder">Huurder</SelectItem>
                  <SelectItem value="verhuurder">Verhuurder</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              ) : step === 3 ? (
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
