
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { demoUsers } from '@/data/demoData';
import { UserRole } from '@/types';

interface LoginFormProps {
  onClose: () => void;
}

export const LoginForm = ({ onClose }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const { signIn, resetPassword, isLoading, user } = useAuth();
  const navigate = useNavigate();

  // Helper function to get dashboard route based on user role
  const getDashboardRoute = (role: UserRole): string => {
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
        return '/huurder-dashboard'; // Default fallback
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await signIn({ email, password });
    
    if (result.success && result.user) {
      onClose();
      
      // Navigate to appropriate dashboard based on user role
      const dashboardRoute = getDashboardRoute(result.user.role);
      navigate(dashboardRoute);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      return;
    }

    const success = await resetPassword(email);
    
    if (success) {
      setShowResetPassword(false);
    }
  };

  const fillDemoCredentials = (role: string) => {
    const user = demoUsers.find(u => u.role === role);
    if (user) {
      setEmail(user.email);
      setPassword('demo123');
    }
  };

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

      <div className="border-t pt-4">
        <p className="text-sm text-gray-600 mb-3">Demo accounts (wachtwoord: demo123):</p>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fillDemoCredentials('huurder')}
          >
            Huurder Demo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fillDemoCredentials('verhuurder')}
          >
            Verhuurder Demo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fillDemoCredentials('beoordelaar')}
          >
            Beoordelaar Demo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fillDemoCredentials('beheerder')}
          >
            Beheerder Demo
          </Button>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Wachtwoord vergeten?{' '}
          <button className="text-dutch-orange hover:underline">
            Reset hier
          </button>
        </p>
      </div>
    </div>
  );
};
