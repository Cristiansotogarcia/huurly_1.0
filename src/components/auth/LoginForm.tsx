
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import { demoUsers } from '@/data/demoData';

interface LoginFormProps {
  onClose: () => void;
}

export const LoginForm = ({ onClose }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Demo login logic
    const user = demoUsers.find(u => u.email === email);
    
    if (user && password === 'demo123') {
      login(user);
      toast({
        title: "Succesvol ingelogd",
        description: `Welkom terug, ${user.name}!`
      });
      onClose();
      // Redirect to appropriate dashboard
      window.location.href = `/${user.role}-dashboard`;
    } else {
      toast({
        title: "Inloggen mislukt",
        description: "Controleer je e-mailadres en wachtwoord.",
        variant: "destructive"
      });
    }

    setIsLoading(false);
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
