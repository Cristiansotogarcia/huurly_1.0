import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';
import { User, Briefcase, Shield, Users } from 'lucide-react';

interface SignupFormProps {
  onClose: () => void;
}

export const SignupForm = ({ onClose }: SignupFormProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '' as UserRole | '',
    agreeToTerms: false,
    agreeToPrivacy: false,
  });

  const { signUp, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    if (!formData.role) {
      return;
    }

    if (!formData.agreeToTerms || !formData.agreeToPrivacy) {
      return;
    }

    const result = await signUp({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      role: formData.role as UserRole,
    });

    if (result.success) {
      onClose();
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'huurder':
        return <User className="w-5 h-5" />;
      case 'verhuurder':
        return <Briefcase className="w-5 h-5" />;
      case 'beoordelaar':
        return <Shield className="w-5 h-5" />;
      case 'beheerder':
        return <Users className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'huurder':
        return 'Ik zoek een woning om te huren';
      case 'verhuurder':
        return 'Ik verhuur woningen';
      case 'beoordelaar':
        return 'Ik beoordeel documenten en profielen';
      case 'beheerder':
        return 'Ik beheer het platform';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-dutch-blue">Account aanmaken</h2>
        <p className="text-gray-600 mt-2">Maak je Huurly account aan</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Personal Information */}
        <div className="grid grid-cols-2 gap-4">
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

        {/* Role Selection */}
        <div>
          <Label htmlFor="role">Ik ben een *</Label>
          <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecteer je rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="huurder">
                <div className="flex items-center space-x-2">
                  {getRoleIcon('huurder')}
                  <div>
                    <div className="font-medium">Huurder</div>
                    <div className="text-xs text-gray-500">{getRoleDescription('huurder')}</div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="verhuurder">
                <div className="flex items-center space-x-2">
                  {getRoleIcon('verhuurder')}
                  <div>
                    <div className="font-medium">Verhuurder</div>
                    <div className="text-xs text-gray-500">{getRoleDescription('verhuurder')}</div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="beoordelaar">
                <div className="flex items-center space-x-2">
                  {getRoleIcon('beoordelaar')}
                  <div>
                    <div className="font-medium">Beoordelaar</div>
                    <div className="text-xs text-gray-500">{getRoleDescription('beoordelaar')}</div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="beheerder">
                <div className="flex items-center space-x-2">
                  {getRoleIcon('beheerder')}
                  <div>
                    <div className="font-medium">Beheerder</div>
                    <div className="text-xs text-gray-500">{getRoleDescription('beheerder')}</div>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Terms and Conditions */}
        <div className="space-y-3 pt-4 border-t">
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
              </a>{' '}
              *
            </Label>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={
            isLoading || 
            !formData.firstName || 
            !formData.lastName || 
            !formData.email || 
            !formData.password || 
            !formData.confirmPassword || 
            !formData.role || 
            !formData.agreeToTerms || 
            !formData.agreeToPrivacy ||
            formData.password !== formData.confirmPassword
          }
        >
          {isLoading ? 'Account wordt aangemaakt...' : 'Account aanmaken'}
        </Button>
      </form>

      <div className="text-center">
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

      <div className="text-xs text-gray-500 space-y-2">
        <p>
          <strong>Let op:</strong> Na registratie ontvang je een verificatie-email. 
          Controleer ook je spam folder.
        </p>
        <p>
          Voor huurders en verhuurders is een betaald abonnement vereist om alle functies te gebruiken.
        </p>
      </div>
    </div>
  );
};
