import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

/**
 * AuthConfirm component handles Supabase auth confirmation flows
 * This includes password reset, email verification, and other auth flows
 * that require token verification before redirecting to the appropriate page
 */
const AuthConfirm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthConfirmation = async () => {
      const token_hash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      const next = searchParams.get('next') || '/';

      console.log('AuthConfirm: Processing auth confirmation', {
        token_hash: token_hash ? `${token_hash.substring(0, 10)}...` : null,
        type,
        next
      });

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
        const { data, error } = await supabase.auth.verifyOtp({
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

        console.log('AuthConfirm: Token verification successful', {
          hasSession: !!data.session,
          hasUser: !!data.user,
          type
        });

        // Handle different confirmation types
        if (type === 'recovery') {
          // For password recovery, the user now has a session.
          // Redirect them to the password reset page.
          console.log('AuthConfirm: Redirecting to password reset page.');
          navigate('/wachtwoord-herstellen');
          return;
        } else if (type === 'email') {
          // For email verification, show success and redirect to dashboard
          toast({
            title: 'E-mail geverifieerd',
            description: 'Je e-mailadres is succesvol geverifieerd.',
          });
          navigate('/dashboard');
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
        console.log('AuthConfirm: Redirecting to next URL:', next);
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