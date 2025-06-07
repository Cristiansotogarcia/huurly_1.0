import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';

interface LoginFormProps {
  onClose: () => void;
}

export const LoginForm = ({ onClose }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const { signIn, resetPassword, isLoading } = useAuth();
  const navigate = useNavigate();

  // Helper function to get dashboard route based on user role
  const getDashboardRoute = (role: UserRole): string => {
    console.log('Getting dashboard route for role:', role);
    switch (role) {
      case 'huurder':
        return '/huurder-dashboard';
      case 'verhuurder':
        return '/verhuurder-dashboard';
      case 'beoordelaar':
        return '/beoordelaar-dashboard';
      case 'beheerder':
        return '/beheerder-dashboard';
      default:
        console.warn('Unknown role:', role, 'defaulting to huurder dashboard');
        return '/huurder-dashboard';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Login attempt for email:', email);
    const result = await signIn({ email, password });
    
    if (result.success && result.user) {
      console.log('Login successful for user:', result.user.email, 'with role:', result.user.role);
      onClose();
      
      // Add a small delay to ensure state is updated
      setTimeout(() => {
        const dashboardRoute = getDashboardRoute(result.user!.role);
        console.log('Redirecting to:', dashboardRoute);
        navigate(dashboardRoute);
      }, 100);
    } else {
      console.error('Login failed:', result);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      return;
    }

    const success = await resetPassword(resetEmail);
    
    if (success) {
      setShowResetPassword(false);
      setResetEmail('');
    }
  };

  if (showResetPassword) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-dutch-blue">Wachtwoord vergeten?</h2>
          <p className="text-gray-600 mt-2">Voer je e-mailadres in om je wachtwoord te resetten</p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <Label htmlFor="resetEmail">E-mailadres</Label>
            <Input
              id="resetEmail"
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="jouw@email.nl"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Bezig met verzenden...' : 'Reset wachtwoord'}
          </Button>

          <Button 
            type="button" 
            variant="ghost" 
            className="w-full"
            onClick={() => setShowResetPassword(false)}
          >
            Terug naar inloggen
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-dutch-blue">Welkom terug bij Huurly</h2>
        <p className="text-gray-600 mt-2">Log in op je account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">E-mailadres</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jouw@email.nl"
            required
          />
        </div>

        <div>
          <Label htmlFor="password">Wachtwoord</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Bezig met inloggen...' : 'Inloggen'}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Wachtwoord vergeten?{' '}
          <button 
            type="button"
            className="text-dutch-orange hover:underline"
            onClick={() => setShowResetPassword(true)}
          >
            Reset hier
          </button>
        </p>
      </div>
    </div>
  );
};
