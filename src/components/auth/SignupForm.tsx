
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';

interface SignupFormProps {
  onClose: () => void;
}

export const SignupForm = ({ onClose }: SignupFormProps) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'huurder' as UserRole
  });
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { success, user } = await signUp(formData);
      if (success && user) {
        onClose();

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
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            placeholder="Minimaal 8 karakters"
            minLength={8}
          />
        </div>

        <div>
          <Label htmlFor="role">Ik ben een</Label>
          <Select value={formData.role} onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecteer je rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="huurder">Huurder</SelectItem>
              <SelectItem value="verhuurder">Verhuurder</SelectItem>
            </SelectContent>
          </Select>
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
