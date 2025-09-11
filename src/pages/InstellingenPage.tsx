import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, AlertCircle, Key, Mail, Trash2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import { withAuth } from '@/hocs/withAuth';
import { userService } from '@/services/UserService';

const InstellingenPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Email update state
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Account deletion state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Password reset modal state
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEmail || !currentPassword) {
      setEmailError('Vul alle velden in.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setEmailError('Voer een geldig e-mailadres in.');
      return;
    }

    setIsUpdatingEmail(true);
    setEmailError('');

    try {
      // First verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });

      if (signInError) {
        setEmailError('Huidig wachtwoord is onjuist.');
        setIsUpdatingEmail(false);
        return;
      }

      // Update email in auth
      const { error: updateError } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (updateError) {
        setEmailError('Er is een fout opgetreden bij het bijwerken van het e-mailadres.');
      } else {
        toast({
          title: 'E-mailadres bijgewerkt',
          description: 'Er is een bevestigingsmail verzonden naar je nieuwe e-mailadres.',
        });
        setNewEmail('');
        setCurrentPassword('');
      }
    } catch (error) {
      setEmailError('Er is een onverwachte fout opgetreden.');
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleAccountDeletion = async () => {
    if (deleteConfirmation !== 'VERWIJDER MIJN ACCOUNT') {
      toast({
        title: 'Bevestiging vereist',
        description: 'Typ "VERWIJDER MIJN ACCOUNT" om door te gaan.',
        variant: 'destructive',
      });
      return;
    }

    setIsDeletingAccount(true);

    try {
      // Use the comprehensive account deletion service
      const result = await userService.deleteOwnAccount();

      if (result.error) {
        throw new Error(result.error.message || 'Fout bij verwijderen van account');
      }

      // Sign out the user from the frontend
      await supabase.auth.signOut();

      toast({
        title: 'Account verwijderd',
        description: result.data?.emailSent
          ? 'Je account is succesvol verwijderd. Je ontvangt een bevestigingsmail.'
          : 'Je account is succesvol verwijderd.',
      });

      // Redirect to home page
      navigate('/');
    } catch (error) {
      console.error('Account deletion error:', error);
      toast({
        title: 'Fout bij verwijderen',
        description: error instanceof Error ? error.message : 'Er is een fout opgetreden bij het verwijderen van je account.',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteDialog(false);
      setDeleteConfirmation('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <Button
            onClick={() => navigate('/huurder-dashboard')}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Terug naar Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Instellingen</h1>
          <p className="text-gray-600 mt-2">Beheer je account en voorkeuren</p>
        </div>

        <div className="space-y-6">
          {/* Password Reset Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="mr-2 h-5 w-5" />
                Wachtwoord Wijzigen
              </CardTitle>
              <CardDescription>
                Reset je wachtwoord via e-mail verificatie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Klik op de knop hieronder om een wachtwoord reset link naar je e-mailadres te sturen.
              </p>
              <Button
                onClick={() => setShowPasswordReset(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Wachtwoord Resetten
              </Button>
            </CardContent>
          </Card>

          {/* Email Update Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="mr-2 h-5 w-5" />
                E-mailadres Bijwerken
              </CardTitle>
              <CardDescription>
                Wijzig je e-mailadres voor account toegang
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmailUpdate} className="space-y-4">
                {emailError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{emailError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="current-email">Huidig e-mailadres</Label>
                  <Input
                    id="current-email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-gray-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-email">Nieuw e-mailadres</Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="nieuw@email.nl"
                    required
                    disabled={isUpdatingEmail}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="current-password">Huidig wachtwoord</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Voer je huidige wachtwoord in"
                    required
                    disabled={isUpdatingEmail}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isUpdatingEmail}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isUpdatingEmail ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Bijwerken...
                    </>
                  ) : (
                    'E-mailadres Bijwerken'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Deletion Section */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <Trash2 className="mr-2 h-5 w-5" />
                Account Verwijderen
              </CardTitle>
              <CardDescription>
                Verwijder permanent je account en alle bijbehorende gegevens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Waarschuwing:</strong> Deze actie kan niet ongedaan worden gemaakt.
                    Al je gegevens, inclusief profiel, berichten en documenten zullen permanent worden verwijderd.
                  </AlertDescription>
                </Alert>

                <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-red-600 hover:bg-red-700 text-white">
                      Account Verwijderen
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Account Verwijderen</DialogTitle>
                      <DialogDescription>
                        Typ "VERWIJDER MIJN ACCOUNT" om te bevestigen dat je je account wilt verwijderen.
                        Deze actie is permanent en kan niet ongedaan worden gemaakt.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder="Typ hier de bevestiging"
                        className="font-mono"
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowDeleteDialog(false)}
                        disabled={isDeletingAccount}
                      >
                        Annuleren
                      </Button>
                      <Button
                        onClick={handleAccountDeletion}
                        disabled={isDeletingAccount || deleteConfirmation !== 'VERWIJDER MIJN ACCOUNT'}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        {isDeletingAccount ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Verwijderen...
                          </>
                        ) : (
                          'Account Verwijderen'
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Password Reset Modal */}
      <Dialog open={showPasswordReset} onOpenChange={setShowPasswordReset}>
        <DialogContent className="sm:max-w-md">
          <ResetPasswordForm onBack={() => setShowPasswordReset(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default withAuth(InstellingenPage, "huurder");
