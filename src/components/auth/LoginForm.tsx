
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import ResetPasswordForm from './ResetPasswordForm';


interface LoginFormProps {
  onClose: () => void;
}

export const LoginForm = ({ onClose }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { signIn } = useAuth();

  // Load saved credentials on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';

    if (savedEmail && savedPassword && savedRememberMe) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

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
        // Save credentials to localStorage if remember me is checked
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
          localStorage.setItem('rememberedPassword', password);
          localStorage.setItem('rememberMe', 'true');
        } else {
          // Clear saved credentials if remember me is unchecked
          localStorage.removeItem('rememberedEmail');
          localStorage.removeItem('rememberedPassword');
          localStorage.removeItem('rememberMe');
        }
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
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Verberg wachtwoord" : "Toon wachtwoord"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => {
                const isChecked = checked as boolean;
                setRememberMe(isChecked);
                // Clear saved credentials immediately if unchecked
                if (!isChecked) {
                  localStorage.removeItem('rememberedEmail');
                  localStorage.removeItem('rememberedPassword');
                  localStorage.removeItem('rememberMe');
                }
              }}
            />
            <Label
              htmlFor="remember"
              className="text-sm font-normal cursor-pointer"
            >
              Wachtwoord onthouden
            </Label>
          </div>

          <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white w-full" disabled={isLoading}>
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
