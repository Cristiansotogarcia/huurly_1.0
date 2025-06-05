import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { User, Briefcase, ArrowLeft, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MultiStepSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type UserRole = 'huurder' | 'verhuurder';

interface FormData {
  // Step 1: Role Selection
  role: UserRole | '';
  
  // Step 2-3: Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Step 4-5: Account Security
  password: string;
  confirmPassword: string;
  
  // Step 6-7: Agreements
  agreeToTerms: boolean;
  agreeToPrivacy: boolean; // Not mandatory
}

const TOTAL_STEPS = 7;

export const MultiStepSignupModal = ({ isOpen, onClose }: MultiStepSignupModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    role: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    agreeToPrivacy: false,
  });

  const { signUp, isLoading } = useAuth();
  const { toast } = useToast();

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    handleInputChange('role', role);
    handleNext();
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.role) {
      toast({
        title: "Fout",
        description: "Selecteer eerst je rol",
        variant: "destructive"
      });
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({
        title: "Fout", 
        description: "Vul alle verplichte velden in",
        variant: "destructive"
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Fout",
        description: "Wachtwoorden komen niet overeen",
        variant: "destructive"
      });
      return;
    }

    if (!formData.agreeToTerms) {
      toast({
        title: "Fout",
        description: "Je moet akkoord gaan met de algemene voorwaarden",
        variant: "destructive"
      });
      return;
    }

    const result = await signUp({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      role: formData.role as UserRole,
      phone: formData.phone,
    });

    if (result.success) {
      toast({
        title: "Account aangemaakt!",
        description: "Je account is succesvol aangemaakt. Check je email voor verificatie.",
      });
      onClose();
      // Reset form
      setCurrentStep(1);
      setFormData({
        role: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false,
        agreeToPrivacy: false,
      });
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Type selectie';
      case 2: return 'Persoonlijke gegevens';
      case 3: return 'Contact informatie';
      case 4: return 'Account beveiliging';
      case 5: return 'Wachtwoord bevestigen';
      case 6: return 'Voorwaarden';
      case 7: return 'Bevestiging';
      default: return 'Account aanmaken';
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.role !== '';
      case 2: return formData.firstName && formData.lastName;
      case 3: return formData.email;
      case 4: return formData.password && formData.password.length >= 6;
      case 5: return formData.confirmPassword && formData.password === formData.confirmPassword;
      case 6: return formData.agreeToTerms; // Only terms required, privacy optional
      case 7: return true;
      default: return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <User className="w-16 h-16 mx-auto text-dutch-blue mb-4" />
              <h3 className="text-xl font-semibold mb-2">Wat ben je?</h3>
              <p className="text-gray-600">Kies je rol om de juiste ervaring te krijgen</p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => handleRoleSelect('huurder')}
                className={`w-full p-4 border-2 rounded-lg text-left transition-all hover:border-dutch-blue ${
                  formData.role === 'huurder' ? 'border-dutch-blue bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full border-2 border-dutch-blue flex items-center justify-center">
                    {formData.role === 'huurder' && <div className="w-3 h-3 bg-dutch-blue rounded-full" />}
                  </div>
                  <User className="w-6 h-6 text-dutch-blue" />
                  <div>
                    <div className="font-semibold">Huurder</div>
                    <div className="text-sm text-gray-600">Ik zoek een woning</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect('verhuurder')}
                className={`w-full p-4 border-2 rounded-lg text-left transition-all hover:border-dutch-orange ${
                  formData.role === 'verhuurder' ? 'border-dutch-orange bg-orange-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full border-2 border-dutch-orange flex items-center justify-center">
                    {formData.role === 'verhuurder' && <div className="w-3 h-3 bg-dutch-orange rounded-full" />}
                  </div>
                  <Briefcase className="w-6 h-6 text-dutch-orange" />
                  <div>
                    <div className="font-semibold">Verhuurder</div>
                    <div className="text-sm text-gray-600">Ik verhuur woningen</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="firstName">Voornaam *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Jan"
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Achternaam *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Jansen"
                required
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">E-mailadres *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="jan@email.nl"
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefoonnummer</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="06 12345678"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="password">Wachtwoord *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">Minimaal 6 karakters</p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="confirmPassword">Bevestig wachtwoord *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="••••••••"
                required
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Wachtwoorden komen niet overeen</p>
              )}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="agreeToTerms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
                className="mt-1"
              />
              <Label htmlFor="agreeToTerms" className="text-sm leading-relaxed">
                Ik ga akkoord met de{' '}
                <a href="/algemene-voorwaarden" target="_blank" className="text-dutch-orange hover:underline">
                  algemene voorwaarden
                </a>{' '}
                *
              </Label>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="agreeToPrivacy"
                checked={formData.agreeToPrivacy}
                onCheckedChange={(checked) => handleInputChange('agreeToPrivacy', checked as boolean)}
                className="mt-1"
              />
              <Label htmlFor="agreeToPrivacy" className="text-sm leading-relaxed">
                Ik ga akkoord met het{' '}
                <a href="/privacybeleid" target="_blank" className="text-dutch-orange hover:underline">
                  privacybeleid
                </a>
              </Label>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Klaar om te beginnen!</h3>
              <p className="text-gray-600 mb-4">
                Je account wordt aangemaakt als {formData.role === 'huurder' ? 'huurder' : 'verhuurder'}.
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Naam:</span>
                <span className="text-sm font-medium">{formData.firstName} {formData.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Email:</span>
                <span className="text-sm font-medium">{formData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Rol:</span>
                <span className="text-sm font-medium capitalize">{formData.role}</span>
              </div>
            </div>

            {formData.role === 'verhuurder' && (
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                <p className="text-sm text-orange-800">
                  <strong>Let op:</strong> Verhuurder accounts moeten worden goedgekeurd door een beheerder voordat je kunt beginnen.
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Account aanmaken</DialogTitle>
          <div className="text-center text-sm text-gray-600">
            Stap {currentStep} van {TOTAL_STEPS} - {getStepTitle()}
          </div>
          <Progress value={(currentStep / TOTAL_STEPS) * 100} className="mt-2" />
        </DialogHeader>

        <div className="py-4">
          {renderStepContent()}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Vorige
          </Button>

          {currentStep < TOTAL_STEPS ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center"
            >
              Volgende
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !canProceed()}
              className="flex items-center"
            >
              {isLoading ? 'Account wordt aangemaakt...' : 'Account aanmaken'}
            </Button>
          )}
        </div>

        <div className="text-center pt-4 border-t">
          <p className="text-sm text-gray-600">
            Heb je al een account?{' '}
            <button 
              className="text-dutch-orange hover:underline"
              onClick={onClose}
            >
              Inloggen
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
