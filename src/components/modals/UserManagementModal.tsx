import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Mail, 
  Calendar,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Activity,
  Ban,
  UserCheck
} from 'lucide-react';
import { BaseModal, BaseModalActions, useModalState } from './BaseModal';

interface UserManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
  onUpdateUser: (userId: string, updates: any) => void;
  onSuspendUser: (userId: string, reason: string) => void;
  onActivateUser: (userId: string) => void;
}

const UserManagementModal = ({ 
  open, 
  onOpenChange, 
  user,
  onUpdateUser,
  onSuspendUser,
  onActivateUser
}: UserManagementModalProps) => {
  const { toast } = useToast();
  const { isSubmitting, setIsSubmitting } = useModalState();
  const [suspensionReason, setSuspensionReason] = useState('');
  const [showSuspensionForm, setShowSuspensionForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState(user || {});

  const handleSuspendUser = () => {
    if (!suspensionReason.trim()) {
      toast({
        title: "Reden vereist",
        description: "Voer een reden in voor schorsing van de gebruiker.",
        variant: "destructive"
      });
      return;
    }

    onSuspendUser(user.id, suspensionReason);
    setShowSuspensionForm(false);
    setSuspensionReason('');
    onOpenChange(false);
  };

  const handleActivateUser = () => {
    onActivateUser(user.id);
    onOpenChange(false);
  };

  const handleSaveChanges = () => {
    onUpdateUser(user.id, editedUser);
    setEditMode(false);
    onOpenChange(false);
  };

  const getUserStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserRoleColor = (role: string) => {
    switch (role) {
      case 'huurder':
        return 'bg-blue-100 text-blue-800';
      case 'verhuurder':
        return 'bg-orange-100 text-orange-800';
      case 'beoordelaar':
        return 'bg-purple-100 text-purple-800';
      case 'beheerder':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Mock activity data
  const userActivity = [
    {
      id: 1,
      action: 'Ingelogd',
      timestamp: '2024-01-20T14:30:00Z',
      details: 'Succesvol ingelogd via web interface'
    },
    {
      id: 2,
      action: 'Profiel bijgewerkt',
      timestamp: '2024-01-20T10:15:00Z',
      details: 'Contactgegevens gewijzigd'
    },
    {
      id: 3,
      action: 'Document geüpload',
      timestamp: '2024-01-19T16:45:00Z',
      details: 'Identiteitsbewijs toegevoegd'
    }
  ];

  if (!user) {
    return null;
  }

  return (
    <BaseModal
      open={open}
      onOpenChange={onOpenChange}
      title={`Gebruiker Beheer - ${user.name}`}
      icon={User}
      size="4xl"
    >
      <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profiel</TabsTrigger>
            <TabsTrigger value="activity">Activiteit</TabsTrigger>
            <TabsTrigger value="documents">Documenten</TabsTrigger>
            <TabsTrigger value="actions">Acties</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* User Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Gebruiker Informatie
                    </CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditMode(!editMode)}
                    >
                      {editMode ? 'Annuleren' : 'Bewerken'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editMode ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Naam</Label>
                        <Input
                          id="name"
                          value={editedUser.name || ''}
                          onChange={(e) => setEditedUser(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                          id="email"
                          value={editedUser.email || ''}
                          onChange={(e) => setEditedUser(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="role">Rol</Label>
                        <Select 
                          value={editedUser.role || ''} 
                          onValueChange={(value) => setEditedUser(prev => ({ ...prev, role: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="huurder">Huurder</SelectItem>
                            <SelectItem value="verhuurder">Verhuurder</SelectItem>
                            <SelectItem value="beoordelaar">Beoordelaar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleSaveChanges} className="w-full">
                        Wijzigingen Opslaan
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Naam:</span>
                        <span className="font-medium">{user.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">E-mail:</span>
                        <span className="font-medium">{user.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rol:</span>
                        <Badge className={getUserRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <Badge className={getUserStatusColor(user.status || 'active')}>
                          {user.status === 'active' ? 'Actief' : 
                           user.status === 'suspended' ? 'Geschorst' : 'In behandeling'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Geregistreerd:</span>
                        <span className="font-medium">
                          {new Date(user.createdAt || Date.now()).toLocaleDateString('nl-NL')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Laatste login:</span>
                        <span className="font-medium">
                          {new Date(user.lastLogin || Date.now()).toLocaleDateString('nl-NL')}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Account Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-4 h-4 mr-2" />
                    Account Statistieken
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">12</p>
                      <p className="text-sm text-gray-600">Totaal Acties</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">8</p>
                      <p className="text-sm text-gray-600">Succesvol</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">3</p>
                      <p className="text-sm text-gray-600">In behandeling</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">1</p>
                      <p className="text-sm text-gray-600">Afgewezen</p>
                    </div>
                  </div>
                  
                  {user.role === 'verhuurder' && (
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Actieve panden:</span>
                        <span className="font-medium">3</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bezichtigingen:</span>
                        <span className="font-medium">15</span>
                      </div>
                    </div>
                  )}
                  
                  {user.role === 'huurder' && (
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Aanvragen:</span>
                        <span className="font-medium">7</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bezichtigingen:</span>
                        <span className="font-medium">4</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Recente Activiteit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Activity className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{activity.action}</h4>
                        <p className="text-sm text-gray-600">{activity.details}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.timestamp).toLocaleString('nl-NL')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Documenten Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-6 h-6 text-blue-600" />
                      <div>
                        <h4 className="font-medium">Identiteitsbewijs</h4>
                        <p className="text-sm text-gray-600">Geüpload op 20 jan 2024</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Goedgekeurd
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-6 h-6 text-blue-600" />
                      <div>
                        <h4 className="font-medium">Loonstrook</h4>
                        <p className="text-sm text-gray-600">Geüpload op 19 jan 2024</p>
                      </div>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">
                      <Clock className="w-3 h-3 mr-1" />
                      In behandeling
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Beheerder Acties
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.status === 'active' ? (
                  <div>
                    <h4 className="font-medium mb-2">Gebruiker Schorsing</h4>
                    {!showSuspensionForm ? (
                      <Button 
                        variant="destructive" 
                        onClick={() => setShowSuspensionForm(true)}
                        className="w-full"
                      >
                        <Ban className="w-4 h-4 mr-2" />
                        Gebruiker Schorsen
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <Label htmlFor="suspension-reason">Reden voor schorsing</Label>
                        <Textarea
                          id="suspension-reason"
                          value={suspensionReason}
                          onChange={(e) => setSuspensionReason(e.target.value)}
                          placeholder="Geef een duidelijke reden voor de schorsing..."
                          rows={3}
                        />
                        <div className="flex space-x-2">
                          <Button 
                            variant="destructive" 
                            onClick={handleSuspendUser}
                            className="flex-1"
                          >
                            Bevestig Schorsing
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setShowSuspensionForm(false)}
                            className="flex-1"
                          >
                            Annuleren
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <h4 className="font-medium mb-2">Gebruiker Activeren</h4>
                    <Button 
                      onClick={handleActivateUser}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      Gebruiker Activeren
                    </Button>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Andere Acties</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">
                      <Mail className="w-4 h-4 mr-2" />
                      E-mail Versturen
                    </Button>
                    <Button variant="outline" className="w-full">
                      <FileText className="w-4 h-4 mr-2" />
                      Activiteit Rapport
                    </Button>
                    <Button variant="outline" className="w-full">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Waarschuwing Versturen
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <BaseModalActions
          cancelAction={{
            label: "Sluiten",
            onClick: () => onOpenChange(false)
          }}
        />
      </BaseModal>
  );
};

export default UserManagementModal;
