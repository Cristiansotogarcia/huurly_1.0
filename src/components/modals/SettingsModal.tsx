import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import { userService } from '@/services/UserService';
import { User, Settings, Bell, Shield, CreditCard } from 'lucide-react';
import UnifiedModal from './UnifiedModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Profile settings state
  const [profileData, setProfileData] = useState({
    naam: user?.name || '',
    telefoon: user?.user_metadata?.telefoon || '',
    email: user?.email || ''
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    propertyAlerts: true,
    messageNotifications: true
  });

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    profileVisible: true,
    showPhoneNumber: false,
    allowDirectMessages: true,
    dataProcessing: true
  });

  const handleProfileUpdate = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const result = await userService.updateProfile(user.id, {
        voornaam: profileData.naam.split(' ')[0],
        achternaam: profileData.naam.split(' ').slice(1).join(' '),
        telefoon: profileData.telefoon
      });

      if (result.success && result.data) {
        toast({
          title: 'Profiel bijgewerkt',
          description: 'Je profielgegevens zijn succesvol bijgewerkt.',
        });
      } else {
        throw new Error(result.error?.message || 'Onbekende fout');
      }
    } catch (error) {
      toast({
        title: 'Fout bij bijwerken',
        description: 'Er is een fout opgetreden bij het bijwerken van je profiel.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = () => {
    // TODO: Implement notification settings update
    toast({
      title: 'Notificatie-instellingen bijgewerkt',
      description: 'Je notificatie-instellingen zijn opgeslagen.',
    });
  };

  const handlePrivacyUpdate = () => {
    // TODO: Implement privacy settings update
    toast({
      title: 'Privacy-instellingen bijgewerkt',
      description: 'Je privacy-instellingen zijn opgeslagen.',
    });
  };

  return (
    <UnifiedModal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title="Instellingen"
      size="lg"
      footer={
        <div className="flex justify-end space-x-2">
          <Button onClick={onClose} variant="outline">
            Annuleren
          </Button>
          <Button type="submit" form="settings-form" variant="default">
            Opslaan
          </Button>
        </div>
      }
    >
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="profile" className="text-xs sm:text-sm p-2 sm:p-3">
            <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Profiel</span>
            <span className="xs:hidden">Prof</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs sm:text-sm p-2 sm:p-3">
            <Bell className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Meldingen</span>
            <span className="xs:hidden">Meld</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="text-xs sm:text-sm p-2 sm:p-3">
            <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Privacy</span>
            <span className="xs:hidden">Priv</span>
          </TabsTrigger>
          <TabsTrigger value="subscription" className="text-xs sm:text-sm p-2 sm:p-3">
            <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Abonnement</span>
            <span className="xs:hidden">Abo</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="naam">Naam</Label>
              <Input
                id="naam"
                value={profileData.naam}
                onChange={(e) => setProfileData({ ...profileData, naam: e.target.value })}
                placeholder="Je volledige naam"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mailadres</Label>
              <Input
                id="email"
                value={profileData.email}
                disabled
                placeholder="E-mailadres kan niet worden gewijzigd"
              />
              <p className="text-sm text-gray-500">
                Om je e-mailadres te wijzigen, neem contact op met de klantenservice.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefoon">Telefoonnummer</Label>
              <Input
                id="telefoon"
                value={profileData.telefoon}
                onChange={(e) => setProfileData({ ...profileData, telefoon: e.target.value })}
                placeholder="+31 6 12345678"
              />
            </div>

            <Button onClick={handleProfileUpdate} disabled={loading} className="w-full">
              {loading ? 'Bezig met opslaan...' : 'Profiel bijwerken'}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-3 sm:space-y-4 mt-4">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5 flex-1">
                <Label htmlFor="email-notifications" className="text-sm sm:text-base">E-mailnotificaties</Label>
                <p className="text-xs sm:text-sm text-gray-500">Ontvang belangrijke updates via e-mail</p>
              </div>
              <Switch
                id="email-notifications"
                checked={notificationSettings.emailNotifications}
                onCheckedChange={(checked) => 
                  setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                }
                className="mt-1 sm:mt-0"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">Push notificaties</Label>
                <p className="text-sm text-gray-500">Ontvang realtime meldingen in je browser</p>
              </div>
              <Switch
                id="push-notifications"
                checked={notificationSettings.pushNotifications}
                onCheckedChange={(checked) => 
                  setNotificationSettings({ ...notificationSettings, pushNotifications: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="property-alerts">Woning alerts</Label>
                <p className="text-sm text-gray-500">Krijg meldingen over nieuwe woningen</p>
              </div>
              <Switch
                id="property-alerts"
                checked={notificationSettings.propertyAlerts}
                onCheckedChange={(checked) => 
                  setNotificationSettings({ ...notificationSettings, propertyAlerts: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="message-notifications">Berichtnotificaties</Label>
                <p className="text-sm text-gray-500">Ontvang meldingen bij nieuwe berichten</p>
              </div>
              <Switch
                id="message-notifications"
                checked={notificationSettings.messageNotifications}
                onCheckedChange={(checked) => 
                  setNotificationSettings({ ...notificationSettings, messageNotifications: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="marketing-emails">Marketing e-mails</Label>
                <p className="text-sm text-gray-500">Ontvang tips en aanbiedingen</p>
              </div>
              <Switch
                id="marketing-emails"
                checked={notificationSettings.marketingEmails}
                onCheckedChange={(checked) => 
                  setNotificationSettings({ ...notificationSettings, marketingEmails: checked })
                }
              />
            </div>

            <Button onClick={handleNotificationUpdate} className="w-full">
              Notificatie-instellingen opslaan
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </UnifiedModal>
  );
};

export default SettingsModal;
