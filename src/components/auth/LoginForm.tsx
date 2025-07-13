
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import ResetPasswordForm from './ResetPasswordForm';


interface LoginFormProps {
  onClose: () => void;
}

export const LoginForm = ({ onClose }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const { signIn } = useAuth();

  const handleResetPassword = () => {
    setShowResetPassword(true);
  };

  const handleBackToLogin = () => {
    setShowResetPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { success, user } = await signIn({ email, password });
      
      if (success && user) {
        onClose();
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {showResetPassword ? 'Wachtwoord Vergeten' : 'Inloggen'}
        </DialogTitle>
      </DialogHeader>
      
      {showResetPassword ? (
        <ResetPasswordForm onBack={handleBackToLogin} />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="email">E-mailadres</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="jouw@email.nl"
            />
          </div>
          
          <div>
            <Label htmlFor="password">Wachtwoord</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Inloggen...
              </>
            ) : (
              'Inloggen'
            )}
          </Button>
          
          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={handleResetPassword}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Wachtwoord vergeten?
            </Button>
          </div>
        </form>
      )}
    </>
  );
};
