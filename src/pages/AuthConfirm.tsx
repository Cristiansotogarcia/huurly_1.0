import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check } from 'lucide-react';

/**
 * AuthConfirm component handles Supabase auth confirmation flows
 * This includes password reset, email verification, and other auth flows
 * that require token verification before redirecting to the appropriate page
 */
const AuthConfirm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const handleAuthConfirmation = async () => {
      const token_hash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      const next = searchParams.get('next') || '/';


      // If no token_hash or type, redirect to error
      if (!token_hash || !type) {
        console.error('AuthConfirm: Missing required parameters');
        toast({
          title: 'Ongeldige link',
          description: 'De bevestigingslink is ongeldig of beschadigd.',
          variant: 'destructive',
        });
        navigate('/');
        return;
      }

      try {
        // Verify the OTP token with Supabase
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as any, // Supabase types this as EmailOtpType
        });

        if (error) {
          console.error('AuthConfirm: Token verification failed', error);
          
          // Handle specific error cases
          if (error.message.includes('expired')) {
            toast({
              title: 'Link verlopen',
              description: 'De bevestigingslink is verlopen. Vraag een nieuwe aan.',
              variant: 'destructive',
            });
          } else if (error.message.includes('invalid') || error.message.includes('not found')) {
            toast({
              title: 'Ongeldige link',
              description: 'De bevestigingslink is ongeldig of al gebruikt.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Verificatie mislukt',
              description: error.message || 'Er is een fout opgetreden bij het verifiëren van de link.',
              variant: 'destructive',
            });
          }
          navigate('/');
          return;
        }


        // Handle different confirmation types
        if (type === 'email') {
          // Show success screen, then redirect to homepage with login modal
          setIsVerified(true);
          toast({
            title: 'E-mail succesvol geverifieerd!',
            description: 'Je kunt nu inloggen met je account.',
          });
          
          // Redirect to homepage with flag to open login modal
          setTimeout(() => {
            navigate('/?verified=true');
          }, 2000);
          return;
        } else if (type === 'invite') {
          // For invitations, redirect to the specified next URL or dashboard
          toast({
            title: 'Uitnodiging geaccepteerd',
            description: 'Je hebt de uitnodiging succesvol geaccepteerd.',
          });
          navigate(next);
          return;
        }

        // For any other type, redirect to the next URL or dashboard
        navigate(next);

      } catch (error) {
        console.error('AuthConfirm: Unexpected error during confirmation', error);
        toast({
          title: 'Onverwachte fout',
          description: 'Er is een onverwachte fout opgetreden. Probeer het opnieuw.',
          variant: 'destructive',
        });
        navigate('/');
      }
    };

    handleAuthConfirmation();
  }, [searchParams, navigate, toast]);

  // Show success screen when email is verified
  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-green-600">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-2xl">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
              E-mail Geverifieerd!
            </h2>
            <p className="text-gray-600 mb-6">
              Je account is succesvol bevestigd. Je kunt nu inloggen om toegang te krijgen tot je dashboard.
            </p>
            <p className="text-sm text-gray-500">
              Je wordt automatisch doorgestuurd naar de inlogpagina...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading screen during verification
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-dutch-blue" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Bevestiging verwerken...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Even geduld terwijl we je verzoek verwerken.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthConfirm;
