import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import { UserService } from '@/services/UserService';
import { User, Settings, Bell, Shield, CreditCard } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Profile settings state
  const [profileData, setProfileData] = useState({
    naam: user?.naam || '',
    telefoon: user?.telefoon || '',
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
      const result = await UserService.updateUser(user.id, {
        naam: profileData.naam,
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Instellingen</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              Profiel
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              Meldingen
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="w-4 h-4 mr-2" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="subscription">
              <CreditCard className="w-4 h-4 mr-2" />
              Abonnement
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

          <TabsContent value="notifications" className="space-y-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">E-mailnotificaties</Label>
                  <p className="text-sm text-gray-500">Ontvang belangrijke updates via e-mail</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                  }
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

          <TabsContent value="privacy" className="space-y-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="profile-visible">Profiel zichtbaar</Label>
                  <p className="text-sm text-gray-500">Laat verhuurders je profiel zien</p>
                </div>
                <Switch
                  id="profile-visible"
                  checked={privacySettings.profileVisible}
                  onCheckedChange={(checked) => 
                    setPrivacySettings({ ...privacySettings, profileVisible: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-phone">Telefoonnummer tonen</Label>
                  <p className="text-sm text-gray-500">Toon je telefoonnummer aan verhuurders</p>
                </div>
                <Switch
                  id="show-phone"
                  checked={privacySettings.showPhoneNumber}
                  onCheckedChange={(checked) => 
                    setPrivacySettings({ ...privacySettings, showPhoneNumber: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="direct-messages">Directe berichten toestaan</Label>
                  <p className="text-sm text-gray-500">Verhuurders kunnen je direct berichten sturen</p>
                </div>
                <Switch
                  id="direct-messages"
                  checked={privacySettings.allowDirectMessages}
                  onCheckedChange={(checked) => 
                    setPrivacySettings({ ...privacySettings, allowDirectMessages: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="data-processing">Gegevensverwerking</Label>
                  <p className="text-sm text-gray-500">Sta verwerking van gegevens toe voor matching</p>
                </div>
                <Switch
                  id="data-processing"
                  checked={privacySettings.dataProcessing}
                  onCheckedChange={(checked) => 
                    setPrivacySettings({ ...privacySettings, dataProcessing: checked })
                  }
                />
              </div>

              <Button onClick={handlePrivacyUpdate} className="w-full">
                Privacy-instellingen opslaan
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-4">
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Huidig abonnement</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Je hebt een actief jaarabonnement voor €65 per jaar.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => window.open('/subscription', '_blank')}
                  className="w-full"
                >
                  Abonnement beheren
                </Button>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2 text-blue-900">Voordelen van je abonnement</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Zichtbaar voor alle verhuurders</li>
                  <li>• Ongelimiteerde aanvragen</li>
                  <li>• Prioriteit in zoekresultaten</li>
                  <li>• Direct messaging met verhuurders</li>
                  <li>• Documentverificatie service</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};