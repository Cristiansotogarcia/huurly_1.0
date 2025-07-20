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
      <Tabs defaultValue="profile" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 text-xs sm:text-sm">
            <TabsTrigger value="profile" className="px-2 sm:px-4">Profiel</TabsTrigger>
            <TabsTrigger value="activity" className="px-2 sm:px-4">Activiteit</TabsTrigger>
            <TabsTrigger value="documents" className="px-2 sm:px-4">Documenten</TabsTrigger>
            <TabsTrigger value="actions" className="px-2 sm:px-4">Acties</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* User Info */}
              <Card>
                <CardHeader className="pb-3 sm:pb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                    <CardTitle className="flex items-center text-base sm:text-lg">
                      <User className="w-4 h-4 mr-2" />
                      Gebruiker Informatie
                    </CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditMode(!editMode)}
                      className="w-full sm:w-auto text-xs sm:text-sm"
                    >
                      {editMode ? 'Annuleren' : 'Bewerken'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 pt-0">
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
                      <Button onClick={handleSaveChanges} className="w-full text-sm sm:text-base">
                        Wijzigingen Opslaan
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                        <span className="text-sm text-gray-600">Naam:</span>
                        <span className="font-medium text-sm break-words">{user.name}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                        <span className="text-sm text-gray-600">E-mail:</span>
                        <span className="font-medium text-sm break-all">{user.email}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                        <span className="text-sm text-gray-600">Rol:</span>
                        <Badge className={`${getUserRoleColor(user.role)} text-xs w-fit`}>
                          {user.role}
                        </Badge>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                        <span className="text-sm text-gray-600">Status:</span>
                        <Badge className={`${getUserStatusColor(user.status || 'active')} text-xs w-fit`}>
                          {user.status === 'active' ? 'Actief' : 
                           user.status === 'suspended' ? 'Geschorst' : 'In behandeling'}
                        </Badge>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                        <span className="text-sm text-gray-600">Geregistreerd:</span>
                        <span className="font-medium text-sm">
                          {new Date(user.createdAt || Date.now()).toLocaleDateString('nl-NL')}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                        <span className="text-sm text-gray-600">Laatste login:</span>
                        <span className="font-medium text-sm">
                          {new Date(user.lastLogin || Date.now()).toLocaleDateString('nl-NL')}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Account Statistics */}
              <Card>
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="flex items-center text-base sm:text-lg">
                    <Activity className="w-4 h-4 mr-2" />
                    Account Statistieken
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 pt-0">
                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <div className="text-center p-2 sm:p-3 bg-blue-50 rounded-lg">
                      <p className="text-lg sm:text-2xl font-bold text-blue-600">12</p>
                      <p className="text-xs sm:text-sm text-gray-600">Totaal Acties</p>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg">
                      <p className="text-lg sm:text-2xl font-bold text-green-600">8</p>
                      <p className="text-xs sm:text-sm text-gray-600">Succesvol</p>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-orange-50 rounded-lg">
                      <p className="text-lg sm:text-2xl font-bold text-orange-600">3</p>
                      <p className="text-xs sm:text-sm text-gray-600">In behandeling</p>
                    </div>
                    <div className="text-center p-2 sm:p-3 bg-red-50 rounded-lg">
                      <p className="text-lg sm:text-2xl font-bold text-red-600">1</p>
                      <p className="text-xs sm:text-sm text-gray-600">Afgewezen</p>
                    </div>
                  </div>
                  
                  {user.role === 'verhuurder' && (
                    <div className="mt-3 sm:mt-4 space-y-1 sm:space-y-2">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                        <span className="text-sm text-gray-600">Actieve panden:</span>
                        <span className="font-medium text-sm">3</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                        <span className="text-sm text-gray-600">Bezichtigingen:</span>
                        <span className="font-medium text-sm">15</span>
                      </div>
                    </div>
                  )}
                  
                  {user.role === 'huurder' && (
                    <div className="mt-3 sm:mt-4 space-y-1 sm:space-y-2">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                        <span className="text-sm text-gray-600">Aanvragen:</span>
                        <span className="font-medium text-sm">7</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                        <span className="text-sm text-gray-600">Bezichtigingen:</span>
                        <span className="font-medium text-sm">4</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <Clock className="w-4 h-4 mr-2" />
                  Recente Activiteit
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 sm:space-y-4">
                  {userActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 border rounded-lg">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm sm:text-base">{activity.action}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 break-words">{activity.details}</p>
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

          <TabsContent value="documents" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <FileText className="w-4 h-4 mr-2" />
                  Documenten Status
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-2 sm:p-3 border rounded-lg">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <h4 className="font-medium text-sm sm:text-base">Identiteitsbewijs</h4>
                        <p className="text-xs sm:text-sm text-gray-600">Geüpload op 20 jan 2024</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 text-xs w-fit">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Goedgekeurd
                    </Badge>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 p-2 sm:p-3 border rounded-lg">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <h4 className="font-medium text-sm sm:text-base">Loonstrook</h4>
                        <p className="text-xs sm:text-sm text-gray-600">Geüpload op 19 jan 2024</p>
                      </div>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800 text-xs w-fit">
                      <Clock className="w-3 h-3 mr-1" />
                      In behandeling
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <Shield className="w-4 h-4 mr-2" />
                  Beheerder Acties
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 pt-0">
                {user.status === 'active' ? (
                  <div>
                    <h4 className="font-medium mb-2 text-sm sm:text-base">Gebruiker Schorsing</h4>
                    {!showSuspensionForm ? (
                      <Button 
                        variant="destructive" 
                        onClick={() => setShowSuspensionForm(true)}
                        className="w-full text-sm sm:text-base"
                      >
                        <Ban className="w-4 h-4 mr-2" />
                        Gebruiker Schorsen
                      </Button>
                    ) : (
                      <div className="space-y-2 sm:space-y-3">
                        <Label htmlFor="suspension-reason" className="text-sm">Reden voor schorsing</Label>
                        <Textarea
                          id="suspension-reason"
                          value={suspensionReason}
                          onChange={(e) => setSuspensionReason(e.target.value)}
                          placeholder="Geef een duidelijke reden voor de schorsing..."
                          rows={3}
                          className="text-sm"
                        />
                        <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
                          <Button 
                            variant="destructive" 
                            onClick={handleSuspendUser}
                            className="flex-1 text-sm sm:text-base"
                          >
                            Bevestig Schorsing
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setShowSuspensionForm(false)}
                            className="flex-1 text-sm sm:text-base"
                          >
                            Annuleren
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <h4 className="font-medium mb-2 text-sm sm:text-base">Gebruiker Activeren</h4>
                    <Button 
                      onClick={handleActivateUser}
                      className="w-full bg-green-600 hover:bg-green-700 text-sm sm:text-base"
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      Gebruiker Activeren
                    </Button>
                  </div>
                )}

                <div className="border-t pt-3 sm:pt-4">
                  <h4 className="font-medium mb-2 text-sm sm:text-base">Andere Acties</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full text-sm sm:text-base">
                      <Mail className="w-4 h-4 mr-2" />
                      E-mail Versturen
                    </Button>
                    <Button variant="outline" className="w-full text-sm sm:text-base">
                      <FileText className="w-4 h-4 mr-2" />
                      Activiteit Rapport
                    </Button>
                    <Button variant="outline" className="w-full text-sm sm:text-base">
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
