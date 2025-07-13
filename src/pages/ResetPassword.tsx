import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isValidToken, setIsValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  useEffect(() => {
    const checkTokenAndSetSession = async () => {
      try {
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        
        if (!token_hash || type !== 'recovery') {
          setError('Ongeldige of ontbrekende reset link. Vraag een nieuwe aan.');
          setIsCheckingToken(false);
          return;
        }

        // Verify the recovery token with Supabase
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: 'recovery'
        });

        if (error) {
          setError('De reset link is verlopen of ongeldig. Vraag een nieuwe aan.');
        } else if (data.session) {
          setIsValidToken(true);
        } else {
          setError('Er is een probleem opgetreden bij het verifiëren van de reset link.');
        }
      } catch (err) {
        setError('Er is een onverwachte fout opgetreden.');
      } finally {
        setIsCheckingToken(false);
      }
    };

    checkTokenAndSetSession();
  }, [searchParams]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setError('Vul beide wachtwoordvelden in.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen.');
      return;
    }

    if (password.length < 8) {
      setError('Wachtwoord moet minimaal 8 karakters lang zijn.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await updatePassword(password);

      if (!result.success) {
        setError(result.message || 'Er is een fout opgetreden bij het bijwerken van uw wachtwoord.');
      } else {
        toast.success(result.message || 'Wachtwoord succesvol bijgewerkt!');
        navigate('/login', { replace: true });
      }
    } catch (err) {
      setError('Er is een onverwachte fout opgetreden.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Reset link wordt geverifieerd...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Ongeldige Reset Link
            </CardTitle>
            <CardDescription className="text-gray-600">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/login')} 
              className="w-full"
            >
              Terug naar inloggen
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Nieuw Wachtwoord Instellen
          </CardTitle>
          <CardDescription className="text-gray-600">
            Voer uw nieuwe wachtwoord in om uw account te beveiligen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordReset} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="password">Nieuw Wachtwoord</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Voer uw nieuwe wachtwoord in"
                required
                disabled={isLoading}
                minLength={8}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Bevestig Wachtwoord</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Bevestig uw nieuwe wachtwoord"
                required
                disabled={isLoading}
                minLength={8}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wachtwoord wordt bijgewerkt...
                </>
              ) : (
                'Wachtwoord Bijwerken'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;