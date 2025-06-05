
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';

interface SignupFormProps {
  onClose: () => void;
}

export const SignupForm = ({ onClose }: SignupFormProps) => {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<'huurder' | 'verhuurder'>('huurder');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const { toast } = useToast();

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Account wordt aangemaakt...",
      description: "Je ontvangt binnenkort een bevestigingsmail."
    });
    onClose();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-dutch-blue">Account aanmaken</h2>
        <p className="text-gray-600 mt-2">Stap {step} van 3 - {step === 1 ? 'Type selectie' : step === 2 ? 'Persoonlijke gegevens' : 'Account details'}</p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div 
            className="bg-gradient-to-r from-dutch-blue to-dutch-orange h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Wat ben je?</h3>
            <p className="text-gray-600">Kies je rol om de juiste ervaring te krijgen</p>
          </div>

          <RadioGroup value={userType} onValueChange={(value) => setUserType(value as 'huurder' | 'verhuurder')}>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="huurder" id="huurder" />
                <div className="flex-1">
                  <Label htmlFor="huurder" className="text-lg font-medium cursor-pointer">
                    Huurder
                  </Label>
                  <p className="text-sm text-gray-600">Ik zoek een woning</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="verhuurder" id="verhuurder" />
                <div className="flex-1">
                  <Label htmlFor="verhuurder" className="text-lg font-medium cursor-pointer">
                    Verhuurder
                  </Label>
                  <p className="text-sm text-gray-600">Ik verhuur woningen</p>
                </div>
              </div>
            </div>
          </RadioGroup>

          <Button onClick={handleNext} className="w-full">
            Volgende
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Voornaam</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                placeholder="Jan"
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Achternaam</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                placeholder="Jansen"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Telefoonnummer</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="06 12345678"
              required
            />
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleBack} className="flex-1">
              Vorige
            </Button>
            <Button onClick={handleNext} className="flex-1">
              Volgende
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">E-mailadres</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="jan@email.nl"
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Wachtwoord</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Bevestig wachtwoord</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex space-x-3">
            <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
              Vorige
            </Button>
            <Button type="submit" className="flex-1">
              Account aanmaken
            </Button>
          </div>
        </form>
      )}

      <div className="text-center text-xs text-gray-500">
        Heb je al een account?{' '}
        <button className="text-dutch-orange hover:underline" onClick={onClose}>
          Inloggen
        </button>
      </div>
    </div>
  );
};
