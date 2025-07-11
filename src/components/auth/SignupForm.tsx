import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';
import { validatePassword, type PasswordValidation } from '@/utils/password';
import { useAuth } from '@/hooks/useAuth';

interface SignupFormProps {
  onClose: () => void;
}

export const SignupForm = ({ onClose }: SignupFormProps) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  // keep validation in sync with the password field
  useEffect(() => {
    setPasswordValidation(validatePassword(formData.password));
  }, [formData.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { success } = await signUp({ ...formData, role: 'huurder' });
      if (success) {
        onClose(); // Emailbevestiging volgt apart
      }
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Account aanmaken</h2>
        <p className="text-gray-600 mt-2">
          Start je zoektocht naar de perfecte woning
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">Voornaam</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
              placeholder="Je voornaam"
            />
          </div>
          <div>
            <Label htmlFor="lastName">Achternaam</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
              placeholder="Je achternaam"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email">E-mailadres</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            placeholder="je@email.nl"
          />
        </div>

        <div>
          <Label htmlFor="password">Wachtwoord</Label>

          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => {
              const value = e.target.value;
              setFormData({ ...formData, password: value });
              setPasswordValidation(validatePassword(value));
            }}
            required
            placeholder="••••••••"
            minLength={8}
          />
          <div className="mt-2 text-xs space-y-1">
            <p className="text-gray-700 font-medium">Wachtwoord moet bevatten:</p>
            <ul className="space-y-1 ml-2">
              <PasswordRequirement met={passwordValidation.minLength}>Minimaal 8 karakters</PasswordRequirement>
              <PasswordRequirement met={passwordValidation.hasUppercase}>Minimaal 1 hoofdletter (A-Z)</PasswordRequirement>
              <PasswordRequirement met={passwordValidation.hasLowercase}>Minimaal 1 kleine letter (a-z)</PasswordRequirement>
              <PasswordRequirement met={passwordValidation.hasNumber}>Minimaal 1 cijfer (0-9)</PasswordRequirement>
              <PasswordRequirement met={passwordValidation.hasSpecialChar}>Minimaal 1 speciaal teken</PasswordRequirement>
            </ul>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-dutch-orange hover:bg-orange-600"
          disabled={isLoading}
        >
          {isLoading ? 'Account aanmaken...' : 'Account aanmaken'}
        </Button>
      </form>
    </div>
  );
};
